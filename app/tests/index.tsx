import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, useWindowDimensions, Alert } from 'react-native';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../lib/ThemeProvider';
import {Link, useRouter} from 'expo-router'
import { useData } from '../lib/DataProvider'

export default function Tests(list: any,) {
  const { data, loading } = useData()
  const sets = data?.sets ?? {}

  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;
  const router = useRouter();
  const { setId } = useLocalSearchParams(); // string | undefined
  const { theme } = useTheme();

  const selectedSet = React.useMemo(() => {
    if (!setId) return undefined
    const all = Object.values(sets as Record<string, any[]>).flat()
    return all.find((s: any) => s.id === String(setId))
  }, [setId, sets])

  React.useEffect(() => {
    if (setId && !selectedSet) {
      Alert.alert('Bilgi', 'Bu id ile bir set bulunamadı')
    }
  }, [setId, selectedSet])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f7f8' }}>
        <Text>Yükleniyor...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#f6f7f8' : '#222' }]}>
      <View>
        <Text style={{ textAlign: 'center', marginBottom: 8, fontSize: 24, fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>{selectedSet?.title ?? ''}</Text>
      </View>
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/learntest?setId=${encodeURIComponent(String(setId ?? ''))}`)}>
        <Text style={styles.cardText}>Öğren</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/matchtest?setId=${encodeURIComponent(String(setId ?? ''))}`)}>
        <Text style={styles.cardText}>Eşleştir</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/translatetest?setId=${encodeURIComponent(String(setId ?? ''))}`)}>
        <Text style={styles.cardText}>Çeviri</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/filltest?setId=${encodeURIComponent(String(setId ?? ''))}`)}>
        <Text style={styles.cardText}>Kelime Tamamlama</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/sentencetest?setId=${encodeURIComponent(String(setId ?? ''))}`)}>
        <Text style={styles.cardText}>Cümle Tamamlama</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const ACCENT = '#647FBC'
const BG = '#f6f7f8'


const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20 },

  logoBox: { 
    width: '70%',
    height: 80,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderRadius: 12
   },

  logoText: { 
     color: '#000000ff',
     marginBottom: 20,
     fontSize: 40 },

  card: { width: '90%',
    height: 72,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    borderRadius: 12 },

  cardText: { 
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center' },


})