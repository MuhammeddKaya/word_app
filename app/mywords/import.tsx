import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useData } from '../lib/DataProvider'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../lib/ThemeProvider'

export default function ImportMyWords() {
  const router = useRouter()
  const { importMyWordsFromExcel } = useData()
  const [loading, setLoading] = React.useState(false)
  const { theme } = useTheme();

  const pick = async () => {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', '*/*']
      })

      // support both old { type: 'success', uri, name } and new { canceled, assets: [...] } shapes
      const okOld = res && res.type === 'success'
      const okNew = res && (res.canceled === false) && Array.isArray(res.assets) && res.assets.length > 0
      if (!okOld && !okNew) {
        Alert.alert('İptal', 'Dosya seçimi iptal edildi veya başarısız oldu.')
        return
      }

      // obtain uri/name robustly
      const uri = res.uri ?? (res.assets && res.assets[0] && res.assets[0].uri)
      if (!uri) {
        Alert.alert('Hata', 'Dosya URI bulunamadı.')
        return
      }

      setLoading(true)
      try {
        const info = await importMyWordsFromExcel(uri)
        Alert.alert('İçe aktarma tamam', `${info?.imported ?? 0} kelime eklendi`)
        router.back()
      } catch (e: any) {
        console.warn('import error', e)
        Alert.alert('Hata', `İçe aktarma sırasında hata oluştu:\n${e?.message ?? String(e)}`)
      } finally {
        setLoading(false)
      }
    } catch (e) {
      console.warn('pick error', e)
      Alert.alert('Hata', 'Dosya seçme işlemi başarısız oldu.')
      setLoading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      // create a simple workbook with header + one example row
      const rows = [
        ['ingilizce_kelime', 'turkce_kelime', 'ornek_cumle'],
        ['abundant', 'bol, çok', 'The region has abundant rainfalls in spring.']
      ]

      // dynamic require so bundler won't break if xlsx not installed
      const XLSX = require('xlsx')
      const ws = XLSX.utils.aoa_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

      // write workbook as base64
      const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' })
      const path = `${FileSystem.cacheDirectory}kelime_sablon.xlsx`
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 })

      const ok = await Sharing.isAvailableAsync()
      if (ok) {
        await Sharing.shareAsync(path, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      } else {
        Alert.alert('Bilgi', `Şablon dosyası oluşturuldu: ${path}`)
      }
    } catch (e) {
      console.warn('template download error', e)
      Alert.alert('Hata', 'Şablon indirilemedi. "xlsx" paketi kurulu değilse: npm install xlsx')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#FAF9FF' : '#000000' }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme === 'light' ? '#000' : '#fff' }]}>Excel İle Toplu Kelime Ekleme</Text>
        </View>

        <View style={[styles.templateBox, { backgroundColor: theme === 'light' ? '#fff' : '#262626' }]}>
          <Text style={[styles.templateTitle, { color: theme === 'light' ? '#000' : '#fff' }]}>Örnek Resim</Text>
          <Image source={require('../../assets/images/sablon.png')} style={{ width: '100%', height: 150, resizeMode: 'contain', marginBottom: 8 }} />

          <TouchableOpacity style={styles.templateBtn} onPress={downloadTemplate}>
            <Ionicons name="download" size={16} color={theme === 'light' ? '#fff' : '#000'} />
            <Text style={[styles.templateBtnText, { color: theme === 'light' ? '#fff' : '#000' }]}>Şablonu İndir (.xlsx)</Text>
          </TouchableOpacity>

          <Text style={[styles.note, { color: theme === 'light' ? '#666' : '#ccc' }]}>Not: İlk satır başlık olmalıdır. </Text>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity style={styles.actionBtn} onPress={pick} disabled={loading}>
            <Ionicons name="cloud-upload" size={18} color={theme === 'light' ? '#fff' : '#000'} />
            <Text style={[styles.actionText, { color: theme === 'light' ? '#fff' : '#000' }]}>{loading ? 'Yükleniyor...' : 'Dosya Seç & Yükle'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.helpBtn]} onPress={() => {
            Alert.alert('Şablon', 'Excel yapı: ingilizce_kelime, turkce_kelime, ornek_cumle\nİlk satır başlık olmalıdır.')
          }}>
            <Ionicons name="document-text" size={18} color={theme === 'light' ? '#fff' : '#000'} />
            <Text style={[styles.actionText, { color: theme === 'light' ? '#fff' : '#000' }]}>Şablon Göster</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.hint, { color: theme === 'light' ? '#666' : '#ccc' }]}>Yükleme sonrası kelimeleriniz otomatik olarak "Kelimelerim" altında 10’arlık setlere ayrılacaktır.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#222', textAlign: 'center' },
  subtitle: { color: '#666', marginTop: 6 },

  templateBox: { backgroundColor: '#fff', margin: 4, padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  templateTitle: { fontWeight: '700', marginBottom: 6 },
  templateLine: { fontFamily: 'monospace', color: '#222', marginBottom: 4 },
  note: { color: '#666', marginTop: 8, fontSize: 12 },

  templateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#647FBC', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  templateBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8},

  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CA3A3', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  actionText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  helpBtn: { backgroundColor: '#647FBC' },

  hint: { color: '#666', marginTop: 12, marginHorizontal: 16, fontSize: 13 }
})