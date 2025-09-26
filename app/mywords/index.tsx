import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useData } from '../lib/DataProvider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../lib/ThemeProvider'

export default function MyWordsList() {
  const router = useRouter()
  const { data, loading, removeMySet } = useData()
  const sets = data?.sets?.kelimelerim ?? []
  const totalWords = sets.reduce((acc: number, s: any) => acc + (s.words?.length ?? 0), 0)
  const { theme } = useTheme();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Yükleniyor...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#FAF9FF' : '#000000' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme === 'light' ? '#222' : '#fff' }]}>Benim Kelimelerim</Text>
        <Text style={[styles.subtitle, { color: theme === 'light' ? '#666' : '#ccc' }]}>{sets.length} set • {totalWords} kelime</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/mywords/add')}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={[styles.actionText, { color: theme === 'light' ? '#fff' : '#000' }]}>Elle Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.importBtn]} onPress={() => router.push('/mywords/import')}>
          <Ionicons name="cloud-upload" size={18} color="#fff" />
          <Text style={[styles.actionText, { color: theme === 'light' ? '#fff' : '#000' }]}>Excel Yükle</Text>
        </TouchableOpacity>
      </View>

      {(!sets || sets.length === 0) ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={[styles.emptyTitle, { color: theme === 'light' ? '#222' : '#fff' }]}>Henüz hiçbir kelime eklemediniz</Text>
          <Text style={[styles.emptyText, { color: theme === 'light' ? '#666' : '#ccc' }]}>Elle ekleyebilir veya Excel ile toplu yükleyebilirsiniz.</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/mywords/add')}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={[styles.actionText, { color: theme === 'light' ? '#fff' : '#000' }]}>Elle Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.importBtn]} onPress={() => router.push('/mywords/import')}>
              <Ionicons name="cloud-upload" size={18} color="#fff" />
              <Text style={[styles.actionText, { color: theme === 'light' ? '#fff' : '#000' }]}>Excel Yükle</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 32 }}
          data={sets}
          keyExtractor={s => s.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme === 'light' ? '#fff' : '#1c1c1c', shadowColor: theme === 'light' ? '#000' : '#000', shadowOpacity: theme === 'light' ? 0.1 : 0.7 }]}
              onPress={() => router.push(`./mywords/set?setId=${encodeURIComponent(item.id)}`)}
            >
              <View style={styles.cardLeft}>
                <Text style={[styles.cardTitle, theme === 'light' ? { color: '#000' } : { color: '#fff' }]}>{item.title}</Text>
                <Text style={[styles.cardMeta, theme === 'light' ? { color: '#666' } : { color: '#ccc' }]}>{(item.words?.length ?? 0)} kelime</Text>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.cardDate}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{ padding: 6, marginRight: 8 }}
                    onPress={() => {
                      Alert.alert('Onay', 'Bu seti silmek istediğinize emin misiniz?', [
                        { text: 'İptal', style: 'cancel' },
                        {
                          text: 'Sil',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await removeMySet(item.id)
                              Alert.alert('Silindi', 'Set başarılı şekilde silindi.')
                            } catch (e) {
                              console.warn('remove set error', e)
                              Alert.alert('Hata', 'Set silinirken hata oluştu.')
                            }
                          }
                        }
                      ])
                    }}
                  >
                    <Ionicons name="trash" size={18} color="#E74C3C" />
                  </TouchableOpacity>

                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 14, paddingTop: 12 },
  header: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },

  actions: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#647FBC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8
  },
  importBtn: { backgroundColor: '#4CA3A3' },
  actionText: { color: '#fff', fontWeight: '600', marginLeft: 8 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyText: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6 },

  list: { marginTop: 6 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardMeta: { fontSize: 12, color: '#666', marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  cardDate: { fontSize: 11, color: '#999', marginBottom: 4 },

  loading: { flex: 1, textAlign: 'center', marginTop: 20, color: '#555' }
})