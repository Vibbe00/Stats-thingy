import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  checkBackendHealth,
  getSummonerProfile,
  getSummonerMatches,
  getSummonerChampions,
  getRecentSummoners,
} from '../api/riot';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#1b1b1b',          // body
  card:      'rgb(44, 44, 44)',  // summoner card / rank card divs
  cardBorder:'#333333',
  accent:    '#4b995c',          // header green
  accentDim: '#4b995c88',
  accentBg:  '#4b995c18',
  textPri:   '#f0f0f0',
  textSec:   '#999999',
  textMuted: '#555555',
  win:       '#4FBB82',
  loss:      '#BB4F4F',
  font:      Platform.OS === 'ios' ? 'Arial' : 'sans-serif', // Arial, Helvetica, sans-serif
};

// ─── Regions ──────────────────────────────────────────────────────────────────
const REGIONS = [
  { label: 'EUW',  value: 'euw',  flag: '🇪🇺' },
  { label: 'EUNE', value: 'eune', flag: '🇪🇺' },
  { label: 'NA',   value: 'na',   flag: '🇺🇸' },
  { label: 'KR',   value: 'kr',   flag: '🇰🇷' },
  { label: 'BR',   value: 'br',   flag: '🇧🇷' },
  { label: 'LAN',  value: 'lan',  flag: '🌎'  },
  { label: 'LAS',  value: 'las',  flag: '🌎'  },
  { label: 'JP',   value: 'jp',   flag: '🇯🇵' },
  { label: 'TR',   value: 'tr',   flag: '🇹🇷' },
  { label: 'RU',   value: 'ru',   flag: '🇷🇺' },
  { label: 'OCE',  value: 'oce',  flag: '🇦🇺' },
  { label: 'PH',   value: 'ph',   flag: '🇵🇭' },
  { label: 'SG',   value: 'sg',   flag: '🇸🇬' },
  { label: 'TH',   value: 'th',   flag: '🇹🇭' },
  { label: 'TW',   value: 'tw',   flag: '🇹🇼' },
  { label: 'VN',   value: 'vn',   flag: '🇻🇳' },
];

// ─── Tier config ──────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  IRON:        { color: '#8a8a8a', bg: '#222222', label: 'Iron'        },
  BRONZE:      { color: '#CD7F32', bg: '#261a0e', label: 'Bronze'      },
  SILVER:      { color: '#b0b5bb', bg: '#1e2022', label: 'Silver'      },
  GOLD:        { color: '#d4a843', bg: '#252010', label: 'Gold'        },
  PLATINUM:    { color: '#0AC8B9', bg: '#0e2120', label: 'Platinum'    },
  EMERALD:     { color: '#4b995c', bg: '#0f2014', label: 'Emerald'     },
  DIAMOND:     { color: '#7a9de0', bg: '#141826', label: 'Diamond'     },
  MASTER:      { color: '#a855d4', bg: '#1a0e22', label: 'Master'      },
  GRANDMASTER: { color: '#e05555', bg: '#220e0e', label: 'Grandmaster' },
  CHALLENGER:  { color: '#e8c96e', bg: '#241e08', label: 'Challenger'  },
};

const TIER_EMOJI = {
  IRON: '⚫', BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇',
  PLATINUM: '🔵', EMERALD: '💚', DIAMOND: '💠',
  MASTER: '💎', GRANDMASTER: '👑', CHALLENGER: '🏆',
};

