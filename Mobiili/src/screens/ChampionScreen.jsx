import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';         // EXPO
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // EXPO
import { getChampionDetail, splashUrl, spellUrl, passiveUrl } from '../api/ddragon';

const TABS = ['Stats', 'Skills', 'Builds'];

export default function ChampionScreen({ route, navigation }) {
  const { id, version } = route.params;
  const insets = useSafeAreaInsets(); // EXPO
  const [data, setData] = useState(null);
  const [tab, setTab]   = useState('Stats');

  useEffect(() => {
    getChampionDetail(id).then(({ champion }) => setData(champion));
  }, [id]);

  if (!data) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#C89B3C" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Splash art */}
      <Image source={{ uri: splashUrl(id) }} style={styles.splash} />
      <LinearGradient
        colors={['rgba(10,14,26,0.3)', '#0A0E1A']}
        style={styles.splashGradient}
      />

      {/* Back button — EXPO: uses insets.top */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Name block */}
      <View style={[styles.nameBlock, { marginTop: insets.top + 60 }]}>
        <Text style={styles.champName}>{data.name}</Text>
        <Text style={styles.champTitle}>{data.title}</Text>
        <View style={styles.tagRow}>
          {data.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t} onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'Stats'  && <StatsTab  stats={data.stats} info={data.info} />}
        {tab === 'Skills' && <SkillsTab data={data} version={version} />}
        {tab === 'Builds' && <BuildsTab tags={data.tags} />}
      </ScrollView>
    </View>
  );
}

