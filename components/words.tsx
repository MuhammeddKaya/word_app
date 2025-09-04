import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { StyleSheet, View, Text, ViewStyle, TouchableOpacity } from 'react-native';



export default function WordComponent({ name}: { name: string}) {
  return (
    <TouchableOpacity style={[styles.container ]}>
      <View>
        <Text>{name}</Text>""
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    height: 100,
    width: 200,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
});