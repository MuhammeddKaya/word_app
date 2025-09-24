import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DataProvider from './lib/DataProvider';

function HeaderMenu() {
  const router = useRouter();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/about')}>
        <Ionicons name="information-circle-outline" size={22} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack
        screenOptions={{
          headerTitle: 'Wordify',
          headerBackTitleVisible: false,
          headerRight: () => <HeaderMenu />,
        }}
      >

        {/* diğer ekranlar route dosyalarına göre burada yer alır */}
      </Stack>
    </DataProvider>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 12, paddingVertical: 6 },
});
