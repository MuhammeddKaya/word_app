import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, useWindowDimensions,  } from 'react-native';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';

import {Link, useRouter} from 'expo-router'





export default function Tests(list: any,) {
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;
  const router = useRouter();
  const { setId } = useLocalSearchParams(); // string | undefined

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.logoText}>Test id : {setId}</Text>
      </View>
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/learntest`)}>
        <Text style={styles.cardText}>Öğren</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/learntest`)}>
        <Text style={styles.cardText}>Eşleştir</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/learntest`)}>
        <Text style={styles.cardText}>Çeviri</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/tests/learntest`)}>
        <Text style={styles.cardText}>Boşluk Doldur</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const ACCENT = '#647FBC'
const BG = '#FAFDD6'


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