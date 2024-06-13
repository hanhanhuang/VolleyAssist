import { Link, router } from "expo-router";
import { View, Text, Pressable } from "react-native";

const Page = () => {
  return (
    <View>
      <Text>HomePage</Text>
      {/* <Link href='/history/1'>Go to user 01</Link>
      <Pressable onPress={() => router.push({
        pathname: '/history/[id]',
        params: { id: 2 },
      })}>
        <Text>Go to user 02</Text>
      </Pressable> */}
    </View>
  );
};

export default Page;