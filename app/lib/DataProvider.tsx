import React, { createContext, useContext, useEffect, useState } from 'react'
import * as FileSystem from 'expo-file-system'
import bundleData from '../../assets/data/words.json'

const FILE_NAME = 'words.json'
const DEST_PATH = FileSystem.documentDirectory + FILE_NAME

type DataContextType = {
  data: any | null
  loading: boolean
  reload: () => Promise<void>
  saveData: (d: any) => Promise<void>
  updateSet: (updatedSet: any) => Promise<void>
  addToFavorites: (wordId: string, setId: string) => Promise<void>
  removeFromFavorites: (wordId: string) => Promise<void>
  isFavorite: (wordId: string) => boolean
}

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
  reload: async () => {},
  saveData: async () => {},
  updateSet: async () => {},
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  isFavorite: () => false,
})

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  async function ensureWritable() {
    try {
      const info = await FileSystem.getInfoAsync(DEST_PATH)
      if (!info.exists) {
        // write bundled JSON to documentDirectory on first run
        await FileSystem.writeAsStringAsync(DEST_PATH, JSON.stringify(bundleData, null, 2), { encoding: FileSystem.EncodingType.UTF8 })
      }
    } catch (e) {
      console.warn('ensureWritable error', e)
    }
  }

  async function load() {
    setLoading(true)
    try {
      await ensureWritable()
      const text = await FileSystem.readAsStringAsync(DEST_PATH)
      setData(JSON.parse(text))
    } catch (e) {
      console.warn('load data error', e)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  async function save(next: any) {
    try {
      setData(next)
      await FileSystem.writeAsStringAsync(DEST_PATH, JSON.stringify(next, null, 2), { encoding: FileSystem.EncodingType.UTF8 })
    } catch (e) {
      console.warn('save data error', e)
    }
  }

  async function updateSet(updatedSet: any) {
    if (!data) return
    const next = { ...data }
    try {
      Object.keys(next.sets).forEach(k => {
        next.sets[k] = (next.sets[k] as any[]).map((s: any) => s.id === updatedSet.id ? updatedSet : s)
      })
      await save(next)
    } catch (e) {
      console.warn('updateSet error', e)
    }
  }

  async function addToFavorites(wordId: string, setId: string) {
    if (!data) return
    const next = { ...data }
    if (!next.favorites) next.favorites = []
    
    // check if already exists
    const exists = next.favorites.some((f: any) => f.wordId === wordId)
    if (!exists) {
      next.favorites.push({
        wordId,
        setId,
        addedAt: new Date().toISOString()
      })
      await save(next)
    }
  }

  async function removeFromFavorites(wordId: string) {
    if (!data) return
    const next = { ...data }
    if (!next.favorites) next.favorites = []
    
    next.favorites = next.favorites.filter((f: any) => f.wordId !== wordId)
    await save(next)
  }

  function isFavorite(wordId: string): boolean {
    if (!data?.favorites) return false
    return data.favorites.some((f: any) => f.wordId === wordId)
  }

  useEffect(() => { load() }, [])

  return (
    <DataContext.Provider value={{ data, loading, reload: load, saveData: save, updateSet, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
