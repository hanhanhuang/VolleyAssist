import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as React from 'react';
import { Camera } from 'expo-camera';
import "../history/index";

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = React.useState<null | boolean>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = React.useState<null | boolean>(null);

  React.useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');

      const { status: microphoneStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasMicrophonePermission(microphoneStatus === 'granted');
    })();
  }, []);

  if (hasCameraPermission === null || hasMicrophonePermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false || hasMicrophonePermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
