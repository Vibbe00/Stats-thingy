import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { portraitUrl } from '../api/ddragon';

const TAG_COLORS = {
  Mage:      '#6B4FBB', Assassin: '#BB4F4F',
  Fighter:   '#C89B3C', Tank:     '#4F7ABB',
  Support:   '#4FBB82', Marksman: '#BB8C4F',
};

export default function ChampionCard({ champion, version, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: portraitUrl(version, champion.id) }} style={styles.image} />

      {}
      <LinearGradient
        colors={['transparent', 'rgba(10,14,26,0.95)']}
        style={styles.gradient}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{champion.name}</Text>
        <View style={styles.tags}>
          {champion.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: TAG_COLORS[tag] ?? '#333' }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:     {
    width: '48%', backgroundColor: '#13182A',
    borderRadius: 14, marginBottom: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#1E2740',
  },
  image:    { width: '100%', height: 120 },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  info:     { padding: 10 },
  name:     { color: '#E8E0D0', fontWeight: '700', fontSize: 14 },
  tags:     { flexDirection: 'row', marginTop: 6, gap: 4 },
  tag:      { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText:  { color: '#fff', fontSize: 10, fontWeight: '600' },
});