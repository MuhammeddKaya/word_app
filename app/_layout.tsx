import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DataProvider from './lib/DataProvider';
import ThemeProvider, { useTheme } from './lib/ThemeProvider';

function HeaderMenu() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme(); // toggleTheme de aldık

  const iconColor = theme === 'light' ? '#333' : '#fff';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/about')}>
        <Ionicons name="information-circle-outline" size={22} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={22} color={iconColor} />
      </TouchableOpacity>
      {/* Tema değiştirme butonu */}
      <TouchableOpacity style={styles.btn} onPress={toggleTheme}>
        <Ionicons name={theme === 'light' ? 'moon' : 'sunny'} size={22} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

function RootLayoutInner() {
  const { theme } = useTheme();

  const headerBackground = theme === 'light' ? '#ffffff' : '#332f2fff';
  const headerTextColor = theme === 'light' ? '#000000' : '#ffffff';

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerBackground },
        headerTintColor: headerTextColor,
        headerTitle: () => (
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: headerTextColor }}>
            Wordify
          </Text>
        ),
        headerBackTitleVisible: false,
        headerRight: () => <HeaderMenu />,
      }}
    >
      {/* diğer ekranlar route dosyalarına göre burada otomatik yer alır */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DataProvider>
        <RootLayoutInner />
      </DataProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 12, paddingVertical: 6 },
});
