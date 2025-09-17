// app/(main)/_layout.tsx
import { Stack } from 'expo-router';
export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="detail"
        options={{ headerShown: true, title: 'File GST & IT Return',
          headerStyle: { backgroundColor: '#FFFFFF' } }}
      />
      <Stack.Screen
        name="create-todo"
        options={{ headerShown: true, title: 'Create Todo',
          headerStyle: { backgroundColor: '#FFFFFF' } }}
      />
    </Stack>
  );
}