const tierEmblemUrl = (tier) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblem/emblem-${tier?.toLowerCase()}.png`;

const QUEUE_LABELS = { 420: 'Ranked Solo', 440: 'Ranked Flex', 400: 'Normal Draft' };

const QUEUE_FILTERS = [
  { label: 'All',   value: undefined },
  { label: 'Solo',  value: 'solo'    },
  { label: 'Flex',  value: 'flex'    },
  { label: 'Draft', value: 'draft'   },
];

const TABS = ['Overview', 'Matches', 'Champions'];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const [input,         setInput]         = useState('');
  const [region,        setRegion]        = useState(REGIONS[1]);
  const [showPicker,    setShowPicker]    = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [backendOnline, setBackendOnline] = useState(null);

  const [profile,         setProfile]         = useState(null);
  const [matches,         setMatches]         = useState(null);
  const [matchesLoading,  setMatchesLoading]  = useState(false);
  const [champions,       setChampions]       = useState(null);
  const [activeTab,       setActiveTab]       = useState('Overview');
  const [queueFilter,     setQueueFilter]     = useState(QUEUE_FILTERS[0]);
  const [recentSummoners, setRecentSummoners] = useState([]);
  const [lastSearch,      setLastSearch]      = useState(null);

  useEffect(() => {
    checkBackendHealth().then((online) => {
      setBackendOnline(online);
      if (online) {
        getRecentSummoners()
          .then((d) => setRecentSummoners(d.summoners ?? []))
          .catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    if (!lastSearch) return;
    fetchMatches(lastSearch.region, lastSearch.gameName, lastSearch.tagLine, queueFilter.value);
  }, [queueFilter]);

  const fetchMatches = async (region, gameName, tagLine, queue) => {
    setMatchesLoading(true);
    try {
      const data = await getSummonerMatches(region, gameName, tagLine, 20, queue);
      setMatches(data);
    } catch {
      setMatches({ matches: [] });
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const hashIndex = trimmed.indexOf('#');
    if (hashIndex === -1) { setError('Format: Name#TAG'); return; }
    const gameName = trimmed.slice(0, hashIndex).trim();
    const tagLine  = trimmed.slice(hashIndex + 1).trim();
    if (!gameName || !tagLine) { setError('Both name and tag are required'); return; }

    setLoading(true);
    setError('');
    setProfile(null);
    setMatches(null);
    setChampions(null);
    setActiveTab('Overview');
    setQueueFilter(QUEUE_FILTERS[0]);

    const search = { region: region.value, gameName, tagLine };
    setLastSearch(search);

    try {
      const [profileData, matchData, champData] = await Promise.all([
        getSummonerProfile(region.value, gameName, tagLine),
        getSummonerMatches(region.value, gameName, tagLine, 20),
        getSummonerChampions(region.value, gameName, tagLine),
      ]);
      setProfile(profileData);
      setMatches(matchData);
      setChampions(champData);
      getRecentSummoners().then((d) => setRecentSummoners(d.summoners ?? [])).catch(() => {});
    } catch (err) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RegionPickerModal
        visible={showPicker}
        selected={region}
        onSelect={(r) => { setRegion(r); setShowPicker(false); }}
        onClose={() => setShowPicker(false)}
      />

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
        <Text style={styles.subtitle}>Search by Riot ID</Text>

        <BackendStatus online={backendOnline} />

        {/* Search */}
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.regionBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.regionBtnFlag}>{region.flag}</Text>
            <Text style={styles.regionBtnLabel}>{region.label}</Text>
            <Text style={styles.regionBtnArrow}>▾</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Name#TAG"
            placeholderTextColor={T.textMuted}
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
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.searchBtnText}>GO</Text>
            }
          </TouchableOpacity>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
          </View>
        )}

        {/* Results */}
        {profile && (
          <View style={{ marginTop: 8 }}>
            <ProfileHeader profile={profile} region={region} />

            <View style={styles.tabBar}>
              {TABS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
                  onPress={() => setActiveTab(t)}
                >
                  <Text style={[styles.tabLabel, activeTab === t && styles.tabLabelActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeTab === 'Overview'  && <OverviewTab profile={profile} />}
            {activeTab === 'Matches'   && (
              <MatchesTab
                matches={matches}
                loading={matchesLoading}
                queueFilter={queueFilter}
                onQueueChange={setQueueFilter}
              />
            )}
            {activeTab === 'Champions' && <ChampionsTab champions={champions} />}
          </View>
        )}

        {/* Empty / recent */}
        {!profile && !loading && !error && (
          recentSummoners.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
              {recentSummoners.map((s, i) => (
                <RecentSummonerRow
                  key={i}
                  summoner={s}
                  onPress={() => setInput(`${s.gameName}#${s.tagLine}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔎</Text>
              <Text style={styles.emptyText}>Select a region and enter{'\n'}a Riot ID to search</Text>
            </View>
          )
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Recent Summoner Row ──────────────────────────────────────────────────────
function RecentSummonerRow({ summoner, onPress }) {
  return (
    <TouchableOpacity style={styles.recentRow} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: summoner.profileIconUrl }} style={styles.recentIcon} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentName}>
          {summoner.gameName}<Text style={styles.recentTag}>#{summoner.tagLine}</Text>
        </Text>
        <Text style={styles.recentLevel}>Level {summoner.level}</Text>
      </View>
      <Text style={styles.recentArrow}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Profile Header ───────────────────────────────────────────────────────────
