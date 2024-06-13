import { Tabs, router } from "expo-router";
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const TabsLayout = () => {   
    return (
        <Tabs>
            <Tabs.Screen name='index' options={{
                headerTitle: 'Home',
                headerTitleAlign: 'center',
                title: 'Home',
                tabBarIcon: ({color}) => (
                    <FontAwesome name="home" size={24} color={color} />
                ),
            }}/>
            <Tabs.Screen name='create' options={{
                headerTitle: 'Create',
                headerTitleAlign: 'center',
                title: 'Create',
                tabBarIcon: ({color}) => (
                    <FontAwesome name="plus-square" size={24} color={color} />
                ),
                tabBarStyle: { display: 'none' },
                headerLeft: () => (
                    <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 16 }} 
                        onPress={() => router.back()} title='Back'/>
                ),
            }}/>
            <Tabs.Screen name='history' options={{
                headerTitle: 'History',
                headerTitleAlign: 'center',
                title: 'History',
                headerShown: false,
                tabBarIcon: ({color}) => (
                    <FontAwesome name="history" size={24} color={color} />
                ),
            }}/>
        </Tabs>
    );
};

export default TabsLayout;