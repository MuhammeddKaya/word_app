import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { useData } from '../app/lib/DataProvider';
import { useTheme } from '../app/lib/ThemeProvider';

type Props = {
  id: string;
  name: string;
  style?: ViewStyle | ViewStyle[];
  star?: number;
};

export default function TestComponent({ id, name, style, star }: Props) {
  const router = useRouter();
  const { data } = useData();
  const { theme } = useTheme();

  // compute stars from completedTests if star prop not provided
  const computedStar = React.useMemo(() => {
    if (typeof star === 'number') return Math.max(0, Math.min(4, star));
    const sets = data?.sets ?? {};
    const all = Object.values(sets as Record<string, any[]>).flat();
    const s = all.find((x: any) => x.id === id);
    const tests = s?.completedTests ?? {};
    const done = Object.values(tests).filter((v: any) => Number(v) > 0).length;
    return Math.min(4, done);
  }, [data, id, star]);

  return (
    <TouchableOpacity
      style={[styles.container, style, { backgroundColor: theme === 'light' ? '#fff' : '#333' }]}
      onPress={() => router.push(`/tests?setId=${encodeURIComponent(id)}`)}
    >
      <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>{name}</Text>

      <View style={styles.starsRow}>
        {Array.from({ length: 4 }).map((_, i) => {
          const filled = i < computedStar;
          return (
            <Ionicons
              key={i}
              name={filled ? 'star' : 'star-outline'}
              size={18}
              color={filled ? theme === 'light' ? '#ffd000ff' : '#f11212ff' : '#999'}
              style={styles.star}
            />
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    height: 100,
    width: 200,
    backgroundColor: '#ffffff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  star: {
    marginHorizontal: 2,
  },
});