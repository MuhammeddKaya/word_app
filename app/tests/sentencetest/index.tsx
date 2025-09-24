import React from 'react'
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useData } from '../../lib/DataProvider'

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function SentenceTest() {
  const { setId } = useLocalSearchParams()
  const router = useRouter()
  const { data, loading, updateSet } = useData()
  const allSets = Object.values(data?.sets ?? {}).flat()
  const selectedSet = React.useMemo(() => allSets.find((s: any) => s.id === String(setId)), [allSets, setId])

  const words = selectedSet?.words ?? []
  const [index, setIndex] = React.useState(0)
  const [input, setInput] = React.useState('')
  const [showAnswer, setShowAnswer] = React.useState(false)

  React.useEffect(() => {
    setIndex(0)
    setInput('')
  }, [setId])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Yükleniyor...</Text>
      </SafeAreaView>
    )
  }

  if (!selectedSet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Set bulunamadı</Text>
      </SafeAreaView>
    )
  }

  const current = words[index]
  if (!current) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Kelime yok</Text>
      </SafeAreaView>
    )
  }

  const expected = String(current.word ?? '').trim()
  const exampleRaw = String(current.example ?? '').trim()

  // create masked sentence: replace the first exact word occurrence (word boundary, case-insensitive)
  let masked = exampleRaw
  try {
    const re = new RegExp(`\\b${escapeRegExp(expected)}\\b`, 'i')
    if (re.test(exampleRaw)) {
      masked = exampleRaw.replace(re, '_________')
    } else {
      // fallback: replace first occurrence of the longest token that contains expected (loose)
      const looseRe = new RegExp(escapeRegExp(expected), 'i')
      masked = exampleRaw.replace(looseRe, '____')
    }
  } catch (e) {
    masked = exampleRaw.replace(new RegExp(escapeRegExp(expected), 'i'), '____')
  }

  const handleCheck = async () => {
    if (!expected) {
      Alert.alert('Hata', 'Beklenen kelime bulunamadı.')
      return
    }
    if (String(input).trim().toLowerCase() === expected.toLowerCase()) {
      setShowAnswer(true)
      setTimeout(async () => {
        setShowAnswer(false)
        setInput('')
        if (index < words.length - 1) {
          setIndex(i => i + 1)
          return
        }
        // last word: persist completion
        try {
          if (!selectedSet.completedTests) selectedSet.completedTests = { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 }
          (selectedSet.completedTests as any).SentenceTest = 1
          const completedCount = Object.values(selectedSet.completedTests).filter((v: any) => Number(v) > 0).length
          selectedSet.stars = Math.min(4, completedCount)
          await updateSet(selectedSet)
          Alert.alert('Tebrikler', 'Cümle Tamamlama testi tamamlandı', [{ text: 'Tamam', onPress: () => router.back() }])
        } catch (e) {
          console.warn('Sentence finish error', e)
          Alert.alert('Hata', 'Test tamamlanırken hata oluştu')
        }
      }, 2000)
    } else {
      Alert.alert('Yanlış', 'Cevap yanlış. Tekrar deneyin.')
    }
  }

  const goPrev = () => {
    if (index > 0) setIndex(i => i - 1)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{selectedSet.title} - Cümle Tamamlama</Text>
        <Text style={styles.progress}>{index + 1} / {words.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.hint}>Aşağıdaki cümledeki boşluğu doğru kelime ile doldurun:</Text>
        <Text style={styles.sentence}>{masked}</Text>

        {showAnswer && (
          <Text style={styles.answer}>Doğru cevap: <Text style={{ fontWeight: 'bold' }}>{expected}</Text></Text>
        )}

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Kelimeyi yazın"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleCheck}
          returnKeyType="done"
          editable={!showAnswer}
        />

        <View style={styles.controls}>
          <TouchableOpacity onPress={goPrev} style={[styles.btn, index === 0 && styles.disabled]} disabled={index === 0 || showAnswer}>
            <Text style={styles.btnText}>Önceki</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCheck} style={styles.btn} disabled={showAnswer}>
            <Text style={styles.btnText}>{index < words.length - 1 ? 'Kontrol et' : 'Bitir'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#f6f7f8' },
  header: { width: '100%', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  progress: { color: '#666', marginTop: 6 },
  card: { width: '100%', backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  hint: { color: '#666', marginBottom: 20 },
  sentence: { fontSize: 16, marginBottom: 24, color: '#111', alignItems: 'center', textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12, backgroundColor: '#fff' },
  controls: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 12, backgroundColor: '#647FBC', borderRadius: 8, minWidth: 120, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.5 },
  answer: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center'
  }
})