// ─── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab({ stats, info }) {
  const combatStats = [
    { label: 'HP',           value: stats.hp,           max: 1200 },
    { label: 'Armor',        value: stats.armor,        max: 120  },
    { label: 'Magic Resist', value: stats.spellblock,   max: 60   },
    { label: 'Attack Dmg',   value: stats.attackdamage, max: 100  },
    { label: 'Move Speed',   value: stats.movespeed,    max: 400  },
    { label: 'Attack Range', value: stats.attackrange,  max: 700  },
    { label: 'HP Regen',     value: stats.hpregen,      max: 20   },
    { label: 'Mana',         value: stats.mp,           max: 1500 },
  ];

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionLabel}>CHAMPION RATINGS</Text>
      <View style={styles.ratingRow}>
        {['attack', 'defense', 'magic', 'difficulty'].map((key) => (
          <View key={key} style={styles.ratingItem}>
            <Text style={styles.ratingValue}>{info[key]}</Text>
            <View style={styles.ratingBarTrack}>
              <View style={[styles.ratingBarFill, { height: `${info[key] * 10}%` }]} />
            </View>
            <Text style={styles.ratingLabel}>{key.toUpperCase().slice(0,3)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>BASE STATS (Level 1)</Text>
      {combatStats.map((s) => (
        <View key={s.label} style={styles.statRow}>
          <Text style={styles.statLabel}>{s.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.min((s.value / s.max) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.statValue}>{Number(s.value).toFixed(0)}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── SKILLS TAB ───────────────────────────────────────────────────────────────
function SkillsTab({ data, version }) {
  const allAbilities = [
    {
      key: 'P',
      name: data.passive.name,
      desc: data.passive.description,
      imageUri: passiveUrl(version, data.passive.image.full),
      cooldown: null,
      cost: null,
    },
    ...data.spells.map((spell, i) => ({
      key: ['Q', 'W', 'E', 'R'][i],
      name: spell.name,
      desc: spell.description,
      imageUri: spellUrl(version, spell.image.full),
      cooldown: spell.cooldownBurn,
      cost: spell.costBurn,
    })),
  ];

  return (
    <View style={styles.tabContent}>
      {allAbilities.map((ability) => (
        <View key={ability.key} style={styles.abilityCard}>
          <View style={styles.abilityHeader}>
            <Image source={{ uri: ability.imageUri }} style={styles.abilityIcon} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.keyBadge}>
                  <Text style={styles.keyText}>{ability.key}</Text>
                </View>
                <Text style={styles.abilityName} numberOfLines={1}>{ability.name}</Text>
              </View>
              {ability.cooldown && (
                <Text style={styles.abilityMeta}>⏱ {ability.cooldown}s  ·  💧 {ability.cost}</Text>
              )}
            </View>
          </View>
          <Text style={styles.abilityDesc}>
            {ability.desc.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── BUILDS TAB ───────────────────────────────────────────────────────────────
const BUILDS = {
  Mage:      { core: ["Luden's Tempest", 'Shadowflame', "Rabadon's Deathcap"],
               boots: "Sorcerer's Shoes",
               situational: ["Zhonya's Hourglass", 'Void Staff', 'Horizon Focus'],
               runes: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Treasure Hunter'] },
  Assassin:  { core: ['Duskblade of Draktharr', 'Edge of Night', "Serpent's Fang"],
               boots: 'Ionian Boots of Lucidity',
               situational: ['Shadowflame', 'Guardian Angel', 'Serpent\'s Fang'],
               runes: ['Electrocute', 'Sudden Impact', 'Ghost Poro', 'Relentless Hunter'] },
  Fighter:   { core: ['Trinity Force', "Sterak's Gage", 'Ravenous Hydra'],
               boots: 'Plated Steelcaps',
               situational: ["Death's Dance", 'Maw of Malmortius', "Wit's End"],
               runes: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'] },
  Tank:      { core: ["Sunfire Aegis", "Heartsteel", "Thornmail"],
               boots: "Plated Steelcaps",
               situational: ["Warmog's Armor", "Gargoyle Stoneplate", "Force of Nature"],
               runes: ['Grasp of the Undying', 'Shield Bash', 'Bone Plating', 'Overgrowth'] },
  Support:   { core: ['Locket of the Iron Solari', 'Redemption', 'Knight\'s Vow'],
               boots: 'Ionian Boots of Lucidity',
               situational: ['Mikael\'s Blessing', 'Ardent Censer', 'Staff of Flowing Water'],
               runes: ['Summon Aery', 'Manaflow Band', 'Transcendence', 'Gathering Storm'] },
  Marksman:  { core: ["Kraken Slayer", "Galeforce", "Infinity Edge"],
               boots: "Berserker's Greaves",
               situational: ["Lord Dominik's Regards", 'Mortal Reminder', 'Guardian Angel'],
               runes: ['Lethal Tempo', 'Presence of Mind', 'Legend: Bloodline', 'Cut Down'] },
};

function BuildsTab({ tags }) {
  const build = BUILDS[tags[0]] ?? BUILDS.Mage;

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionLabel}>RECOMMENDED BUILD · {tags[0]?.toUpperCase()}</Text>

      <Text style={styles.buildCategory}>🥾 Boots</Text>
      <View style={styles.itemBadge}><Text style={styles.itemText}>{build.boots}</Text></View>

      <Text style={styles.buildCategory}>⚔️ Core Items</Text>
      {build.core.map((item, i) => (
        <View key={i} style={[styles.itemBadge, styles.coreItem]}>
          <View style={styles.itemNumberBadge}>
            <Text style={styles.itemNumber}>{i + 1}</Text>
          </View>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.buildCategory}>🛡️ Situational</Text>
      <View style={styles.situationalRow}>
        {build.situational.map((item, i) => (
          <View key={i} style={styles.situationalItem}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.buildCategory}>💎 Runes</Text>
      {build.runes.map((rune, i) => (
        <View key={i} style={styles.runeRow}>
          <View style={[styles.runeDot, i === 0 && styles.runeDotKeystone]} />
          <Text style={[styles.runeText, i === 0 && styles.runeKeystone]}>{rune}</Text>
        </View>
      ))}

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>💡 Want live builds?</Text>
        <Text style={styles.tipText}>
          Integrate the Riot Games API (free key at developer.riotgames.com)
          for real winrates, pick rates, and meta builds.
        </Text>
      </View>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0A0E1A' },
  loader:          { flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center' },

  splash:          { width: '100%', height: 260, position: 'absolute' },
  splashGradient:  { width: '100%', height: 260, position: 'absolute' },

  backBtn:         { position: 'absolute', left: 16, zIndex: 10,
                     backgroundColor: 'rgba(10,14,26,0.6)', borderRadius: 20,
                     paddingHorizontal: 14, paddingVertical: 6 },
  backText:        { color: '#C89B3C', fontWeight: '700', fontSize: 14 },

  nameBlock:       { paddingHorizontal: 20, paddingBottom: 8 },
  champName:       { color: '#C89B3C', fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  champTitle:      { color: '#AAA', fontSize: 14, marginTop: 2, fontStyle: 'italic' },
  tagRow:          { flexDirection: 'row', gap: 8, marginTop: 8 },
  tagChip:         { borderWidth: 1, borderColor: '#C89B3C55', borderRadius: 6,
                     paddingHorizontal: 10, paddingVertical: 3 },
  tagChipText:     { color: '#C89B3C', fontSize: 11, fontWeight: '600' },

  tabBar:          { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tabBtn:          { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
                     backgroundColor: '#13182A', borderWidth: 1, borderColor: '#1E2740' },
  tabActive:       { backgroundColor: '#C89B3C', borderColor: '#C89B3C' },
  tabLabel:        { color: '#666', fontWeight: '600', fontSize: 13 },
  tabLabelActive:  { color: '#0A0E1A' },

  scroll:          { flex: 1 },
  tabContent:      { paddingHorizontal: 16, paddingTop: 12 },
  sectionLabel:    { color: '#C89B3C', fontSize: 11, fontWeight: '700',
                     letterSpacing: 2, marginBottom: 12, marginTop: 4 },

  // Stats
  ratingRow:       { flexDirection: 'row', justifyContent: 'space-around',
                     backgroundColor: '#13182A', borderRadius: 12, padding: 16,
                     marginBottom: 20, height: 130 },
  ratingItem:      { alignItems: 'center', flex: 1 },
  ratingValue:     { color: '#C89B3C', fontSize: 18, fontWeight: '800' },
  ratingBarTrack:  { width: 8, backgroundColor: '#1E2740', borderRadius: 4,
                     flex: 1, marginVertical: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  ratingBarFill:   { width: '100%', backgroundColor: '#C89B3C', borderRadius: 4 },
  ratingLabel:     { color: '#555', fontSize: 9, fontWeight: '700' },

  statRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel:       { color: '#888', fontSize: 12, width: 105 },
  barTrack:        { flex: 1, height: 5, backgroundColor: '#1E2740', borderRadius: 3, overflow: 'hidden' },
  barFill:         { height: '100%', backgroundColor: '#C89B3C', borderRadius: 3 },
  statValue:       { color: '#E8E0D0', fontSize: 12, width: 40, textAlign: 'right' },

  // Skills
  abilityCard:     { backgroundColor: '#13182A', borderRadius: 12, padding: 14,
                     marginBottom: 12, borderWidth: 1, borderColor: '#1E2740' },
  abilityHeader:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  abilityIcon:     { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  keyBadge:        { backgroundColor: '#C89B3C', borderRadius: 5,
                     paddingHorizontal: 7, paddingVertical: 2 },
  keyText:         { color: '#0A0E1A', fontSize: 12, fontWeight: '800' },
  abilityName:     { color: '#E8E0D0', fontSize: 14, fontWeight: '700', flex: 1 },
  abilityMeta:     { color: '#666', fontSize: 11, marginTop: 3 },
  abilityDesc:     { color: '#999', fontSize: 12, lineHeight: 18 },

  // Builds
  buildCategory:   { color: '#E8E0D0', fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  itemBadge:       { backgroundColor: '#13182A', borderRadius: 8, padding: 12,
                     borderWidth: 1, borderColor: '#1E2740', marginBottom: 8 },
  coreItem:        { flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: '#C89B3C44' },
  itemNumberBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#C89B3C',
                     alignItems: 'center', justifyContent: 'center' },
  itemNumber:      { color: '#0A0E1A', fontWeight: '800', fontSize: 12 },
  itemText:        { color: '#CCC', fontSize: 13 },
  situationalRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  situationalItem: { backgroundColor: '#13182A', borderRadius: 8, padding: 10,
                     borderWidth: 1, borderColor: '#1E2740' },
  runeRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  runeDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  runeDotKeystone: { backgroundColor: '#C89B3C', width: 12, height: 12, borderRadius: 6 },
  runeText:        { color: '#888', fontSize: 13 },
  runeKeystone:    { color: '#C89B3C', fontWeight: '700', fontSize: 14 },
  tip:             { backgroundColor: '#13182A', borderRadius: 10, padding: 14,
                     marginTop: 20, borderLeftWidth: 3, borderLeftColor: '#C89B3C' },
  tipTitle:        { color: '#C89B3C', fontWeight: '700', marginBottom: 4 },
  tipText:         { color: '#888', fontSize: 12, lineHeight: 18 },
});