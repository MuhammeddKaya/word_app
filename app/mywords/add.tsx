import React from 'react'
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useData } from '../lib/DataProvider'
import { Ionicons } from '@expo/vector-icons'

export default function AddMyWord() {
  const router = useRouter()
  const { addMyWord } = useData()
  const [word, setWord] = React.useState('')
  const [meaning, setMeaning] = React.useState('')
  const [example, setExample] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSave = async () => {
    if (!word.trim()) { Alert.alert('Hata', 'İngilizce kelime gerekli'); return }
    setLoading(true)
    try {
      await addMyWord({ word: word.trim(), meaning: meaning.trim(), example: example.trim() })
      router.back()
    } catch (e) {
      console.warn(e)
      Alert.alert('Hata', 'Kelime eklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Yeni Kelime Ekle</Text>
          <Text style={styles.subtitle}>Elle ekleme — İngilizce, Türkçe ve örnek cümle</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <Ionicons name="language" size={18} color="#666" style={{ marginRight: 8 }} />
            <TextInput placeholder="İngilizce kelime" value={word} onChangeText={setWord} style={styles.input} autoCapitalize="none" />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="reader" size={18} color="#666" style={{ marginRight: 8 }} />
            <TextInput placeholder="Türkçe anlam" value={meaning} onChangeText={setMeaning} style={styles.input} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="document-text" size={18} color="#666" style={{ marginRight: 8 }} />
            <TextInput placeholder="Örnek cümle" value={example} onChangeText={setExample} style={[styles.input, { height: 90 }]} multiline />
          </View>

          <TouchableOpacity style={[styles.btn, loading && styles.disabled]} onPress={onSave} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => router.back()}>
            <Text style={[styles.btnText, { color: '#333' }]}>İptal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF', padding: 16 },
  header: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#222' },
  subtitle: { color: '#666', marginTop: 4 },

  form: { marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  input: { flex: 1, fontSize: 15, color: '#111' },

  btn: { marginTop: 8, backgroundColor: '#647FBC', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  cancel: { backgroundColor: '#F0F0F0', marginTop: 6 },
  disabled: { opacity: 0.6 }
})