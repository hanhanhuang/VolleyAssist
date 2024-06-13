import { View, FlatList, StyleSheet, Text, Pressable } from "react-native";
import { ResizeMode, Video } from 'expo-av';
import firebase from 'firebase/compat/app';
import { useEffect, useState } from "react";
import { Link, Stack, useNavigation, useLocalSearchParams  } from "expo-router";

export default function History(){
  const [videoURLs, setVideoURLs] = useState<any>([]);
  const {id} = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation<any>();
  const storage = firebase.storage(); 
  
  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      fetchVideoURLs();
    });
    if (id) {
      navigation.navigate('history', { screen: '[id]', params: { id: id } });
    }
    return focus;
  }, [navigation, id]);

  const fetchVideoURLs = async () => {
    try {
      const storageRef = storage.ref('videos/');
      const videosList = await storageRef.listAll();

      const videos = await Promise.all(
        videosList.items.map(async (videoRef) => {
          const downloadURL = await videoRef.getDownloadURL();
          const name = (await videoRef.getMetadata()).name.replace('.mp4', '');
          
          return { url: downloadURL, name };
        })
      );

      setVideoURLs(videos);
    } catch (error) {
      console.error('檢視 Firebase Storage 影片發生錯誤', error);
    }
  }

  return (
    <>
    <Stack.Screen options={{ title: 'History' }} />
    <FlatList
      data={videoURLs}
      keyExtractor={(_, index) => index.toString()}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={{ flex: 1, maxWidth: '50%', padding: 5 }}>
          <Link href={`history/${item.name}`} asChild>
            <Pressable style={styles.container}>
              <Video
                source={{ uri: item.url }}
                shouldPlay={false}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
              />
              <View style={styles.text}>
                <Text>{item.name}</Text>
              </View>
            </Pressable>
          </Link>
        </View>
      )}
    />
  </>
  );
}
  
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  video: {
    height: 200,
    aspectRatio: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  text: {
    alignItems: 'center',
    marginBottom: 10,
  }
});