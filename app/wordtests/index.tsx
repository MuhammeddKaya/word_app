import { StyleSheet, Text, View, useWindowDimensions, ScrollView, Alert } from 'react-native'
import React from 'react'
import TestComponent from '@/components/tests'
import { useLocalSearchParams } from 'expo-router'
import { useData } from '../lib/DataProvider'

export default function wordtests() {
  const { level } = useLocalSearchParams() // 'kolay' | 'orta' | 'zor' | 'kelimelerim'

  // use DataProvider as single source of truth
  const { data, loading } = useData()
  const sets = data?.sets ?? {}

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFDD6' }}>
        <Text>Yükleniyor...</Text>
      </View>
    )
  }

  const items = sets
  console.log('level', level);

  const filtered = React.useMemo(() => {
    const lvl = String(level ?? '').trim()

    // no level => flatten all groups
    if (!lvl) return Object.values(items as Record<string, any[]>).flat()

    // return the exact group if exists (kolay/orta/zor), otherwise empty
    return (items as any)[lvl] ?? []
  }, [items, level])

  // show alert when selected level has no group in the static sets
  React.useEffect(() => {
    const lvl = String(level ?? '').trim()
    if (!lvl) return

    // explicit check for 'kelimelerim' or missing key in sets
    const hasKey = Object.prototype.hasOwnProperty.call(items, lvl)
    if (lvl === 'kelimelerim' || !hasKey) {
      Alert.alert('Bilgi', 'Kelime yok, Kendi kelimelerinizi ekleyin.', [{ text: 'Tamam' }])
    }
  }, [level, items])

  const windowWidth = useWindowDimensions().width;
  const columns = 2;
  const horizontalPadding = 32; // container padding (eşleşmeli)
  const gapBetween = 12; // item horizontal gap
  const itemWidth = (windowWidth - horizontalPadding - gapBetween * (columns - 1)) / columns;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFDD6' }} contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}>
      <Text style={styles.text}>Kelime Testleri</Text>
      <View style={styles.row}>
        {filtered.map((it: any) => (
          <TestComponent key={it.id} id={it.id} name={it.title ?? it.name} style={{ width: itemWidth, height: itemWidth * 0.6 }} />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFDD6',
        padding: 20,
    },
    row: {
      width: '100%',
      marginTop: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', // iki sütun arasında boşluk
    },
    item: {
      width: '48%', // iki sütun
      marginVertical: 8,
    },
    text: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
})