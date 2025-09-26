import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, useWindowDimensions,  } from 'react-native';
import React, { useState }   from 'react'
// Picker removed — replaced by level cards
import {Link, useRouter} from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './lib/ThemeProvider'
import { BannerAd, BannerAdSize, TestIds, InterstitialAd } from 'react-native-google-mobile-ads';

export default function HomeScreen({}) {
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;
  const router = useRouter();
  const [level, setLevel] = useState<'kolay' | 'orta' | 'zor' | 'kelimelerim'>('kolay');
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#f6f7f8' : '#222' }]}>
      <View>
        {/* <Image source={require('../assets/images/wordifyikon.png')} style={{ width: windowHeight * 0.18, height: windowHeight * 0.16, marginBottom: 12 }} />
        <Text style={styles.logoText}>Wordify </Text> */}

        <Text style={{ marginBottom: 8, fontSize: 24, alignItems: 'flex-start', fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>Kelime Setleri</Text>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <View style={styles.levelContainer}>
            <TouchableOpacity
              style={[styles.levelCard, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}
              onPress={() => router.push(`/wordtests?level=${encodeURIComponent('kolay')}`)}
            >
              <View style={[styles.cardLeftIconWrapper, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}>
                <View style={styles.starWrapperTop}>
                  <Ionicons name="star-outline" size={16} color="lightgreen" />
                </View>
                <View style={styles.starWrapperBottom}>
                  <Ionicons name="star-outline" size={16} color="lightgreen" />
                  <Ionicons name="star" size={16} color="lightgreen" />
                </View>
              </View>
              <View style={styles.cardRightTextWrapper}>
                <Text style={[styles.levelCardText, { color: theme === 'light' ? '#000' : '#fff' }]}>Kolay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelCard, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}
              onPress={() => router.push(`/wordtests?level=${encodeURIComponent('orta')}`)}
            >
              <View style={[styles.cardLeftIconWrapper, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}>
                <View style={styles.starWrapperTop}>
                  <Ionicons name="star-outline" size={16} color="orange" />
                </View>
                <View style={styles.starWrapperBottom}>
                  <Ionicons name="star" size={16} color="orange" />
                  <Ionicons name="star" size={16} color="orange" />
                </View>
              </View>
              <View style={styles.cardRightTextWrapper}>
                <Text style={[styles.levelCardText, { color: theme === 'light' ? '#000' : '#fff' }]}>Orta</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelCard, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}
              onPress={() => router.push(`/wordtests?level=${encodeURIComponent('zor')}`)}
            >
              <View style={[styles.cardLeftIconWrapper, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}>
                <View style={styles.starWrapperTop}>
                  <Ionicons name="star" size={16} color="red" />
                </View>
                <View style={styles.starWrapperBottom}>
                  <Ionicons name="star" size={16} color="red" />
                  <Ionicons name="star" size={16} color="red" />
                </View>
              </View>
              <View style={styles.cardRightTextWrapper}>
                <Text style={[styles.levelCardText, { color: theme === 'light' ? '#000' : '#fff' }]}>Zor</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelCard, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}
              onPress={() => router.push(`/wordtests?level=${encodeURIComponent('kelimelerim')}`)}
            >
              <View style={[styles.cardLeftIconWrapper, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]}>
                <Ionicons name="text" size={28} color={theme === 'light' ? '#333' : '#fff'} />
              </View>
              <View style={styles.cardRightTextWrapper}>
                <Text style={[styles.levelCardText, { color: theme === 'light' ? '#000' : '#fff' }]}>Benim</Text>
                <Text style={[styles.levelCardText, { color: theme === 'light' ? '#000' : '#fff' }]}>Kelimelerim</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ marginBottom: 8, marginTop: 30, fontSize: 24, alignItems: 'flex-start', fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>Favori kelimeler</Text>
        <TouchableOpacity style={[styles.infoCard, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]} onPress={() => router.push('/favorites')}>
          <View style={styles.infoCardLeft}>
            <Text style={[styles.infoCardTitle, { color: theme === 'light' ? '#000' : '#fff' }]}>Favori Kelimeleriniz</Text>
            <Text style={[styles.infoCardSubtitle, { color: theme === 'light' ? '#000' : '#fff' }]}>Favori kelimelerinizi gözden geçirin veya pdf olarak indirin</Text>
          </View>
          <Ionicons name="heart" size={36} color="red" />
        </TouchableOpacity>

        <Text style={{ marginBottom: 8, marginTop: 30, fontSize: 24, alignItems: 'flex-start', fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>Kelime Ekle</Text>
        <TouchableOpacity style={[styles.infoCard, { backgroundColor: theme === 'light' ? '#fff' : '#323232' }]} onPress={() => router.push('/mywords')}>
          <View style={styles.infoCardLeft}>
            <Text style={[styles.infoCardTitle, { color: theme === 'light' ? '#000' : '#fff' }]}>Kendi Kelimelerinizi Ekleyin</Text>
            <Text style={[styles.infoCardSubtitle, { color: theme === 'light' ? '#000' : '#fff' }]}>Elle yada Excel ile kelimelerinizi topluca ekleyebilirsiniz</Text>
          </View>
          <Ionicons name="add-circle" size={40} color="grey" />
        </TouchableOpacity>
      </View>
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
    padding: 10 },

  logoBox: { 
    width: '70%',
    height: 80,
    borderWidth: 1,
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
    color: '#020202ff',
    fontSize: 20,
    textAlign: 'center' },

  levelContainer: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  levelCard: {
    flexDirection: 'row',
    width: '48%',
    height: 72,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderWidth: 0.4,
    borderColor: 'grey',
    borderRadius: 12,
  },

  cardLeftIconWrapper: {
    width: 56,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  levelCardImageLeft: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  cardRightTextWrapper: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 2,
  },

  levelCardText: {
    color: '#111111ff',
    fontSize: 16,
    fontWeight: '600',
  },

  cardLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 12,
  },

  cardRight: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 12,
  },

  levelCardSubtitle: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },

  infoCard: {
    width: '90%',
    height: 92,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderWidth: 0.2,
    borderColor: 'grey',
  },

  infoCardLeft: {
    flex: 1,
    justifyContent: 'center',
  },

  infoCardTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },

  infoCardSubtitle: {
    color: '#666',
    marginTop: 6,
  },

  infoCardImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginLeft: 12,
  },

  starWrapperTop: {
    alignItems: 'center',
    marginBottom: 4,
  },

  starWrapperBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },

})