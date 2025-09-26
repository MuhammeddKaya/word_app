import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useData } from '../lib/DataProvider'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { useTheme } from '../lib/ThemeProvider'

export default function Favorites() {
  const { data, loading, removeFromFavorites } = useData()
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    )
  }

  const favorites = data?.favorites || []
  
  // favorites içindeki her bir entry için gerçek kelimeyi bul
  const favoriteWords = favorites.map((fav: any) => {
    const allSets = Object.values((data?.sets || {}) as Record<string, any[]>).flat()
    const set = allSets.find((s: any) => s.id === fav.setId)
    const word = set?.words?.find((w: any) => w.id === fav.wordId)
    return {
      ...fav,
      word,
      setTitle: set?.title
    }
  }).filter((item: any) => item.word) // sadece bulunan kelimeleri göster

  const speak = (text?: string) => {
    if (!text) return
    try {
      const Speech = require('expo-speech')
      Speech.speak(text, { language: 'en-US' })
    } catch (e) {
      console.warn('TTS not available', e)
    }
  }

  const exportToPDF = async () => {
    if (favoriteWords.length === 0) {
      Alert.alert('Uyarı', 'Dışarı aktarılacak favori kelime bulunamadı.')
      return
    }

    try {
      // HTML içeriği oluştur
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 10px;
              line-height: 1.3;
              background-color: white;
              margin: 0;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #4CAF50;
              padding-bottom: 12px;
            }
            .app-title {
              color: #333;
              font-size: 20px;
              font-weight: bold;
              margin: 0;
              margin-bottom: 3px;
            }
            .subtitle {
              color: #666;
              font-size: 12px;
              margin: 0;
            }
            .words-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
              margin-bottom: 15px;
            }
            .word-card {
              background: #fafafa;
              border: 1px solid #ddd;
              border-radius: 6px;
              padding: 8px;
              border-left: 3px solid #4CAF50;
              page-break-inside: avoid;
              margin-bottom: 8px;
            }
            .word-title {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-bottom: 4px;
              line-height: 1.2;
            }
            .word-meaning {
              font-size: 11px;
              color: #666;
              font-style: italic;
              margin-bottom: 6px;
              border-bottom: 1px solid #eee;
              padding-bottom: 3px;
              line-height: 1.2;
            }
            .word-example {
              font-size: 10px;
              color: #555;
              background: #f5f5f5;
              padding: 6px;
              border-radius: 3px;
              margin: 0;
              line-height: 1.2;
            }
            .example-label {
              font-weight: bold;
              color: #333;
              margin-bottom: 2px;
              font-size: 9px;
            }
            .page-break {
              page-break-after: always;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #4CAF50;
              color: #666;
              font-size: 10px;
              page-break-inside: avoid;
            }
            @media print {
              body { 
                background-color: white;
                font-size: 10px;
                padding: 8px;
              }
              .word-card { 
                box-shadow: none; 
                border: 1px solid #ccc;
                margin-bottom: 6px;
                padding: 6px;
              }
              .words-grid {
                gap: 8px;
              }
              .word-title {
                font-size: 12px;
              }
              .word-meaning {
                font-size: 10px;
              }
              .word-example {
                font-size: 9px;
                padding: 4px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="app-title">📚 Wordify</h1>
            <p class="subtitle">Favori Kelimelerim (${favoriteWords.length} kelime) - ${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
          
          <div class="words-grid">
            ${favoriteWords.map((item: any, index: number) => `
              <div class="word-card">
                <div class="word-title">${item.word.word}</div>
                <div class="word-meaning">${item.word.meaning}</div>
                <div class="word-example">
                  <div class="example-label">Örnek:</div>
                  ${item.word.example}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>💙 Wordify • Toplam ${favoriteWords.length} favori kelime</p>
          </div>
        </body>
        </html>
      `

      // PDF oluştur
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      })

      // PDF'i paylaş
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Favori Kelimelerim PDF',
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf'
        })
      } else {
        Alert.alert('Başarılı! 🎉', `PDF dosyası oluşturuldu: ${uri}`)
      }
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu.')
    }
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.itemCard, { backgroundColor: theme === 'light' ? '#fff' : '#1c1c1c', shadowColor: theme === 'light' ? '#000' : '#000', shadowOpacity: theme === 'light' ? 0.1 : 0.7 }]}>
      <View style={styles.wordHeader}>
        <Text style={[styles.wordText, theme === 'light' ? { color: '#000' } : { color: '#fff' }]}>{item.word.word}</Text>
        <View style={styles.wordActions}>
          <TouchableOpacity onPress={() => speak(item.word.word)} style={[styles.speakerBtn, theme === 'light' ? { backgroundColor: '#f0f0f0' } : { backgroundColor: '#333' }]}>
            <Text>🔊</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => removeFromFavorites(item.wordId)} 
            style={[styles.removeBtn, theme === 'light' ? { backgroundColor: '#ffebee' } : { backgroundColor: '#660000' }]}
          >
            <Text>❌</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.meaningText, theme === 'light' ? { color: '#000' } : { color: '#fff' }]}>{item.word.meaning}</Text>
      <Text style={[styles.exampleText, theme === 'light' ? { color: '#000' } : { color: '#fff' }]}>örn: {item.word.example}</Text>
      <View style={styles.metaInfo}>
        <Text style={[styles.setInfo, theme === 'light' ? { color: '#000' } : { color: '#fff' }]}>Set: {item.setTitle}</Text>
        <Text style={[styles.dateInfo, theme === 'light' ? { color: '#000' } : { color: '#fff' }]}>Eklenme: {new Date(item.addedAt).toLocaleDateString('tr-TR')}</Text>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#f6f7f8' : '#000000' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme === 'light' ? '#333' : '#fff' }]}>Favori Kelimeler</Text>
        {favoriteWords.length > 0 && (
          <TouchableOpacity onPress={exportToPDF} style={styles.exportBtn}>
            <Text style={[styles.exportBtnText, { color: theme === 'light' ? '#fff' : '#000' }]}>📄 PDF İndir</Text>
          </TouchableOpacity>
        )}
      </View>
      {favoriteWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'light' ? '#666' : '#ccc' }]}>Henüz favori kelime eklemediniz.</Text>
          <Text style={[styles.emptyHint, { color: theme === 'light' ? '#999' : '#aaa' }]}>Learn testlerinde kelime kartlarına ❤️ butonu ile kelime ekleyebilirsiniz.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteWords}
          renderItem={renderItem}
          keyExtractor={(item) => item.wordId}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', flex: 1 },
  exportBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  exportBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
  itemCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  wordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  wordText: { fontSize: 24, fontWeight: '700', color: '#333', flex: 1 },
  wordActions: { flexDirection: 'row', gap: 8 },
  speakerBtn: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6 },
  removeBtn: { padding: 8, backgroundColor: '#ffebee', borderRadius: 6 },
  meaningText: { fontSize: 18, color: '#666', marginBottom: 8, fontStyle: 'italic' },
  exampleText: { fontSize: 16, color: '#888', marginBottom: 12 },
  metaInfo: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  setInfo: { fontSize: 14, color: '#999' },
  dateInfo: { fontSize: 14, color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#999', textAlign: 'center' },
})