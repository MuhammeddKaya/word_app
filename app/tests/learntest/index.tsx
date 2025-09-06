import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useData } from '../../lib/DataProvider'

export default function LearnTest() {
  const { setId } = useLocalSearchParams()
  const router = useRouter()
  const [index, setIndex] = React.useState(0)
  const { data, loading, updateSet, addToFavorites, removeFromFavorites, isFavorite } = useData()
  const sets = data?.sets ?? null

  React.useEffect(() => {
    setIndex(0)
  }, [setId])

  const all = Object.values(sets as Record<string, any[]>).flat()
  const selectedSet = all.find((s: any) => s.id === String(setId))

  const done = Number(selectedSet?.completedTests?.LearnTest ?? 0) > 0

  const speakWord = (text?: string) => {
    if (!text) return
    try {
      // dynamically require to avoid static resolution errors in environments
      // where expo-speech isn't installed. If you want full typing/install,
      // run: expo install expo-speech
      // then you can change this to a static import for typesafety.
      const Speech = require('expo-speech')
      // request English pronunciation explicitly
      Speech.speak(text, { language: 'en-US' })
    } catch (e) {
      console.warn('TTS error', e)
    }
  }

  React.useEffect(() => {
    return () => {
      try {
        const Speech = require('expo-speech')
        // stop any ongoing speech
        if (Speech && typeof Speech.stop === 'function') Speech.stop()
      } catch (e) { /* ignore */ }
    }
  }, [])

  const goNext = async () => {
    if (index < words.length - 1) {
      setIndex(i => i + 1)
      return
    }

    // if we're at the last word and the test was already completed, go back
    if (done) {
      router.back()
      return
    }

    try {
      if (!selectedSet.completedTests) selectedSet.completedTests = { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 }
      selectedSet.completedTests.LearnTest = 1

      const completedCount = Object.values(selectedSet.completedTests).filter((v: any) => Number(v) > 0).length
      selectedSet.stars = Math.min(4, completedCount)

      // update sets state and persist to file
      // sets yapısına nasıl erişiliyorsa (ör: keys ile) uygun şekilde güncelle
      // burada basitçe id ile bulup değiştiriyoruz:
      const newSets = { ...sets }
      // eğer sets bir object içinde kategori/array'lerse, uygun yerde güncelleyin
      // örnek tüm setleri düz dizi olarak saklıyorsanız farklı olacaktır
      Object.keys(newSets).forEach(k => {
        newSets[k] = (newSets[k] as any[]).map(s => s.id === selectedSet.id ? selectedSet : s)
      })
      // persist via provider
      await updateSet(selectedSet)

      Alert.alert('Tebrikler', 'Test tamamlandı', [
        { text: 'Tamam', onPress: () => router.back() }
      ])
    } catch (e) {
      console.warn('Finish error', e)
      Alert.alert('Hata', 'Test tamamlanırken hata oluştu')
    }
  }

  const goPrev = () => {
    if (index > 0) setIndex(i => i - 1)
  }

  const resetLearnTest = async () => {
    selectedSet.completedTests = selectedSet.completedTests || { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 }
    selectedSet.completedTests.LearnTest = 0
    await updateSet(selectedSet) // provider üzerinden persist
    // sonra yeniden yükle/yeniden başlat
    setIndex(0)
  }

  if (loading || !sets) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    )
  }


  if (!selectedSet) {
    return (
      <View style={styles.container}>
        <Text>Set bulunamadı</Text>
      </View>
    )
  }

  const words = selectedSet.words ?? []
  const current = words[index]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectedSet.title}</Text>
      <Text style={styles.progress}>{index + 1} / {words.length}</Text>

      {current ? (
        <View style={styles.card}>
          <View style={styles.wordRow}>
            <Text style={styles.word}>{current.word}</Text>
            <TouchableOpacity onPress={() => speakWord(current.word)} style={styles.speakerBtn} accessibilityLabel="Seslendir">
              <Text>🔊</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.meaning}>{current.meaning}</Text>
          <Text style={styles.example}> örn: {current.example}</Text>
          
          {/* Favori butonu */}
          <View style={styles.favoriteRow}>
            <TouchableOpacity 
              onPress={async () => {
                if (isFavorite(current.id)) {
                  await removeFromFavorites(current.id)
                } else {
                  await addToFavorites(current.id, selectedSet.id)
                }
              }} 
              style={styles.favoriteBtn}
            >
              <Text style={styles.favoriteText}>
                {isFavorite(current.id) ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text>Gösterilecek kelime yok</Text>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={[styles.btn, index === 0 && styles.disabled]}>
          <Text>Önceki</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} style={[styles.btn, (done && index >= words.length - 1) && styles.disabled]}>
          <Text>{index < words.length - 1 ? 'Sonraki' : done ? 'Tamamlandı' : 'Bitir'}</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFDD6' },
  title: { fontSize:20, fontWeight:'bold', textAlign:'center' },
  progress: { textAlign:'center', marginVertical:8 },
  card: { padding:16, borderRadius:8, backgroundColor:'#fff', marginVertical:12, width: '100%' },
  word: { fontSize:28, fontWeight:'700', textAlign:'center', color:'#000', marginBottom:18 },
  wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  speakerBtn: { marginLeft: 12, padding: 8, backgroundColor: '#eee', borderRadius: 6 },
  meaning: { fontSize:18, color:'#333', marginTop:8, textAlign:'center', fontStyle:'italic' },
  example: { marginTop:28, color:'#666', fontSize:16, textAlign:'center' },
  favoriteRow: { marginTop: 16, alignItems: 'center' },
  favoriteBtn: { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  favoriteText: { fontSize: 16, color: '#333' },
  controls: { flexDirection:'row', justifyContent:'space-between', marginTop:12, width: '100%' },
  btn: { padding:12, backgroundColor:'#647FBC', borderRadius:8, minWidth:120, alignItems:'center' },
  disabled: { opacity:0.5 },
})