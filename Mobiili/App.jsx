import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import ProfileScreen  from './src/screens/ProfileScreen';
import ChampionScreen from './src/screens/ChampionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0E1A' },
        }}
      >
        {/* Profile is now the root screen — no bottom tabs needed */}
        <Stack.Screen name="Profile"  component={ProfileScreen} />
        {/* Champion detail still reachable if needed later */}
        <Stack.Screen
          name="Champion"
          component={ChampionScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
