import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllChampions } from '../api/ddragon';
import ChampionCard from '../components/ChampionCard';

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets(); 
  const [champions, setChampions] = useState([]);
  const [version, setVersion]     = useState('');
  const [query, setQuery]         = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getAllChampions().then(({ version, champions }) => {
      setVersion(version);
      setChampions(champions);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return champions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [champions, query]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>CHAMPIONS</Text>
        <Text style={styles.subtitle}>League of Legends · Patch {version}</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name or role…"
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C89B3C" style={{ marginTop: 50 }} />
      ) : (
        <>
          <Text style={styles.count}>
            {filtered.length} champion{filtered.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <ChampionCard
                champion={item}
                version={version}
                onPress={() => navigation.navigate('Champion', { id: item.id, version })}
              />
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0A0E1A' },
  header:     { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  title:      { fontSize: 32, fontWeight: '900', color: '#C89B3C', letterSpacing: 4 },
  subtitle:   { fontSize: 13, color: '#555', marginTop: 2 },
  searchBox:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13182A', marginHorizontal: 16,
    borderRadius: 12, paddingHorizontal: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#1E2740',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input:      { flex: 1, height: 46, color: '#E8E0D0', fontSize: 15 },
  count:      { color: '#444', fontSize: 12, paddingHorizontal: 20, marginBottom: 10 },
  row:        { justifyContent: 'space-between', paddingHorizontal: 16 },
});