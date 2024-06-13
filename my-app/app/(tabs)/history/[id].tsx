import { Stack, router, useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text, FlatList, StyleSheet, Alert, Button, TouchableOpacity } from "react-native";
import firebase from 'firebase/compat/app';
import { useEffect, useState } from "react";
import { ResizeMode, Video } from "expo-av";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from "expo-file-system";
import { FontAwesome } from '@expo/vector-icons';
import 'firebase/compat/storage';

export default function Details() {
  const {id} = useLocalSearchParams<{ id: string }>();
  const [videoURLs, setVideoURLs] = useState<any>([]);
  const [processedURLs, setProcessedURLs] = useState<any>([]);
  const [Play, setPlay] = useState(true);
  const [isOrigin, setIsOrigin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const storage = firebase.storage();
  
  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener('focus', () => { setPlay(true); });
    navigation.addListener('blur', () => { setPlay(false); });

    const fetchData = async () => {
      await fetchVideoURLs('videos/');
      await fetchVideoURLs('processed/');
      setIsLoading(false);
    };

    fetchData();
  }, [navigation]);
  
  const fetchVideoURLs = async (path: string) => {
    try {
      const storageRef = storage.ref(path);
      const videosList = await storageRef.listAll();

      const videos = await Promise.all(
        videosList.items.map(async (videoRef) => {
          const name = (await videoRef.getMetadata()).name.replace('.mp4', '');
          const downloadURL = await videoRef.getDownloadURL();
          return { url: downloadURL, name };
        })
      );
  
      if (path === 'videos/') {
        const filteredVideos = videos.filter((video) => video.name === id);
        setVideoURLs(filteredVideos);
      }
  
      if (path === 'processed/') {
        const filteredVideos = videos.filter((video) => video.name === id);
        setProcessedURLs(filteredVideos);
      }
  
    } catch (error) {
      console.error('檢視 Firebase Storage 影片發生錯誤', error);
    }
  }

  const downloadVideo = async (videoURL: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Cannot get the access');
        return;
      }
  
      const fileUri = `${FileSystem.documentDirectory}video_${Date.now()}.mp4`;
      const { uri } = await FileSystem.downloadAsync(videoURL, fileUri);
  
      await MediaLibrary.createAssetAsync(uri);
      console.log('Download video successful!');
      Alert.alert('Notification', 'Video Download Successful', [
        {text: 'OK'},
      ]);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  const deleteVideo = async (videoURL: string) => {
    try {
      const fileUrl = new URL(videoURL);
      const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?')[0]);
      const fileRef = storage.ref().child(filePath);
      await fileRef.delete();
      Alert.alert('Notification', 'Video Delete Successful', [
        {text: 'OK'},
      ]);
      await router.replace('../')
      fetchVideoURLs('videos/');
      console.log(`刪除 ${fileRef} 影片成功`);
    } catch (error) {
      console.error('刪除影片時發生錯誤:', error);
    }
  }

  return (
    <>
    <Stack.Screen options={{ 
      title: `${id}`,
      headerRight: () => (
        <FontAwesome name="trash-o" size={24} style={{ marginRight: 10 }}
          title='Delete'
          color='red'
          onPress={() => deleteVideo(videoURLs[0].url)}/>
      ),
    }}/>
    <Button title={isOrigin ? 'Switch to Processed Video' : 'Switch to Original Video'} onPress={() => setIsOrigin(!isOrigin)} />
    {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={isOrigin ? videoURLs : processedURLs}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.container}>
              <Video
                source={{ uri: item.url }}
                rate={1.0}
                volume={1.0}
                shouldPlay={Play}
                isLooping
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
              />
              <View style={styles.text}>
                <Text>{id}</Text>
              </View>
              <View style={styles.twoButtonContainer}>
                <View style={styles.buttonLeft}>
                  <Button title='Download' onPress={() => downloadVideo(item.url)} />
                </View>
                {/* <View style={styles.buttonRight}>
                  <Button title='Upload' onPress={() => uploadVideo(item.url)}/>
                </View> */}
              </View>
            </View>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    flex: 1,
  },
  video: {
    height: 200,
    aspectRatio: 1,
    marginBottom: 10,
  },
  text: {
    alignItems: 'center',
    marginBottom: 20,
  },
  twoButtonContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row', 
    paddingHorizontal: 20, 
  },
  buttonLeft: {
    flex: 1, 
    marginLeft: 10,
    marginRight: 10,
  },
  buttonRight: {
    flex: 1, 
    marginLeft: 10,
  },
});
