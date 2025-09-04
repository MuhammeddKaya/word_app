import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="wordtests" />
      <Stack.Screen name="favorites" />
    </Stack>
  );
}
