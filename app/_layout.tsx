import { Stack } from 'expo-router';
import DataProvider from './lib/DataProvider';

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack>
        <Stack.Screen name="wordtests" />
        <Stack.Screen name="favorites" />
      </Stack>
    </DataProvider>
  );
}
