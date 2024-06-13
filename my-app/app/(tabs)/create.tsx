import { Camera } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/database';

export default function CreateScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [imagePadding, setImagePadding] = useState(0);
  const [ratio, setRatio] = useState('4:3'); // 預設為 4:3
  const { height, width } = Dimensions.get('window');
  const screenRatio = height / width;
  const [isRatioSet, setIsRatioSet] = useState(false);
  const [video, setVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const database = firebase.database();

  const navigation = useNavigation<any>();

  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      setHasPermission(null);
      setCamera(null);
      setIsRecording(false);
      setVideo(null);
    });
    return focus;
  }, [navigation]);

  useEffect(() => {
    (async () => {
      if (!camera) {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        const microphoneStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasPermission(cameraStatus.status === 'granted' && microphoneStatus.status === 'granted');
      }
    })();
  }, [camera, navigation.isFocused()]);

  // set the camera ratio and padding.
  const prepareRatio = async () => {
    let desiredRatio = '4:3';

    // This issue only affects Android
    if (Platform.OS === 'android') {
      const ratios = await camera?.getSupportedRatiosAsync();

      // Calculate the width/height of each of the supported camera ratios
      // These width/height are measured in landscape mode
      // find the ratio that is closest to the screen ratio without going over
      let distances : any = {};
      let realRatios : any = {};
      let minDistance = null;
      for (const ratio of ratios ?? []) {
        const parts = ratio.split(':');
        const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
        realRatios[ratio] = realRatio;
        // ratio can't be taller than screen, so we don't want an abs()
        const distance = screenRatio - realRatio;
        distances[ratio] = distance;
        if (minDistance == null) {
          minDistance = ratio;
        } else {
          if (distance >= 0 && distance < distances[minDistance]) {
            minDistance = ratio;
          }
        }
      }
      
      desiredRatio = minDistance ?? '4:3';
      //  calculate the difference between the camera width and the screen height
      const remainder = Math.floor((height - realRatios[desiredRatio] * width) / 2);
      // set the preview padding and preview ratio
      setImagePadding(remainder);
      setRatio(desiredRatio);
      // Set a flag so we don't do this 
      // calculation each time the screen refreshes
      setIsRatioSet(true);
    }
  };

  // the camera must be loaded in order to access the supported ratios
  const setCameraReady = async () => {
    if (!isRatioSet && camera) {
      await prepareRatio();
    }
  };

  const recordVideo = async () => {
    if (camera) {
      setIsRecording(true);
      camera.recordAsync().then((recordedVideo) => {
        setVideo(recordedVideo);
        setIsRecording(false);
      });
    }
  }

  const stopRecording = async () => {
    if (camera) {
      setIsRecording(false);
      camera.stopRecording();
    }
  }

  if (hasPermission === null) {
    return (
      <View style={styles.information}>
        <Text>Waiting for camera and microphone permissions</Text>
      </View>
    );
  } else if (hasPermission === false) {
    return (
      <View style={styles.information}>
        <Text>No access to camera and microphone</Text>
      </View>
    );
  }

  // 上傳影片到 Firebase
  const uploadVideoToFirebase = async (videoUri: string) => {
    try {
      // uploadVideoToStorage
      setIsLoading(true); // 設置 loading 為 true
      const response = await fetch(videoUri);
      const blob = await response.blob();
      const currentDate = new Date().toLocaleString('sv');
      // if (Platform.OS === 'ios'){
      //   const videoName = `${currentDate}`
      // }
      const videoName = `${currentDate}.mp4`
      const fileName = `videos/${videoName}`;
      const ref = firebase.storage().ref().child(fileName);
      await ref.put(blob); // 在這裡開始 loading
      setIsLoading(false); // 上傳成功,設置 loading 為 false
      console.log('影片已成功上傳到 Firebase Storage');
      Alert.alert('Notification', 'Video Upload Successful', [
        {text: 'OK', onPress: () => navigation.navigate('history', { screen: 'index', params: { id: currentDate } })},
      ]);

      // uploadVideoToDatebase
      const downloadUrl = await ref.getDownloadURL();
      const newVideoRef = database.ref('videos/').push();
      await newVideoRef.set({
        videoURLs: downloadUrl,
        filename: currentDate,
        status: 'processing',
      });
      
    } catch (error) {
      setIsLoading(false); // 錯誤時也設置 loading 為 false
      console.error('上傳影片到 Firebase Storage 時發生錯誤:', error);
      throw error;
    }
  }
  
  if (video) {
    const saveVideo = async () => {  
      await uploadVideoToFirebase(video.uri);
      setVideo(null); // Clear the recorded video after saving
    }

    const discardVideo = async () => {
      setVideo(null); // Clear the recorded video
    }

    return ( // Use return to render the JSX when video is available
      <View style={styles.videoInformation}>
        <Video
          source={{ uri: video.uri }}
          style={styles.video}
          useNativeControls={true}
          shouldPlay
          isLooping
        />
        <View style={styles.twoButtonContainer}>
          <View style={styles.buttonLeft}>
            <Button title='Save' onPress={saveVideo} />
          </View>
          <View style={styles.buttonRight}>
            <Button title='Discard' onPress={discardVideo} />
          </View>
        </View>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={[styles.cameraPreview, { marginTop: imagePadding, marginBottom: imagePadding }]}
        onCameraReady={setCameraReady}
        ratio={ratio}
        ref={(ref) => setCamera(ref)}
      >
        <View style={styles.buttonContainer}>
          <Button title={isRecording ? 'Stop' : 'Record'} onPress={isRecording? stopRecording : recordVideo} />
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  information: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  cameraPreview: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    // alignItems: 'center',
  },
  videoInformation: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  twoButtonContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row', // 將子元素水平排列
    paddingHorizontal: 20, // 水平內邊距，可根據需要調整
  },
  buttonLeft: {
    flex: 1, // 佔據父容器的一半寬度
    marginRight: 10,

  },
  buttonRight: {
    flex: 1, // 佔據父容器的一半寬度
    marginLeft: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});