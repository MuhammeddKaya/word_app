import { StyleSheet, Text, View, useWindowDimensions, ScrollView, Alert } from 'react-native'
import React from 'react'
import TestComponent from '@/components/tests'
import { useLocalSearchParams } from 'expo-router'
import { useData } from '../lib/DataProvider'
import { useTheme } from '../lib/ThemeProvider'

export default function wordtests() {
  const { level } = useLocalSearchParams() // 'kolay' | 'orta' | 'zor' | 'kelimelerim'
  const { theme } = useTheme();
  // use DataProvider as single source of truth
  const { data, loading } = useData()
  const sets = data?.sets ?? {}

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f7f8' }}>
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

    if (!hasKey) {
      Alert.alert('Dikkat', 'Bu kategoriyi kendi eklediğiniz kelimeleri öğrenmeniz için hazırlanmıştır. Öğrenmek istediğiniz kelimeleri anasayfada Benim Kelimelerim alanından ekleyebilirsiniz.', [{ text: 'Tamam' }])
    } else {
      const group = items[lvl]
      // toplam kelime sayısını hesapla (setler halinde veya düz kelime listesi olabilir)
      let totalWords = 0

      if (Array.isArray(group)) {
        // eğer dizi setlerden oluşuyorsa (her set.words içerir) toplamı al
        if (group.length > 0 && typeof group[0] === 'object' && Array.isArray(group[0].words)) {
          totalWords = group.reduce((acc: number, s: any) => acc + (s.words?.length ?? 0), 0)
        } else {
          // düz kelime listesi
          totalWords = group.length
        }
      } else if (group && typeof group === 'object') {
        // olası obje yapılar için basit toplam (her değer bir dizi ise)
        totalWords = Object.values(group).reduce((acc: number, v: any) => {
          if (Array.isArray(v)) return acc + v.length
          return acc
        }, 0)
      }

      if (totalWords === 0) {
        Alert.alert('Dikkat', 'Bu kategoriyi kendi eklediğiniz kelimeleri öğrenmeniz için hazırlanmıştır. Öğrenmek istediğiniz kelimeleri anasayfada Benim Kelimelerim alanından ekleyebilirsiniz.', [{ text: 'Tamam' }])
      }
    }
  }, [level, items])

  const windowWidth = useWindowDimensions().width;
  const columns = 2;
  const horizontalPadding = 32; // container padding (eşleşmeli)
  const gapBetween = 12; // item horizontal gap
  const itemWidth = (windowWidth - horizontalPadding - gapBetween * (columns - 1)) / columns;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme === 'light' ? '#f6f7f8' : '#222' }} contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}>
      <Text style={[styles.text, { color: theme === 'light' ? '#000' : '#fff' }]}>Kelime Testleri</Text>
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
        backgroundColor: '#f6f7f8',
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