function ProfileHeader({ profile, region }) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.iconWrapper}>
          <Image source={{ uri: profile.summoner.profileIconUrl }} style={styles.profileIcon} />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.summoner.level}</Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.summonerName}>
            {profile.account.gameName}
            <Text style={styles.tagLine}>#{profile.account.tagLine}</Text>
          </Text>
          <View style={styles.regionPill}>
            <Text style={styles.regionPillText}>{region.flag} {region.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ profile }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>RANKED STATS</Text>
      <RankCard title="Solo / Duo" icon="⚔️" stats={profile.ranked.soloQueue} />
      <RankCard title="Flex 5v5"   icon="👥" stats={profile.ranked.flexQueue}  />
    </View>
  );
}

// ─── Matches Tab ──────────────────────────────────────────────────────────────
function MatchesTab({ matches, loading, queueFilter, onQueueChange }) {
  return (
    <View>
      <View style={styles.filterRow}>
        {QUEUE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterBtn, queueFilter.label === f.label && styles.filterBtnActive]}
            onPress={() => onQueueChange(f)}
          >
            <Text style={[styles.filterLabel, queueFilter.label === f.label && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={T.accent} style={{ marginTop: 24 }} />
      ) : !matches ? (
        <LoadingBlock />
      ) : !matches.matches?.length ? (
        <EmptyBlock text="No matches found for this filter" />
      ) : (
        <View>
          <Text style={styles.sectionLabel}>RECENT MATCHES</Text>
          {matches.matches.map((match) => (
            <MatchRow key={match.matchId} match={match} />
          ))}
        </View>
      )}
    </View>
  );
}

