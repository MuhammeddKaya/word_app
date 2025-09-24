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
        await FileSystem.writeAsStringAsync(DEST_PATH, JSON.stringify(bundleData, null, 2))
      }
    } catch (e) { /* ... */ }
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

  async function saveData(next: any) {
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
      await saveData(next)
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
      await saveData(next)
    }
  }

  async function removeFromFavorites(wordId: string) {
    if (!data) return
    const next = { ...data }
    if (!next.favorites) next.favorites = []
    
    next.favorites = next.favorites.filter((f: any) => f.wordId !== wordId)
    await saveData(next)
  }

  function isFavorite(wordId: string): boolean {
    if (!data?.favorites) return false
    return data.favorites.some((f: any) => f.wordId === wordId)
  }

  // helpers for "kelimelerim" (my words)
  function makeMySetId(counter: number) {
    return `kelimelerim-set-${counter}`
  }

  // helper: create new "Kelimelerim" set
  function createMySet(title?: string) {
    const id = `kelimelerim-set-${Date.now()}-${Math.floor(Math.random()*999)}`
    return {
      id,
      title: title ?? `Kelimelerim Set ${new Date().toLocaleDateString()}`,
      totalWords: 0,
      completedCount: 0,
      learnedCount: 0,
      lastReviewed: null,
      completedTests: { LearnTest: 0, MatchTest: 0, TranslateTest: 0, FillTest: 0 },
      stars: 0,
      createdAt: new Date().toISOString(),
      words: []
    }
  }

  async function addMyWord(wordObj: { word: string, meaning?: string, example?: string, tags?: string[] }) {
    if (!data) throw new Error('Data not loaded')
    const next = { ...data }
    next.sets = next.sets || {}
    const groupKey = 'kelimelerim'
    next.sets[groupKey] = next.sets[groupKey] ?? []

    // find last set with <10 words
    let targetSet = (next.sets[groupKey] as any[]).find((s: any) => (s.words?.length ?? 0) < 10)
    if (!targetSet) {
      targetSet = createMySet(`Kelimelerim Set ${((next.sets[groupKey] as any[]).length ?? 0) + 1}`)
      next.sets[groupKey].push(targetSet)
    }
    const wid = `myw-${Date.now()}`
    const w = { id: wid, word: wordObj.word, meaning: wordObj.meaning ?? '', example: wordObj.example ?? '', tags: wordObj.tags ?? [] }
    targetSet.words = targetSet.words ?? []
    targetSet.words.push(w)
    targetSet.totalWords = targetSet.words.length

    await saveData(next)
    setData(next)
    return w
  }

  // import .xlsx or .csv from given uri (DocumentPicker uri)
  async function importMyWordsFromExcel(uri: string) {
    if (!data) throw new Error('Data not loaded')
    try {
      const lower = String(uri).toLowerCase()
      let rows: any[] = []

      if (lower.endsWith('.csv') || lower.includes('text/csv')) {
        // read as UTF8 text
        const txt = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 })
        const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        // assume first line header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          // simple CSV parse handling quoted fields
          const cols: string[] = []
          let cur = ''
          let inQ = false
          for (let ch of line) {
            if (ch === '"' ) { inQ = !inQ; continue }
            if (ch === ',' && !inQ) {
              cols.push(cur.trim()); cur = ''; continue
            }
            cur += ch
          }
          if (cur !== '') cols.push(cur.trim())
          rows.push(cols)
        }
      } else {
        // try as xlsx/xls - read as base64
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
        const XLSX = require('xlsx')
        const wb = XLSX.read(b64, { type: 'base64' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) // array of arrays
        // remove header row
        if (rows.length > 0) rows = rows.slice(1)
      }

      // normalize rows => { word, meaning, example }
      const items: { word:string, meaning:string, example:string }[] = []
      for (const r of rows) {
        if (!r || r.length === 0) continue
        const word = String(r[0] ?? '').trim()
        if (!word) continue
        const meaning = String(r[1] ?? '').trim()
        const example = String(r[2] ?? '').trim()
        items.push({ word, meaning, example })
      }

      if (items.length === 0) return { imported: 0 }

      // insert into data.sets.kelimelerim as 10-per-set
      const next = { ...data }
      next.sets = next.sets ?? {}
      next.sets.kelimelerim = next.sets.kelimelerim ?? []

      let currentSet = (next.sets.kelimelerim as any[]).find((s:any) => (s.words?.length ?? 0) < 10)
      for (const it of items) {
        if (!currentSet) {
          currentSet = createMySet(`Kelimelerim Set ${(next.sets.kelimelerim as any[]).length + 1}`)
          next.sets.kelimelerim.push(currentSet)
        }
        const wid = `myw-${Date.now()}-${Math.floor(Math.random()*999)}`
        currentSet.words = currentSet.words ?? []
        currentSet.words.push({ id: wid, word: it.word, meaning: it.meaning, example: it.example, tags: [] })
        currentSet.totalWords = currentSet.words.length
        if (currentSet.words.length >= 10) currentSet = null as any
      }

      await saveData(next)
      // ensure local state updated
      setData(next)
      return { imported: items.length }
    } catch (e) {
      console.warn('importMyWordsFromExcel error', e)
      throw e
    }
  }

  async function removeMySet(setId: string) {
    if (!data) return
    const next = { ...data }
    try {
      Object.keys(next.sets || {}).forEach(k => {
        next.sets[k] = (next.sets[k] as any[]).filter((s: any) => s.id !== setId)
      })
      await saveData(next)
      setData(next)
    } catch (e) {
      console.warn('removeMySet error', e)
    }
  }


  async function wipeProgressOnly() {
    try {
      const info = await FileSystem.getInfoAsync(DEST_PATH);
      if (!info.exists) {
        // Dosya yoksa yapılacak bir şey yok
        return;
      }

      let json = await FileSystem.readAsStringAsync(DEST_PATH);
      let parsed = JSON.parse(json);

      // Favorileri temizle
      parsed.favorites = [];

      // Tüm setlerde ilerleme alanlarını sıfırla
      Object.values(parsed.sets).forEach((setGroup: any) => {
        setGroup.forEach((set: any) => {
          set.completedCount = 0;
          set.learnedCount = 0;
          set.lastReviewed = null;
          set.stars = 0;
          set.completedTests = {
            LearnTest: 0,
            MatchTest: 0,
            TranslateTest: 0,
            FillTest: 0,
            SentenceTest: 0
          };
          if (Array.isArray(set.words)) {
            set.words.forEach((w: any) => {
              w.learned = false;
              w.star = 0;
            });
          }
        });
      });

      await FileSystem.writeAsStringAsync(DEST_PATH, JSON.stringify(parsed, null, 2));
      setData(parsed);
    } catch (e) {
      console.warn('wipeProgressOnly error', e);
    }
  }

  useEffect(() => { load() }, [])

  // at the end of provider value expose new functions
  return (
    <DataContext.Provider value={{
      data,
      loading,
      reload: load,
      saveData,
      updateSet,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      // new:
      addMyWord,
      importMyWordsFromExcel,
      removeMySet,
      wipeProgressOnly,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
