import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from 'react-native'

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Hakkımızda</Text>

        {/* Buraya kendi bilgilerini ekle */}
        <View style={styles.card}>
          <Text style={styles.heading}>Uygulama</Text>
          <Text style={styles.text}>Kelime Öğrenme Uygulaması — kısa açıklama buraya.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Geliştirici</Text>
          <Text style={styles.text}>İsim: [Adınız]</Text>
          <Text style={styles.text}>E-posta: [email@example.com]</Text>
          <Text style={styles.text}>Diğer bilgiler...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  heading: { fontWeight: '700', marginBottom: 6 },
  text: { color: '#444' }
})