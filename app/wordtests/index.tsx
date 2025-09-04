import { StyleSheet, Text, View, useWindowDimensions, ScrollView } from 'react-native'
import React from 'react'
import TestComponent from '@/components/tests'
import { useLocalSearchParams } from 'expo-router'

export default function wordtests() {
  const { level } = useLocalSearchParams() // 'kolay' | 'orta' | 'zor' | 'kelimelerim'

  const items = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5',
                 'Test 6', 'Test 7', 'Test 8', 'Test 9', 'Test 10',
                 'Test 11', 'Test 12', 'Test 13', 'Test 14', 'Test 15',
                 'Test 16', 'Test 17', 'Test 18', 'Test 19', 'Test 20'];

  // örnek metadata: her öğeye difficulty ve owner ekliyoruz — gerçek veriye göre ayarla
  const difficulties = ['kolay', 'orta', 'zor']
  const itemsMeta = items.map((name, i) => ({
    name,
    difficulty: difficulties[i % difficulties.length],
    owner: i % 5 === 0 ? 'me' : 'other',
  }))

  const filtered = itemsMeta.filter(item => {
    if (!level) return true
    if (level === 'kelimelerim') return item.owner === 'me'
    return item.difficulty === level
  })

  const windowWidth = useWindowDimensions().width;
  const columns = 2;
  const horizontalPadding = 32; // container padding (eşleşmeli)
  const gapBetween = 12; // item horizontal gap
  const itemWidth = (windowWidth - horizontalPadding - gapBetween * (columns - 1)) / columns;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}>
      <Text style={styles.text}>Kelime Testleri</Text>
      <View style={styles.row}>
        {filtered.map((it, i) => (
          <TestComponent key={i} id={String(i)} name={it.name} style={{ width: itemWidth, height: itemWidth * 0.6 }} />
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