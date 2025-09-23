import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useData } from '../../lib/DataProvider'

function maskWord(word: string) {
  const chars = word.split('')
  const len = chars.length
  const hideCount = Math.max(1, Math.floor(len * 0.8))
  const indices = new Set<number>()
  while (indices.size < hideCount) {
    const i = Math.floor(Math.random() * len)
    // don't hide non-letters (e.g. hyphens)
    if (/[a-zA-Z]/.test(chars[i])) indices.add(i)
  }
  const masked = chars.map((c, i) => (indices.has(i) ? '_' : c)).join('')
  return { masked, indices }
}

export default function FillTest() {
  const { setId } = useLocalSearchParams()
  const router = useRouter()
  const { data, loading, updateSet } = useData()
  const sets = data?.sets ?? null

  const [index, setIndex] = React.useState(0)
  const [input, setInput] = React.useState('') // kept for hidden TextInput value
  const [originalChars, setOriginalChars] = React.useState<string[]>([])
  const [hiddenIndices, setHiddenIndices] = React.useState<number[]>([])
  const [displayChars, setDisplayChars] = React.useState<string[]>([])
  // focused character position (actual index in the word) or null
  const [focusedPos, setFocusedPos] = React.useState<number | null>(null)
  const [wrongVisible, setWrongVisible] = React.useState<Record<number, boolean>>({})
  const [showAnswer, setShowAnswer] = React.useState(false)
  const [lastFilled, setLastFilled] = React.useState<number | null>(null)
  const hiddenInputRef = React.useRef<any>(null)

  React.useEffect(() => {
    setIndex(0)
    setInput('')
  }, [setId])

  React.useEffect(() => {
    // whenever index/sets change, recompute masked word and clear input
    if (!sets) return
    const all = Object.values(sets as Record<string, any[]>).flat()
    const s = all.find((x: any) => x.id === String(setId))
    if (!s) return
    const words = s.words ?? []
    const current = words[index]
    if (!current) return
    const wordStr = String(current.word)
    const { indices } = maskWord(wordStr)
    const hidden = Array.from(indices).sort((a,b)=>a-b)
    const chars = wordStr.split('')
    const display = chars.map((c,i) => (hidden.includes(i) ? '_' : c))
    setOriginalChars(chars)
    setHiddenIndices(hidden)
    setDisplayChars(display)
    setFocusedPos(hidden.length > 0 ? hidden[0] : null)
    // focus the hidden input slightly after render so keyboard reliably opens
    setTimeout(() => {
      try { if (hidden.length > 0) hiddenInputRef.current?.focus() } catch (e) {}
    }, 80)
    setWrongVisible({})
    setInput('')
  }, [sets, setId, index])

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

  // handle single-letter entry for a specific hidden position
  const handleLetterEntryAt = async (pos: number, letter: string) => {
    if (!current) return
    const ch = (letter || '').slice(-1)
    setInput('')
    if (ch === '') {
      // backspace: clear this position
      setDisplayChars(dc => { const n = [...dc]; n[pos] = '_'; return n })
      return
    }
    const expected = originalChars[pos]
    // prepare updated display synchronously so we can check completion reliably
    const updated = [...displayChars]
    if (ch.toLowerCase() === expected.toLowerCase()) {
      updated[pos] = expected
      setDisplayChars(updated)
      // find next hidden position (to the right) or any remaining hidden
      let nextHidden = hiddenIndices.find(i => i > pos && updated[i] === '_')
      if (nextHidden === undefined) nextHidden = hiddenIndices.find(i => updated[i] === '_')
      if (nextHidden !== undefined) {
        setFocusedPos(nextHidden)
        try { hiddenInputRef.current?.focus() } catch (e) {}
        return
      }

      // no remaining hidden slots for this word
      const allFilledNow = hiddenIndices.every(i => updated[i] !== '_')
      if (allFilledNow) {
        setShowAnswer(true)
        setLastFilled(index)
        // OTO GEÇMEYİ KALDIRDIK, kullanıcı Sonraki/Bitir butonuna basınca ilerleyecek
      }
    } else {
      // wrong: flash that position
      setWrongVisible(prev => ({ ...prev, [pos]: true }))
      setTimeout(() => setWrongVisible(prev => { const n = { ...prev }; delete n[pos]; return n }), 600)
    }
  }

  const goPrev = () => {
    if (index > 0) setIndex(i => i - 1)
  }

  const allFilled = hiddenIndices.length > 0 && hiddenIndices.every(i => displayChars[i] && displayChars[i] !== '_')

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
        <View style={styles.container}>
           <Text style={styles.title}>{selectedSet.title} - Fill</Text>
           <Text style={styles.progress}>{index + 1} / {words.length}</Text>

           {current ? (
             <View style={styles.card}>
               <Text style={styles.meaning}>{current.meaning}</Text>

               <Text style={styles.maskLabel}>Tamamlayın:</Text>
               <View style={styles.wordRow}>
                 {displayChars.map((ch, i) => {
                   const isHidden = hiddenIndices.includes(i)
                   const wrong = Boolean(wrongVisible[i])
                   const focused = focusedPos === i
                   return (
                     <TouchableOpacity key={`c-${i}`} onPress={() => {
                       if (!isHidden) return
                       setFocusedPos(i)
                       setTimeout(() => { try { hiddenInputRef.current?.focus() } catch (e) {} }, 60)
                     }} activeOpacity={0.8}>
                       <View style={[styles.charBox, isHidden && styles.charHidden, wrong && styles.charWrong, focused && styles.charFocused]}>
                         <Text style={styles.charText}>{ch}</Text>
                       </View>
                     </TouchableOpacity>
                   )
                 })}
               </View>

               {showAnswer && (
                 <Text style={styles.answer}>
                   Doğru cevap: <Text style={{ fontWeight: 'bold' }}>{current.word}</Text>
                 </Text>
               )}

               <TextInput
                 ref={hiddenInputRef}
                 value={input}
                 onChangeText={(t) => {
                   const char = t.slice(-1)
                   setInput('')
                   if (focusedPos !== null && !showAnswer) handleLetterEntryAt(focusedPos, char)
                 }}
                 onKeyPress={({ nativeEvent }) => {
                   if (nativeEvent.key === 'Backspace' && focusedPos !== null && !showAnswer) {
                     setDisplayChars(dc => { const n = [...dc]; n[focusedPos] = '_'; return n })
                   }
                 }}
                 style={styles.hiddenInput}
                 autoCapitalize="none"
                 autoCorrect={false}
                 maxLength={1}
                 blurOnSubmit={false}
               />

               <View style={styles.controls}>
                 <TouchableOpacity onPress={goPrev} disabled={index === 0 || showAnswer} style={[styles.btn, (index === 0 || showAnswer) && styles.disabled]}>
                   <Text>Önceki</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   onPress={async () => {
                     if (!allFilled || !showAnswer) return
                     if (index < words.length - 1) {
                       setShowAnswer(false)
                       setLastFilled(null)
                       setIndex(i => i + 1)
                     } else {
                       // son kelime tamamlandı -> persist completion
                       try {
                         if (!selectedSet.completedTests) selectedSet.completedTests = { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 }
                         selectedSet.completedTests.FillTest = 1
                         const completedCount = Object.values(selectedSet.completedTests).filter((v: any) => Number(v) > 0).length
                         selectedSet.stars = Math.min(4, completedCount)
                         await updateSet(selectedSet)
                         Alert.alert('Tebrikler', 'Fill testi tamamlandı', [{ text: 'Tamam', onPress: () => router.back() }])
                       } catch (e) {
                         console.warn('Fill finish error', e)
                         Alert.alert('Hata', 'Test tamamlanırken hata oluştu')
                       }
                     }
                   }}
                   disabled={!allFilled || !showAnswer}
                   style={[styles.btn, (!allFilled || !showAnswer) && styles.disabled]}
                 >
                   <Text>{index < words.length - 1 ? 'Sonraki' : 'Bitir'}</Text>
                 </TouchableOpacity>
               </View>
             </View>
           ) : (
             <Text>Gösterilecek kelime yok</Text>
           )}

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFDD6' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  progress: { marginBottom: 10 },
  card: { width: '100%', backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  wordRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 },
  charBox: { minWidth: 28, minHeight: 36, margin: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#fff' },
  charHidden: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f7f7f7' },
  charFocused: { borderColor: '#647FBC', borderWidth: 2 },
  charText: { fontSize: 20, fontWeight: '700' },
  charWrong: { backgroundColor: '#ffd6d6', borderColor: '#ff4d4f', borderWidth: 1 },
  letterInput: { width: 64, height: 44, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, textAlign: 'center', fontSize: 18, marginBottom: 12 },
  hiddenInput: { position: 'absolute', bottom: 8, left: 12, opacity: 0.02, height: 40, width: 48 },
  meaning: { fontSize: 22, color: '#111', marginBottom: 12 , textAlign: 'center', fontWeight: 'bold' },
  maskLabel: { margin: 12, color: '#333' },
  masked: { fontSize: 28, letterSpacing: 2, textAlign: 'center', marginVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, backgroundColor: '#fff', marginBottom: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 12, backgroundColor: '#647FBC', borderRadius: 8, minWidth: 120, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  answer: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center'
  }
})