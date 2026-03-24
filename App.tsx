import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { StyleSelectionScreen } from './src/screens/StyleSelectionScreen';
import { GenerationScreen } from './src/screens/GenerationScreen';
import { COLORS } from './src/constants/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="StyleSelection" component={StyleSelectionScreen} />
          <Stack.Screen name="Generation" component={GenerationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
