import React from 'react'
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useData } from '../lib/DataProvider'
import { Ionicons } from '@expo/vector-icons'

export default function MyWordsSet() {
  const { setId } = useLocalSearchParams()
  const router = useRouter()
  const { data, loading } = useData()
  const all = Object.values(data?.sets ?? {}).flat()
  const set = all.find((s: any) => s.id === String(setId))

  if (loading) return null
  if (!set) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Set bulunamadı</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{set.title}</Text>
      </View>

      <FlatList
        data={set.words ?? []}
        keyExtractor={(w: any) => w.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.word}>{item.word}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
              <Text style={styles.example}>{item.example}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  word: { fontWeight: '700', fontSize: 16 },
  meaning: { color: '#666', marginTop: 4 },
  example: { color: '#888', marginTop: 6, fontSize: 13 }
})