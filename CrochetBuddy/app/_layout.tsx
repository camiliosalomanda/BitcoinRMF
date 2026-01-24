import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProProvider } from '../hooks/usePro';

export default function RootLayout() {
  return (
    <ProProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFF5F8',
          },
          headerTintColor: '#4A4A4A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#FFF5F8',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'Create Pattern',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="pattern" 
          options={{ title: 'My Pattern' }} 
        />
        <Stack.Screen 
          name="my-patterns" 
          options={{ title: 'My Patterns' }} 
        />
        <Stack.Screen 
          name="achievements" 
          options={{ 
            title: 'Achievements',
            presentation: 'modal',
          }} 
        />
      </Stack>
    </ProProvider>
  );
}
