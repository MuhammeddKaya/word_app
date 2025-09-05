import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, ViewStyle, TouchableOpacity } from 'react-native';

type Props = {
  id: string;
  name: string;
  style?: ViewStyle | ViewStyle[];
  star?: number;
};

export default function TestComponent({ id, name, style, star = 0 }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => router.push(`/tests?setId=${encodeURIComponent(id)}`)}
    >
      <Text>{name}</Text>

      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < star;
          return (
            <Ionicons
              key={i}
              name={filled ? 'star' : 'star-outline'}
              size={18}
              color={filled ? '#FFD700' : '#999'}
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
    backgroundColor: '#AED6CF',
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