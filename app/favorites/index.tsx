import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function favorites() {
  return (
    <View style={styles.container}>
      <Text>favorites</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})