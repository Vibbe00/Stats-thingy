import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSummonerProfile, checkBackendHealth } from '../api/riot';


const TIER_CONFIG = {
  IRON:        { color: '#6B6B6B', bg: '#1A1A1A', label: 'Iron'        },
  BRONZE:      { color: '#CD7F32', bg: '#1F1208', label: 'Bronze'      },
  SILVER:      { color: '#A8A9AD', bg: '#111418', label: 'Silver'      },
  GOLD:        { color: '#C89B3C', bg: '#1A1508', label: 'Gold'        },
  PLATINUM:    { color: '#0AC8B9', bg: '#071A19', label: 'Platinum'    },
  EMERALD:     { color: '#00C473', bg: '#071A0F', label: 'Emerald'     },
  DIAMOND:     { color: '#576BCE', bg: '#080D1F', label: 'Diamond'     },
  MASTER:      { color: '#9D48E0', bg: '#130820', label: 'Master'      },
  GRANDMASTER: { color: '#E84057', bg: '#1F0508', label: 'Grandmaster' },
  CHALLENGER:  { color: '#F4C874', bg: '#1A1200', label: 'Challenger'  },
};

const tierEmblemUrl = (tier) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblem/emblem-${tier?.toLowerCase()}.png`;


export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [profile,       setProfile]       = useState(null);  
  const [error,         setError]         = useState('');
  const [backendOnline, setBackendOnline] = useState(null);   


  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
  }, []);

  const handleSearch = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const hashIndex = trimmed.indexOf('#');
    if (hashIndex === -1) {
      setError('Include your tag — format: Name#TAG  (e.g. HesburgerCEO#EUNE)');
      return;
    }

    const gameName = trimmed.slice(0, hashIndex).trim();
    const tagLine  = trimmed.slice(hashIndex + 1).trim();

    if (!gameName || !tagLine) {
      setError('Both name and tag are required — e.g. Faker#KR1');
      return;
    }

    setLoading(true);
    setError('');
    setProfile(null);

    try {
      const data = await getSummonerProfile(gameName, tagLine);
      setProfile(data);
    } catch (err) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A0E1A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>PROFILE</Text>
        <Text style={styles.subtitle}>Search by Riot ID  (Name#TAG)</Text>

        {/* Backend status indicator */}
        <BackendStatus online={backendOnline} />

        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="HesburgerCEO#EUNE"
            placeholderTextColor="#444"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#0A0E1A" />
              : <Text style={styles.searchBtnText}>GO</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
          </View>
        )}

        {/* ── Profile Result ── */}
        {profile && <ProfileResult profile={profile} />}

        {/* Empty state */}
        {!profile && !loading && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>
              Enter a Riot ID to view{'\n'}profile and ranked stats
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BackendStatus({ online }) {
  if (online === null) return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, { backgroundColor: '#555' }]} />
      <Text style={styles.statusText}>Checking server…</Text>
    </View>
  );

  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, { backgroundColor: online ? '#4FBB82' : '#BB4F4F' }]} />
      <Text style={[styles.statusText, { color: online ? '#4FBB82' : '#BB4F4F' }]}>
        {online ? 'Server online' : 'Server offline — start the backend first'}
      </Text>
    </View>
  );
}


function ProfileResult({ profile }) {
  return (
    <View style={styles.profileSection}>

      {/* Profile Card — account + summoner fields */}
      <LinearGradient colors={['#13182A', '#0F1320']} style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {/* summoner.profileIconUrl — "Full URL ready to use in an <img> tag" */}
          <View style={styles.iconWrapper}>
            <Image
              source={{ uri: profile.summoner.profileIconUrl }}
              style={styles.profileIcon}
            />
            {/* summoner.level */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{profile.summoner.level}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            {/* account.gameName + account.tagLine */}
            <Text style={styles.summonerName}>
              {profile.account.gameName}
              <Text style={styles.tagLine}>#{profile.account.tagLine}</Text>
            </Text>
            <Text style={styles.puuid} numberOfLines={1}>
              {profile.account.puuid.slice(0, 20)}…
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Ranked — ranked.soloQueue | ranked.flexQueue (RankedStats | null) */}
      <Text style={styles.sectionLabel}>RANKED STATS</Text>
      <RankCard title="Solo / Duo" icon="⚔️" stats={profile.ranked.soloQueue} />
      <RankCard title="Flex 5v5"   icon="👥" stats={profile.ranked.flexQueue}  />
    </View>
  );
}


function RankCard({ title, icon, stats }) {
  // stats is RankedStats | null
  if (!stats) {
    return (
      <View style={[styles.rankCard, styles.rankCardUnranked]}>
        <View style={styles.unrankedLeft}>
          <Text style={styles.rankCardTitle}>{icon}  {title}</Text>
          <Text style={styles.unrankedText}>Unranked</Text>
        </View>
      </View>
    );
  }

  const cfg         = TIER_CONFIG[stats.tier] ?? TIER_CONFIG.IRON;
  const gamesPlayed = stats.wins + stats.losses;

  return (
    <LinearGradient
      colors={[cfg.bg, '#0A0E1A']}
      style={[styles.rankCard, { borderColor: cfg.color + '55' }]}
    >
      {/* Tier emblem image */}
      <Image
        source={{ uri: tierEmblemUrl(stats.tier) }}
        style={styles.emblem}
        resizeMode="contain"
      />

      {/* Middle — tier, rank, LP, W/L */}
      <View style={styles.rankInfo}>
        <Text style={styles.rankCardTitle}>{icon}  {title}</Text>

        {/* tier + rank e.g. "Gold II" */}
        <Text style={[styles.tierText, { color: cfg.color }]}>
          {cfg.label} {stats.rank}
        </Text>

        {/* leaguePoints */}
        <Text style={[styles.lpText, { color: cfg.color }]}>
          {stats.leaguePoints} LP
        </Text>

        {/* wins / losses */}
        <View style={styles.wlRow}>
          <Text style={styles.wins}>{stats.wins}W</Text>
          <Text style={styles.wlSep}> / </Text>
          <Text style={styles.losses}>{stats.losses}L</Text>
          <Text style={styles.games}> · {gamesPlayed} games</Text>
        </View>
      </View>

      {/* Right — winRate + hotStreak */}
      <View style={styles.rankRight}>
        <WinRateRing winRate={stats.winRate} />
        {/* hotStreak boolean from RankedStats */}
        {stats.hotStreak && (
          <View style={styles.hotStreakBadge}>
            <Text style={styles.hotStreakText}>🔥 HOT</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

function WinRateRing({ winRate }) {
  const color = winRate >= 60 ? '#4FBB82'
              : winRate >= 50 ? '#C89B3C'
              : '#BB4F4F';
  return (
    <View style={[styles.ringOuter, { borderColor: color }]}>
      <Text style={[styles.ringText, { color }]}>{winRate}%</Text>
      <Text style={styles.ringLabel}>WR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { paddingHorizontal: 16 },

  title:             { fontSize: 32, fontWeight: '900', color: '#C89B3C', letterSpacing: 4, marginBottom: 4 },
  subtitle:          { fontSize: 13, color: '#555', marginBottom: 10 },

  statusRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  statusDot:         { width: 8, height: 8, borderRadius: 4 },
  statusText:        { color: '#555', fontSize: 12 },


  searchRow:         { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input:             {
    flex: 1, height: 50, backgroundColor: '#13182A',
    borderRadius: 12, paddingHorizontal: 16,
    color: '#E8E0D0', fontSize: 15,
    borderWidth: 1, borderColor: '#1E2740',
  },
  searchBtn:         {
    width: 56, height: 50, backgroundColor: '#C89B3C',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText:     { color: '#0A0E1A', fontWeight: '900', fontSize: 14 },

  errorBox:          {
    backgroundColor: '#2A0F0F', borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderLeftColor: '#BB4F4F', marginBottom: 12,
  },
  errorText:         { color: '#FF6B6B', fontSize: 13, lineHeight: 18 },

  profileSection:    { marginTop: 8 },
  sectionLabel:      {
    color: '#C89B3C', fontSize: 11, fontWeight: '700',
    letterSpacing: 2, marginBottom: 10, marginTop: 16,
  },

  profileCard:       { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E2740' },
  profileHeader:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrapper:       { position: 'relative' },
  profileIcon:       { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#C89B3C' },
  levelBadge:        {
    position: 'absolute', bottom: -6, alignSelf: 'center',
    left: '50%', marginLeft: -14,
    backgroundColor: '#C89B3C', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, minWidth: 28, alignItems: 'center',
  },
  levelText:         { color: '#0A0E1A', fontSize: 11, fontWeight: '900' },
  profileInfo:       { flex: 1 },
  summonerName:      { color: '#E8E0D0', fontSize: 20, fontWeight: '800' },
  tagLine:           { color: '#555', fontSize: 16, fontWeight: '400' },
  puuid:             { color: '#2A2A3A', fontSize: 10, marginTop: 4, fontFamily: 'monospace' },

  // Rank card
  rankCard:          {
    borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1,
  },
  rankCardUnranked:  { backgroundColor: '#13182A', borderColor: '#1E2740' },
  unrankedLeft:      { flex: 1 },
  emblem:            { width: 60, height: 60 },
  rankInfo:          { flex: 1 },
  rankCardTitle:     { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  tierText:          { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  lpText:            { fontSize: 13, fontWeight: '700', marginTop: 2 },
  wlRow:             { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  wins:              { color: '#4FBB82', fontWeight: '700', fontSize: 13 },
  wlSep:             { color: '#444', fontSize: 13 },
  losses:            { color: '#BB4F4F', fontWeight: '700', fontSize: 13 },
  games:             { color: '#555', fontSize: 11 },
  unrankedText:      { color: '#444', fontSize: 16, fontWeight: '600', marginTop: 4 },
  rankRight:         { alignItems: 'center', gap: 8 },

  ringOuter:         {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 4, justifyContent: 'center', alignItems: 'center',
  },
  ringText:          { fontSize: 13, fontWeight: '800' },
  ringLabel:         { color: '#555', fontSize: 9, fontWeight: '700' },

  hotStreakBadge:    {
    backgroundColor: '#2A1500', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: '#FF6B0033',
  },
  hotStreakText:     { color: '#FF8C00', fontSize: 10, fontWeight: '700' },

  emptyState:        { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon:         { fontSize: 48 },
  emptyText:         { color: '#444', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});