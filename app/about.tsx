import React from 'react'
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Wordify</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>Uygulama Hakkında</Text>
          <Text style={styles.text}>
            Wordify, kelime öğrenimini kolay, hızlı ve eğlenceli hâle getiren bir mobil uygulamadır.
            Kullanıcılar hazır setlerde (Kolay, Orta, Zor) çalışabilir, kendi kelimelerini ekleyip
            10'ar kelimelik setler halinde düzenleyebilirler. Uygulama; kelime gösterme, örnek cümle,
            telaffuz ve çeşitli test tipleriyle öğrenmeyi destekler.
          </Text>

          <Text style={styles.heading}>Amaç</Text>
          <Text style={styles.text}>
            Amaç: Kelime hazinesini sistematik olarak genişletmek, öğrenme süreçlerini takip etmek ve
            kısa pratiklerle bilginin kalıcılığını artırmaktır. Testler ve tekrarlar sayesinde öğrenme
            sürekliliği hedeflenir.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Geliştirici</Text>
          <Text style={styles.text}>Impala Yazılım</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://impalabt.com')}
            accessibilityRole="link"
          >
            <Ionicons name="globe-outline" size={16} color="#2563EB" />
            <Text style={styles.link}>impalabt.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('mailto:impalabt@gmail.com')}
            accessibilityRole="link"
          >
            <Ionicons name="mail-outline" size={16} color="#2563EB" />
            <Text style={styles.link}>impalabt@gmail.com</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Teşekkürler — iyi çalışmalar!</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FF' },
  content: { padding: 18, paddingBottom: 40 },

  title: { fontSize: 26, fontWeight: '800', color: '#1F2937', marginBottom: 14, textAlign: 'center' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EFF2FF'
  },

  heading: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 },

  text: {
    color: '#374151',
    lineHeight: 20,
    textAlign: 'justify',
    marginBottom: 8
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },

  link: {
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 8
  },

  footer: { textAlign: 'center', color: '#6B7280', marginTop: 6, fontSize: 13 }
})