function MatchRow({ match }) {
  const p        = match.player;
  const duration = `${Math.floor(match.gameDuration / 60)}:${String(match.gameDuration % 60).padStart(2, '0')}`;
  const qLabel   = QUEUE_LABELS[match.queueId] ?? match.gameMode;
  const winColor = p.win ? T.win : T.loss;

  return (
    <View style={[styles.matchRow, { borderLeftColor: winColor }]}>
      <View style={styles.matchLeft}>
        <Image source={{ uri: p.championIcon }} style={styles.matchChampIcon} />
        {p.summonerSpells?.length > 0 && (
          <View style={styles.spellsCol}>
            {p.summonerSpells.slice(0, 2).map((spell, i) =>
              spell.icon
                ? <Image key={i} source={{ uri: spell.icon }} style={styles.spellIcon} />
                : <View key={i} style={styles.spellIconEmpty} />
            )}
          </View>
        )}
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.matchChampName}>{p.championName}</Text>
        <Text style={styles.matchMeta}>{qLabel} · {duration}</Text>
        <View style={styles.matchKda}>
          <Text style={styles.matchK}>{p.kills}</Text>
          <Text style={styles.matchSlash}> / </Text>
          <Text style={styles.matchD}>{p.deaths}</Text>
          <Text style={styles.matchSlash}> / </Text>
          <Text style={styles.matchA}>{p.assists}</Text>
          <Text style={styles.matchKdaRatio}> ({p.kda.toFixed(2)} KDA)</Text>
        </View>
        <Text style={styles.matchStats}>
          {p.cs} CS · {p.visionScore} VS · {(p.damageDealt / 1000).toFixed(1)}k DMG
        </Text>
      </View>

      <View style={styles.matchRight}>
        <View style={[styles.winBadge, { backgroundColor: winColor + '22', borderColor: winColor + '55' }]}>
          <Text style={[styles.winBadgeText, { color: winColor }]}>{p.win ? 'WIN' : 'LOSS'}</Text>
        </View>
        <View style={styles.itemsGrid}>
          {p.items.slice(0, 6).map((item, i) => (
            item.icon
              ? <Image key={i} source={{ uri: item.icon }} style={styles.itemIcon} />
              : <View key={i} style={styles.itemIconEmpty} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Champions Tab ────────────────────────────────────────────────────────────
function ChampionsTab({ champions }) {
  if (!champions) return <LoadingBlock />;
  if (!champions.champions?.length) return <EmptyBlock text="No champion data yet — play some games first" />;
  return (
    <View>
      <Text style={styles.sectionLabel}>CHAMPION STATS</Text>
      {champions.champions.slice(0, 10).map((champ) => (
        <ChampionRow key={champ.championId} champ={champ} />
      ))}
    </View>
  );
}

function ChampionRow({ champ }) {
  const wrPct   = Math.round(champ.winRate * 100);
  const wrColor = wrPct >= 60 ? T.win : wrPct >= 50 ? T.accent : T.loss;
  return (
    <View style={styles.champRow}>
      {champ.championIcon
        ? <Image source={{ uri: champ.championIcon }} style={styles.champIcon} />
        : <View style={styles.champIconEmpty} />
      }
      <View style={styles.champLeft}>
        <Text style={styles.champName} numberOfLines={1}>{champ.championName}</Text>
        <Text style={styles.champGames}>{champ.gamesPlayed} games</Text>
      </View>
      <View style={styles.champMid}>
        <Text style={styles.champKda}>
          {champ.avgKills.toFixed(1)} / {champ.avgDeaths.toFixed(1)} / {champ.avgAssists.toFixed(1)}
        </Text>
        <Text style={styles.champKdaLabel}>{champ.avgKda.toFixed(2)} KDA · {champ.avgCs.toFixed(0)} CS</Text>
      </View>
      <View style={styles.champRight}>
        <Text style={[styles.champWr, { color: wrColor }]}>{wrPct}%</Text>
        <Text style={styles.champWrLabel}>{champ.wins}W {champ.losses}L</Text>
      </View>
    </View>
  );
}

// ─── Rank Card ────────────────────────────────────────────────────────────────
function RankCard({ title, icon, stats }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!stats) {
    return (
      <View style={styles.rankCard}>
        <View style={[styles.emblemWrapper, { backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }]}>
          <Text style={styles.emblemEmoji}>➖</Text>
          <Text style={styles.emblemLabel}>NONE</Text>
        </View>
        <View style={styles.rankInfo}>
          <Text style={styles.rankCardTitle}>{icon}  {title}</Text>
          <Text style={styles.unrankedText}>Unranked</Text>
        </View>
      </View>
    );
  }

  const cfg        = TIER_CONFIG[stats.tier] ?? TIER_CONFIG.IRON;
  const wrPct      = Math.round(stats.winRate * 100);
  const wrColor    = wrPct >= 60 ? T.win : wrPct >= 50 ? T.accent : T.loss;
  const rankSuffix = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(stats.tier) ? '' : ` ${stats.rank}`;

  return (
    <View style={[styles.rankCard, { borderColor: cfg.color + '44' }]}>
      <View style={[styles.emblemWrapper, { borderColor: cfg.color + '55', backgroundColor: cfg.color + '18' }]}>
        {!imgFailed ? (
          <Image
            source={{ uri: tierEmblemUrl(stats.tier) }}
            style={styles.emblemImage}
            resizeMode="contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <>
            <Text style={styles.emblemEmoji}>{TIER_EMOJI[stats.tier] ?? '⚫'}</Text>
            <Text style={[styles.emblemLabel, { color: cfg.color }]}>
              {cfg.label.slice(0, 4).toUpperCase()}
            </Text>
          </>
        )}
      </View>

      <View style={styles.rankInfo}>
        <Text style={styles.rankCardTitle}>{icon}  {title}</Text>
        <Text style={[styles.tierText, { color: cfg.color }]}>{cfg.label}{rankSuffix}</Text>
        <Text style={[styles.lpText, { color: cfg.color + 'CC' }]}>{stats.leaguePoints} LP</Text>
        <View style={styles.wlRow}>
          <Text style={styles.wins}>{stats.wins}W</Text>
          <Text style={styles.wlSep}> / </Text>
          <Text style={styles.losses}>{stats.losses}L</Text>
        </View>
      </View>

      <View style={styles.rankRight}>
        <View style={[styles.ringOuter, { borderColor: wrColor }]}>
          <Text style={[styles.ringText, { color: wrColor }]}>{wrPct}%</Text>
          <Text style={styles.ringLabel}>WR</Text>
        </View>
        {stats.hotStreak && (
          <View style={styles.hotStreakBadge}>
            <Text style={styles.hotStreakText}>🔥 HOT</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Region Picker Modal ──────────────────────────────────────────────────────
function RegionPickerModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>SELECT REGION</Text>
          <View style={styles.regionGrid}>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.regionItem, selected.value === r.value && styles.regionItemActive]}
                onPress={() => onSelect(r)}
              >
                <Text style={styles.regionFlag}>{r.flag}</Text>
                <Text style={[styles.regionLabel, selected.value === r.value && styles.regionLabelActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Backend Status ───────────────────────────────────────────────────────────
function BackendStatus({ online }) {
  const color = online === null ? T.textMuted : online ? T.accent : T.loss;
  const text  = online === null ? 'Checking server…'
              : online          ? 'Server online'
              : 'Server offline — start the backend first';
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
}

const LoadingBlock = () => (
  <ActivityIndicator size="large" color={T.accent} style={{ marginTop: 32 }} />
);
const EmptyBlock = ({ text }) => (
  <View style={styles.emptyBlock}>
    <Text style={styles.emptyBlockText}>{text}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:         { paddingHorizontal: 16 },

  // Header — #4b995c green
  title:             { fontSize: 32, fontWeight: '900', color: T.accent, letterSpacing: 4, marginBottom: 4, fontFamily: T.font },
  subtitle:          { fontSize: 13, color: T.textMuted, marginBottom: 10, fontFamily: T.font },

  statusRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  statusDot:         { width: 8, height: 8, borderRadius: 4 },
  statusText:        { fontSize: 12, fontFamily: T.font },

  // Search
  searchRow:         { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' },
  regionBtn:         {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: T.card, borderRadius: 10,
    paddingHorizontal: 10, height: 50,
    borderWidth: 1, borderColor: T.cardBorder,
  },
  regionBtnFlag:     { fontSize: 16 },
  regionBtnLabel:    { color: T.accent, fontWeight: '700', fontSize: 12, fontFamily: T.font },
  regionBtnArrow:    { color: T.textMuted, fontSize: 10 },
  input:             {
    flex: 1, height: 50, backgroundColor: T.card,
    borderRadius: 10, paddingHorizontal: 14,
    color: T.textPri, fontSize: 15,
    borderWidth: 1, borderColor: T.cardBorder,
    fontFamily: T.font,
  },
  searchBtn:         { width: 56, height: 50, backgroundColor: T.accent, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText:     { color: '#fff', fontWeight: '900', fontSize: 14, fontFamily: T.font },

  errorBox:          { backgroundColor: '#2a1010', borderRadius: 8, padding: 12, borderLeftWidth: 3, borderLeftColor: T.loss, marginBottom: 12 },
  errorText:         { color: '#ff7070', fontSize: 13, lineHeight: 18, fontFamily: T.font },

  // Recent
  recentRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: T.cardBorder, gap: 12 },
  recentIcon:        { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: T.accentDim },
  recentInfo:        { flex: 1 },
  recentName:        { color: T.textPri, fontWeight: '700', fontSize: 14, fontFamily: T.font },
  recentTag:         { color: T.textMuted, fontWeight: '400' },
  recentLevel:       { color: T.textSec, fontSize: 12, marginTop: 2, fontFamily: T.font },
  recentArrow:       { color: T.accent, fontSize: 22, fontWeight: '300' },

  // Profile card — rgb(44,44,44)
  profileCard:       { backgroundColor: T.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: T.cardBorder, marginBottom: 4 },
  profileHeader:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrapper:       { position: 'relative' },
  profileIcon:       { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: T.accent },
  levelBadge:        { position: 'absolute', bottom: -6, left: '50%', marginLeft: -14, backgroundColor: T.accent, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, minWidth: 28, alignItems: 'center' },
  levelText:         { color: '#fff', fontSize: 11, fontWeight: '900', fontFamily: T.font },
  profileInfo:       { flex: 1 },
  summonerName:      { color: T.textPri, fontSize: 20, fontWeight: '800', fontFamily: T.font },
  tagLine:           { color: T.textMuted, fontSize: 16, fontWeight: '400' },
  regionPill:        { marginTop: 6, alignSelf: 'flex-start', backgroundColor: T.accentBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: T.accentDim },
  regionPillText:    { color: T.accent, fontSize: 11, fontWeight: '600', fontFamily: T.font },

  // Tabs
  tabBar:            { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 4 },
  tabBtn:            { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder },
  tabBtnActive:      { backgroundColor: T.accent, borderColor: T.accent },
  tabLabel:          { color: T.textMuted, fontWeight: '700', fontSize: 12, fontFamily: T.font },
  tabLabelActive:    { color: '#fff' },

  sectionLabel:      { color: T.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10, marginTop: 14, fontFamily: T.font },

  // Queue filter
  filterRow:         { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 2 },
  filterBtn:         { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder },
  filterBtnActive:   { borderColor: T.accent, backgroundColor: T.accentBg },
  filterLabel:       { color: T.textMuted, fontWeight: '600', fontSize: 12, fontFamily: T.font },
  filterLabelActive: { color: T.accent },

  // Rank card — rgb(44,44,44)
  rankCard:          { backgroundColor: T.card, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: T.cardBorder },
  emblemWrapper:     { width: 68, height: 68, borderRadius: 34, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  emblemImage:       { width: 68, height: 68 },
  emblemEmoji:       { fontSize: 28 },
  emblemLabel:       { fontSize: 8, fontWeight: '800', marginTop: 2, color: T.textMuted, fontFamily: T.font },
  rankInfo:          { flex: 1 },
  rankCardTitle:     { color: T.textSec, fontSize: 12, fontWeight: '600', marginBottom: 4, fontFamily: T.font },
  tierText:          { fontSize: 18, fontWeight: '900', letterSpacing: 1, fontFamily: T.font },
  lpText:            { fontSize: 13, fontWeight: '700', marginTop: 2, fontFamily: T.font },
  wlRow:             { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  wins:              { color: T.win, fontWeight: '700', fontSize: 13, fontFamily: T.font },
  wlSep:             { color: T.textMuted, fontSize: 13 },
  losses:            { color: T.loss, fontWeight: '700', fontSize: 13, fontFamily: T.font },
  unrankedText:      { color: T.textMuted, fontSize: 15, fontWeight: '600', marginTop: 4, fontFamily: T.font },
  rankRight:         { alignItems: 'center', gap: 8 },
  ringOuter:         { width: 58, height: 58, borderRadius: 29, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  ringText:          { fontSize: 13, fontWeight: '800', fontFamily: T.font },
  ringLabel:         { color: T.textMuted, fontSize: 9, fontWeight: '700', fontFamily: T.font },
  hotStreakBadge:    { backgroundColor: '#2a1500', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#ff6b0033' },
  hotStreakText:     { color: '#ff8c00', fontSize: 10, fontWeight: '700', fontFamily: T.font },

  // Match row — rgb(44,44,44)
  matchRow:          { backgroundColor: T.card, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: T.cardBorder, borderLeftWidth: 4 },
  matchLeft:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matchChampIcon:    { width: 44, height: 44, borderRadius: 22 },
  spellsCol:         { gap: 2 },
  spellIcon:         { width: 20, height: 20, borderRadius: 4 },
  spellIconEmpty:    { width: 20, height: 20, borderRadius: 4, backgroundColor: '#333' },
  matchInfo:         { flex: 1 },
  matchChampName:    { color: T.textPri, fontWeight: '700', fontSize: 13, fontFamily: T.font },
  matchMeta:         { color: T.textMuted, fontSize: 11, marginBottom: 2, fontFamily: T.font },
  matchKda:          { flexDirection: 'row', alignItems: 'center' },
  matchK:            { color: T.textPri, fontWeight: '700', fontSize: 13, fontFamily: T.font },
  matchSlash:        { color: T.textMuted, fontSize: 13 },
  matchD:            { color: T.loss, fontWeight: '700', fontSize: 13, fontFamily: T.font },
  matchA:            { color: T.textPri, fontWeight: '700', fontSize: 13, fontFamily: T.font },
  matchKdaRatio:     { color: T.textSec, fontSize: 11, fontFamily: T.font },
  matchStats:        { color: T.textMuted, fontSize: 11, marginTop: 2, fontFamily: T.font },
  matchRight:        { alignItems: 'flex-end', gap: 6 },
  winBadge:          { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  winBadgeText:      { fontSize: 11, fontWeight: '800', fontFamily: T.font },
  itemsGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: 72 },
  itemIcon:          { width: 22, height: 22, borderRadius: 4 },
  itemIconEmpty:     { width: 22, height: 22, borderRadius: 4, backgroundColor: '#333' },

  // Champion row — rgb(44,44,44)
  champRow:          { backgroundColor: T.card, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: T.cardBorder },
  champIcon:         { width: 40, height: 40, borderRadius: 20 },
  champIconEmpty:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' },
  champLeft:         { width: 80 },
  champName:         { color: T.textPri, fontWeight: '700', fontSize: 12, fontFamily: T.font },
  champGames:        { color: T.textMuted, fontSize: 11, marginTop: 2, fontFamily: T.font },
  champMid:          { flex: 1 },
  champKda:          { color: T.textPri, fontSize: 12, fontWeight: '600', fontFamily: T.font },
  champKdaLabel:     { color: T.textMuted, fontSize: 11, marginTop: 2, fontFamily: T.font },
  champRight:        { alignItems: 'flex-end' },
  champWr:           { fontSize: 17, fontWeight: '900', fontFamily: T.font },
  champWrLabel:      { color: T.textMuted, fontSize: 11, marginTop: 2, fontFamily: T.font },

  // Modal
  modalBackdrop:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet:        { backgroundColor: T.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:        { color: T.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 16, textAlign: 'center', fontFamily: T.font },
  regionGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  regionItem:        { width: 72, alignItems: 'center', padding: 10, backgroundColor: T.bg, borderRadius: 10, borderWidth: 1, borderColor: T.cardBorder },
  regionItemActive:  { borderColor: T.accent, backgroundColor: T.accentBg },
  regionFlag:        { fontSize: 22, marginBottom: 4 },
  regionLabel:       { color: T.textSec, fontSize: 11, fontWeight: '700', fontFamily: T.font },
  regionLabelActive: { color: T.accent },

  emptyState:        { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon:         { fontSize: 48 },
  emptyText:         { color: T.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, fontFamily: T.font },
  emptyBlock:        { alignItems: 'center', paddingVertical: 32 },
  emptyBlockText:    { color: T.textMuted, fontSize: 13, fontFamily: T.font },
});