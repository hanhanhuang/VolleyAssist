import { Stack } from "expo-router";

export default function HistoryStack() {
    return (
      <Stack initialRouteName='index'>
        <Stack.Screen name='[id]' options={{ title: 'Video Detail' }}/>
        <Stack.Screen name='index' options={{
            title: 'History',
            headerTitleAlign: 'center'
        }}/>     
      </Stack>
    );
}