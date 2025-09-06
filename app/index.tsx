import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, useWindowDimensions,  } from 'react-native';
import React, { useState }   from 'react'
import { Picker } from '@react-native-picker/picker'; 
import {Link, useRouter} from 'expo-router'


export default function HomeScreen({}) {
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;
  const router = useRouter();
  const [level, setLevel] = useState<'kolay' | 'orta' | 'zor' | 'kelimelerim'>('kolay');
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Image source={require('../assets/images/wordifyikon.png')} style={{ width: windowHeight * 0.18, height: windowHeight * 0.16, marginBottom: 12 }} />
        {/* <Text style={styles.logoText}>Wordify </Text> */}
      </View>

      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Text style={{ marginRight: 12, fontSize: 18 }}>Seviye</Text>
        <View style={{ borderWidth: 1, borderColor: ACCENT, borderRadius: 8, overflow: 'hidden' }}>
          <Picker
            onValueChange={(value) => setLevel(value as 'kolay' | 'orta' | 'zor' | 'kelimelerim')}
            mode="dropdown"
            style={{ height: 60, width: 160, backgroundColor: ACCENT, color: '#fff', alignItems: 'center', justifyContent: 'center' }}
          >
            <Picker.Item label="Kolay" value="kolay" />
            <Picker.Item label="Orta" value="orta" />
            <Picker.Item label="Zor" value="zor" />
            <Picker.Item label="Kelimelerim" value="kelimelerim" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => router.push(`/wordtests?level=${encodeURIComponent(level)}`)}>
        <Text style={styles.cardText}>Testler</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/favorites')}>
        <Text style={styles.cardText}>Favori kelimeler</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, { height: 80 }]} onPress={() => router.push('/mywords')}>
        <Text style={styles.cardText}>Benim Kelimelerim</Text>
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
    padding: 10 },

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
    marginVertical: 10,
    borderRadius: 12 },

  cardText: { 
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center' },


})