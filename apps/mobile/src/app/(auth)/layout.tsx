
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        presentation: 'card',
        gestureEnabled: true,

        contentStyle: {
          backgroundColor: '#F4F4F1',
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="cadastro"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

