import 'react-native-gesture-handler';
import React from 'react';
import { Text } from 'react-native'; // ← ADD Text here
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import SearchScreen   from './src/screens/SearchScreen';
import ChampionScreen from './src/screens/ChampionScreen';
import ProfileScreen  from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>; // ← was crashing without import
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D1120',
          borderTopColor: '#1E2740',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor:   '#C89B3C',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Champions"
        component={SearchScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon emoji="⚔️" color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0E1A' } }}>
        <Stack.Screen name="Tabs"     component={TabNavigator} />
        <Stack.Screen name="Champion" component={ChampionScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}