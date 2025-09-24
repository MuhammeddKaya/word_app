import React from 'react';
import { SafeAreaView, Text, StyleSheet, Switch, View, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useData } from './lib/DataProvider';
import { useRouter } from 'expo-router';

const COLORS = [
  { name: 'Mavi', value: '#647FBC' },
  { name: 'Yeşil', value: '#4CA3A3' },
  { name: 'Turuncu', value: '#FFB347' },
  { name: 'Kırmızı', value: '#E74C3C' },
  { name: 'Mor', value: '#8F5FE8' },
];

export default function Settings() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [templateColor, setTemplateColor] = React.useState(COLORS[0].value);

  const { data, wipeProgressOnly } = useData();
  const router = useRouter();

  // Veriyi dışa aktar
  const handleExport = async () => {
    try {
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'wordify_export.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
    } catch (e) {
      Alert.alert('Hata', 'Veri dışa aktarılırken bir hata oluştu.');
    }
  };

  // Tüm ilerlemeyi sıfırla
  const handleWipeProgress = () => {
    Alert.alert(
      'Dikkat',
      'Tüm ilerlemenizi silmek istediğinizden emin misiniz? Kelime setleriniz silinmeyecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive', onPress: async () => {
            try {
              await wipeProgressOnly();
              Alert.alert('İlerleme silindi', 'Tüm ilerleme verileriniz temizlendi.');
              setTimeout(() => {
                router.replace('/'); // ana sayfaya smooth geçiş
              }, 600);
            } catch (e) {
              Alert.alert('Hata', 'İlerleme silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>

      {/* Dark Mode */}
      <View style={styles.row}>
        <Text style={styles.label}>Koyu Mod</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      {/* Template Color */}
      <View style={styles.section}>
        <Text style={styles.label}>Tema Rengi</Text>
        <View style={styles.paletteRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.colorCircle,
                { backgroundColor: c.value, borderWidth: templateColor === c.value ? 3 : 1, borderColor: templateColor === c.value ? '#222' : '#ccc' }
              ]}
              onPress={() => setTemplateColor(c.value)}
            />
          ))}
        </View>
      </View>

      {/* Export Data */}
      <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
        <Text style={styles.exportText}>Veriyi Dışa Aktar</Text>
      </TouchableOpacity>

      {/* Sadece ilerlemeyi sil */}
      <TouchableOpacity style={styles.wipeBtn} onPress={handleWipeProgress}>
        <Text style={styles.wipeText}>Verileri Sıfırla</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  label: { fontSize: 16, fontWeight: '500', color: '#222' },
  section: { marginBottom: 22 },
  paletteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  colorCircle: {
    width: 32, height: 32, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#ccc'
  },
  exportBtn: {
    backgroundColor: '#4CA3A3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  exportText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  wipeBtn: {
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8
  },
  wipeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});