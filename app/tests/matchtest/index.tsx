import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useData } from '../../lib/DataProvider'
import { useTheme } from '../../lib/ThemeProvider'

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchTest() {
  const { setId } = useLocalSearchParams()
  const router = useRouter()
  const { data, loading, updateSet } = useData()
  const sets = data?.sets ?? null
  const { theme } = useTheme();

  const [leftItems, setLeftItems] = React.useState<any[]>([])
  const [rightItems, setRightItems] = React.useState<any[]>([])
  // track selection by index so we only highlight the specific instances
  const [selectedLeftIndex, setSelectedLeftIndex] = React.useState<number | null>(null)
  const [selectedRightIndex, setSelectedRightIndex] = React.useState<number | null>(null)
  // matched state per column index
  const [matchedLeft, setMatchedLeft] = React.useState<Record<number, boolean>>({})
  const [matchedRight, setMatchedRight] = React.useState<Record<number, boolean>>({})
  // wrongVisible keyed by instance key like 'L-<idx>' or 'R-<idx>'
  const [wrongVisible, setWrongVisible] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (!sets) return
    const all = Object.values(sets as Record<string, any[]>).flat()
    const s = all.find((x: any) => x.id === String(setId))
    if (!s) return
    const words = s.words ?? []
    // take up to first 10 words and use them all as pairs
    const take = words.slice(0, 10)
    const pairs = take // don't reduce count
    const left = pairs.map((w: any) => ({ id: w.id, label: w.word }))
    const right = shuffle(pairs.map((w: any) => ({ id: w.id, label: w.meaning })))
    setLeftItems(left)
    setRightItems(right)
    setMatchedLeft({})
    setMatchedRight({})
    setWrongVisible({})
    setSelectedLeftIndex(null)
    setSelectedRightIndex(null)
  }, [sets, setId])

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

  const handleSelectLeft = (index: number) => {
    if (matchedLeft[index]) return
    setSelectedLeftIndex(prev => (prev === index ? null : index))
  }

  const handleSelectRight = (index: number) => {
    if (matchedRight[index]) return
    setSelectedRightIndex(prev => (prev === index ? null : index))
  }

  React.useEffect(() => {
    if (selectedLeftIndex === null || selectedRightIndex === null) return
    const left = leftItems[selectedLeftIndex]
    const right = rightItems[selectedRightIndex]
    if (!left || !right) return
    // check match by id
    if (left.id === right.id) {
      setMatchedLeft(m => ({ ...m, [selectedLeftIndex]: true }))
      setMatchedRight(m => ({ ...m, [selectedRightIndex]: true }))
      setSelectedLeftIndex(null)
      setSelectedRightIndex(null)
    } else {
      // mismatch: flash only the two selected instances
      const leftKey = `L-${selectedLeftIndex}`
      const rightKey = `R-${selectedRightIndex}`
      let count = 0
      const flashes = 6
      const iv = setInterval(() => {
        setWrongVisible(prev => ({ ...prev, [leftKey]: !prev[leftKey], [rightKey]: !prev[rightKey] }))
        count++
        if (count >= flashes) {
          clearInterval(iv)
          setWrongVisible(prev => {
            const next = { ...prev }
            delete next[leftKey]
            delete next[rightKey]
            return next
          })
        }
      }, 160)
      setSelectedLeftIndex(null)
      setSelectedRightIndex(null)
    }
  }, [selectedLeftIndex, selectedRightIndex])

  React.useEffect(() => {
    const totalPairs = leftItems.length
    const donePairs = Object.values(matchedLeft).filter(Boolean).length
    if (totalPairs > 0 && donePairs === totalPairs) {
      // mark match test completed
      try {
        if (!selectedSet.completedTests) selectedSet.completedTests = { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 }
        selectedSet.completedTests.MatchTest = 1
        const completedCount = Object.values(selectedSet.completedTests).filter((v: any) => Number(v) > 0).length
        selectedSet.stars = Math.min(4, completedCount)
        ;(async () => {
          await updateSet(selectedSet)
          Alert.alert('Tebrikler', 'Eşleştirme testi tamamlandı', [{ text: 'Tamam', onPress: () => router.back() }])
        })()
      } catch (e) {
        console.warn('match finish error', e)
        Alert.alert('Hata', 'Test tamamlanırken hata oluştu')
      }
    }
  }, [matchedLeft])

  const renderItem = (item: any, left = true, index: number) => {
    const isMatched = left ? Boolean(matchedLeft[index]) : Boolean(matchedRight[index])
    const isSelected = left ? selectedLeftIndex === index : selectedRightIndex === index
    const key = left ? `L-${index}` : `R-${index}`
    const isWrong = Boolean(wrongVisible[key])
    return (
      <TouchableOpacity
        key={key}
        onPress={() => (left ? handleSelectLeft(index) : handleSelectRight(index))}
        disabled={isMatched}
        style={[
          styles.item,
          isMatched && styles.itemMatched,
          isSelected && styles.itemSelected,
          isWrong && styles.itemWrong,
        ]}
      >
        <Text style={styles.itemText}>{item.label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#f6f7f8' : '#000000' }]}>
      <Text style={[styles.title, { color: theme === 'light' ? '#000' : '#fff' }]}>{selectedSet.title}</Text>
      <Text style={[styles.title, { color: theme === 'light' ? '#000' : '#fff' }]}>Eşleştirme Testi</Text>
      <View style={styles.area}>
        <View style={styles.column}>
          {leftItems.map((it, idx) => renderItem(it, true, idx))}
        </View>
        <View style={styles.column}>
          {rightItems.map((it, idx) => renderItem(it, false, idx))}
        </View>
      </View>
      <Text style={[styles.hint, { color: theme === 'light' ? '#333' : '#ccc' }]}>Eşleştirmek için bir kelime seçin, sonra karşısındaki anlamı seçin.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#f6f7f8' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  area: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  column: { width: '48%' },
  item: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  itemText: { color: '#000' },
  itemSelected: { borderWidth: 2, borderColor: '#647FBC' },
  itemMatched: { backgroundColor: '#d3f9d8', opacity: 0.9 },
  itemWrong: { backgroundColor: '#ffd6d6', borderColor: '#ff4d4f', borderWidth: 2 },
  hint: { marginTop: 12, color: '#333', fontStyle: 'italic', textAlign: 'center', paddingVertical: 28 },
})