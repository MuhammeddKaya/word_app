import React from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useData } from '../../lib/DataProvider'

function parseMeanings(raw: any): string[] {
  if (!raw && raw !== 0) return []
  if (Array.isArray(raw)) return raw.map((s: any) => String(s).trim()).filter(Boolean)
  return String(raw)
    .split(/[;,\/|]/)
    .map(s => s.trim())
    .filter(Boolean)
}

export default function TranslateTest() {
  const { setId } = useLocalSearchParams()
  const router = useRouter()
  const { data, loading, updateSet } = useData()
  const sets = data?.sets ?? null

  const [index, setIndex] = React.useState(0)
  const [input, setInput] = React.useState('')
  // whether the English word is visible (default hidden); TTS plays automatically
  const [showEnglish, setShowEnglish] = React.useState(false)

  React.useEffect(() => {
    setIndex(0)
    setInput('')
    setShowEnglish(false)
  }, [setId])

  const speak = (text?: string) => {
    if (!text) return
    try {
      const Speech = require('expo-speech')
      Speech.speak(text, { language: 'en-US' })
    } catch (e) {
      console.warn('TTS not available', e)
    }
  }

  if (loading || !sets) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    )
  }

  const all = Object.values(sets as Record<string, any[]>).flat()
  const selectedSet = all.find((s: any) => s.id === String(setId))
  if (!selectedSet) {
    return (
      <View style={styles.container}>
        <Text>Set bulunamadı</Text>
      </View>
    )
  }

  const words = selectedSet.words ?? []
  const current = words[index]
  if (!current) {
    return (
      <View style={styles.container}>
        <Text>Kelime yok</Text>
      </View>
    )
  }

  // auto-play the English word when current changes
  React.useEffect(() => {
    setShowEnglish(false)
    setTimeout(() => {
      try { const Speech = require('expo-speech'); Speech.speak(String(current.word), { language: 'en-US' }) } catch (e) { /* ignore */ }
    }, 120)
  }, [current])

  const meanings = parseMeanings(current.meaning)
  const normalizedAnswers = meanings.map(m => m.trim().toLowerCase())

  const handleCheck = async () => {
    const cleaned = String(input || '').trim().toLowerCase()
    if (!cleaned) {
      Alert.alert('Uyarı', 'Lütfen çeviriyi yazın veya Türkçesini gösterin.')
      return
    }
    const ok = normalizedAnswers.some(a => a === cleaned)
    if (ok) {
      // correct
      setInput('')
      setShowEnglish(false)
      if (index < words.length - 1) {
        setIndex(i => i + 1)
        return
      }
      // last word: persist completion
      try {
        const allSets = Object.values(sets as Record<string, any[]>).flat()
        const sel = allSets.find((s: any) => s.id === String(setId))
        if (sel) {
          if (!sel.completedTests) sel.completedTests = { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 }
          sel.completedTests.TranslateTest = 1
          const completedCount = Object.values(sel.completedTests).filter((v: any) => Number(v) > 0).length
          sel.stars = Math.min(4, completedCount)
          await updateSet(sel)
        }
        Alert.alert('Tebrikler', 'Çeviri testi tamamlandı', [{ text: 'Tamam', onPress: () => router.back() }])
      } catch (e) {
        console.warn('Translate finish error', e)
        Alert.alert('Hata', 'Test tamamlanırken hata oluştu')
      }
    } else {
      Alert.alert('Yanlış', 'Cevap yanlış. Tekrar deneyin veya Türkçesini gösterin.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectedSet.title} - Translate</Text>
      <Text style={styles.progress}>{index + 1} / {words.length}</Text>

      <View style={styles.card}>
        <View style={{ alignItems: 'center' }}>
          {showEnglish ? (
            <Text style={styles.word}>{current.word}</Text>
          ) : (
            <Text style={{ color: '#666', marginBottom: 10 }}>Kelime sesli olarak çalındı. Duymadıysanız tekrar çalın veya kelimeyi gösterin.</Text>
          )}

          <View style={styles.row}>
            <TouchableOpacity style={styles.btn} onPress={() => speak(String(current.word))}>
              <Text>🔊 Tekrar Oku</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => setShowEnglish(s => !s)}>
              <Text>{showEnglish ? 'İngilizceyi Gizle' : 'İngilizceyi Göster'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Türkçe karşılığını yazın"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleCheck}
          returnKeyType="done"
        />

        <View style={styles.rowRight}>
          <TouchableOpacity onPress={() => { if (index > 0) { setIndex(i => i - 1); setInput(''); setShowEnglish(false) } }} style={[styles.btn, index === 0 && styles.disabled]} disabled={index === 0}>
            <Text>Önceki</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCheck} style={styles.btn}>
            <Text>{index < words.length - 1 ? 'Kontrol et' : 'Bitir'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#FAFDD6' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  progress: { marginBottom: 8 },
  card: { width: '100%', backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  word: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowRight: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { padding: 10, backgroundColor: '#647FBC', borderRadius: 8, minWidth: 140, alignItems: 'center' },
  ghost: { backgroundColor: '#eee' },
  meaningsBox: { marginTop: 12, padding: 8, backgroundColor: '#fafafa', borderRadius: 6 },
  meaningItem: { color: '#111', marginVertical: 2 },
  input: { marginTop: 12, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
  disabled: { opacity: 0.5 },
})