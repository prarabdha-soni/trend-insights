import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Platform, Image, ActivityIndicator } from 'react-native';
// @ts-ignore: Only used on native
import { WebView } from 'react-native-webview';
import { useUser } from '@/contexts/UserContext';
import { Sparkles, Crown, Play, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { getCycleDay, getCurrentHormonalPhase, themes } from '@/services/ThemeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// theming and phase helpers centralized in ThemeService

const YT_API_KEY = 'AIzaSyBvQcLcPhoGKqhh6bRKnGHQ4By7O6ZaMjw';

export default function HomeScreen() {
  const { profile } = useUser();
  const router = useRouter();
  const [showGlow, setShowGlow] = useState(false);
  const [momentActive, setMomentActive] = useState(false);
  const [momentDone, setMomentDone] = useState(false);
  const breath = useRef(new Animated.Value(0)).current;
  const [weeklyCount, setWeeklyCount] = useState(0);
  
  // Mood Tracker
  const [todayMood, setTodayMood] = useState<'😊' | '😐' | '😔' | null>(null);
  
  // Video Player
  const [playingVideo, setPlayingVideo] = useState(false);
  const videoId = 'WOi2Bwvp6hw'; // YouTube video ID
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('Cycle Syncing for Hormonal Balance');
  const [videoLoading, setVideoLoading] = useState(false);

  // Fetch video thumbnail and title
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const resp = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_API_KEY}`
        );
        const data = await resp.json();
        if (data.items && data.items.length > 0) {
          const snippet = data.items[0].snippet;
          setVideoTitle(snippet.title || 'Cycle Syncing for Hormonal Balance');
          setVideoThumbnail(snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || null);
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    };
    fetchVideoDetails();
  }, [videoId]);

  const setMood = async (mood: '😊' | '😐' | '😔') => {
    setTodayMood(mood);
    const todayKey = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(`@mood:${todayKey}`, mood);
  };

  const phaseKey: 'Menstrual'|'Follicular'|'Ovulation'|'Luteal' = useMemo(() => {
    if (!profile.lastPeriodDate) return 'Follicular';
    const cycleDay = getCycleDay(profile.lastPeriodDate);
    return getCurrentHormonalPhase(cycleDay);
  }, [profile.lastPeriodDate]);

  const theme = themes[phaseKey];

  // Phase number mapping for UI
  const phaseNumber = {
    Menstrual: 'Phase 1',
    Follicular: 'Phase 2',
    Ovulation: 'Phase 3',
    Luteal: 'Phase 4',
  };

  function getNextOvulationDate(last: Date | null): Date | null {
    if (!last) return null;
    
    try {
      // Ensure last is a valid Date object
      const lastDate = last instanceof Date ? last : new Date(last);
      if (isNaN(lastDate.getTime())) {
        console.warn('Invalid lastPeriodDate:', last);
        return null;
      }
      
      const msDay = 24 * 60 * 60 * 1000;
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Calculate next ovulation (typically day 14 from last period start)
      let ov = new Date(lastDate);
      ov.setDate(ov.getDate() + 14);
      ov.setHours(0, 0, 0, 0);
      
      // If ovulation has passed or is today, find the next one (add 28 days)
      while (ov.getTime() <= now.getTime()) {
        ov = new Date(ov.getTime() + 28 * msDay);
      }
      
      return ov;
    } catch (error) {
      console.error('Error calculating ovulation date:', error);
      return null;
    }
  }

  const peakFertile = useMemo(() => getNextOvulationDate(profile.lastPeriodDate ?? null), [profile.lastPeriodDate]);
  const peakLabel = peakFertile ? peakFertile.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  // Calculate best days for activities based on last period date
  const bestDays = useMemo(() => {
    if (!profile.lastPeriodDate) return null;
    
    try {
      const lastDate = profile.lastPeriodDate instanceof Date ? profile.lastPeriodDate : new Date(profile.lastPeriodDate);
      if (isNaN(lastDate.getTime())) return null;
      
      const msDay = 24 * 60 * 60 * 1000;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      
      // Calculate days since last period
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / msDay);
      
      // Find current cycle start (adjust to the beginning of the current cycle)
      const currentCycleDay = daysSince % 28;
      const currentCycleStart = new Date(lastDate.getTime() + (daysSince - currentCycleDay) * msDay);
      
      // Calculate dates for current and next cycle
      const workoutDays: Date[] = []; // Follicular (8-14) + Ovulation (15-21)
      const walkDays: Date[] = []; // Luteal (22-28)
      const travelDays: Date[] = []; // Follicular (8-14)
      const chillDays: Date[] = []; // Menstrual (1-7) + Luteal (22-28)
      const creativityDays: Date[] = []; // Ovulation (15-21)
      const selfCareDays: Date[] = []; // Early Luteal (22-24)
      
      // Helper function to add dates for a cycle
      const addCycleDates = (cycleStart: Date) => {
        for (let cycleDay = 0; cycleDay < 28; cycleDay++) {
          const day = cycleDay + 1; // Convert to 1-28
          const date = new Date(cycleStart);
          date.setDate(date.getDate() + cycleDay);
          
          // Only include today or future dates
          if (date.getTime() >= now.getTime()) {
            if (day >= 8 && day <= 14) {
              // Follicular phase
              workoutDays.push(new Date(date));
              travelDays.push(new Date(date));
            }
            if (day >= 15 && day <= 21) {
              // Ovulation phase
              workoutDays.push(new Date(date));
              creativityDays.push(new Date(date));
            }
            if (day >= 22 && day <= 28) {
              // Luteal phase
              walkDays.push(new Date(date));
              chillDays.push(new Date(date));
              if (day >= 22 && day <= 24) {
                // Early Luteal
                selfCareDays.push(new Date(date));
              }
            }
            if (day >= 1 && day <= 7) {
              // Menstrual phase
              chillDays.push(new Date(date));
            }
          }
        }
      };
      
      // Add dates from current cycle
      addCycleDates(currentCycleStart);
      
      // Add dates from next cycle if we need more
      if (workoutDays.length < 7 || walkDays.length < 3 || travelDays.length < 3 || creativityDays.length < 3) {
        const nextCycleStart = new Date(currentCycleStart.getTime() + 28 * msDay);
        addCycleDates(nextCycleStart);
      }
      
      const formatDateRange = (dates: Date[]): string => {
        if (dates.length === 0) return 'N/A';
        const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        if (sorted.length <= 3) {
          return sorted.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ');
        }
        
        return `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      };
      
      return {
        workout: formatDateRange(workoutDays.slice(0, 14)),
        walk: formatDateRange(walkDays.slice(0, 7)),
        travel: formatDateRange(travelDays.slice(0, 7)),
        chill: formatDateRange(chillDays.slice(0, 14)),
        creativity: formatDateRange(creativityDays.slice(0, 7)),
        selfCare: formatDateRange(selfCareDays.slice(0, 3)),
      };
    } catch (error) {
      console.error('Error calculating best days:', error);
      return null;
    }
  }, [profile.lastPeriodDate]);


  // Gloww Moment once per day (10s breath)
  useEffect(() => {
    (async () => {
      const todayKey = new Date().toISOString().slice(0,10);
      const stored = await AsyncStorage.getItem(`@gloww_moment:${todayKey}`);
      setMomentDone(!!stored);
    })();
  }, []);

  useEffect(() => {
    if (!momentActive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2500, useNativeDriver: true })
      ])
    );
    loop.start();
    const t = setTimeout(async () => {
      loop.stop();
      setMomentActive(false);
      const todayKey = new Date().toISOString().slice(0,10);
      await AsyncStorage.setItem(`@gloww_moment:${todayKey}`, '1');
      setMomentDone(true);
    }, 10000);
    return () => { loop.stop(); clearTimeout(t); };
  }, [momentActive, breath]);

  // Compute 7‑day streak from stored completions (sleep/workout/gloww)
  useEffect(() => {
    (async () => {
      const today = new Date();
      const dates: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d);
      }
      // Generate keys per date
      const keys: string[] = [];
      dates.forEach(d => {
        const y = d.getFullYear(); const m = d.getMonth() + 1; const day = d.getDate();
        keys.push(`@gloww_moment:${d.toISOString().slice(0,10)}`);
        keys.push(`@sleep_done:${y}-${m}-${day}:Menstrual`);
        keys.push(`@sleep_done:${y}-${m}-${day}:Follicular`);
        keys.push(`@sleep_done:${y}-${m}-${day}:Ovulation`);
        keys.push(`@sleep_done:${y}-${m}-${day}:Luteal`);
        keys.push(`@workout_done:${y}-${m}-${day}`);
      });
      let count = 0;
      try {
        const results = await AsyncStorage.multiGet(keys);
        for (let i = 0; i < dates.length; i++) {
          const base = i * 6; // 6 keys per day
          const slice = results.slice(base, base + 6).map(r => r[1]);
          const any = slice.some(v => !!v);
          if (any) count++;
        }
      } catch {}
      setWeeklyCount(count);
    })();
  }, [momentDone]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.surface }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.brand}>GLOWW</Text>
          {profile.lastPeriodDate && peakLabel ? (
            <View style={styles.fertilePill}>
              <Text style={styles.fertilePillText}>Peak · {peakLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.phaseBlock}>
          <Text style={styles.phaseLabel}>{phaseNumber[phaseKey]} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseName}>{phaseKey}</Text>
            <Text style={styles.phaseIconText}>{theme.phaseIcon}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.title}>Your hormones change every week.</Text>
          <Text style={styles.subtitle}>So should your <Text style={styles.exerciseText}>routine.</Text></Text>
          <Text style={styles.phaseAffirm}>{theme.phaseText}</Text>
        </View>
      </LinearGradient>

      {/* Welcome Section */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.accentColor }]}>
        <View style={styles.welcomeAccent} />
        <Text style={styles.welcomeKicker}>WELCOME BACK</Text>
        <Text style={styles.welcomeTitle}>Find Your{'\n'}Best Days.</Text>
        <Text style={styles.welcomeText}>Work smarter. Glow longer.</Text>
      </View>

      {/* Video Section */}
      <View style={[styles.videoCard, { borderColor: theme.border }]}>
        <View style={styles.videoHeader}>
          <Sparkles color={theme.accentColor} size={18} />
          <Text style={[styles.videoSectionTitle, { color: theme.accentColor }]}>Featured Video</Text>
        </View>
        {playingVideo ? (
          // Inline video player
          <View style={styles.inlineVideoContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.inlineVideoWrapper}>
                {/* @ts-ignore */}
                <iframe
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </View>
            ) : (
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1` }}
                style={styles.inlineVideoWebView}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onShouldStartLoadWithRequest={(request) => {
                  const allowed = request.url.includes('youtube.com/embed') || 
                                 request.url.includes('youtube.com/iframe_api') ||
                                 request.url.includes('googleapis.com');
                  return allowed;
                }}
              />
            )}
            <TouchableOpacity 
              style={[styles.closeInlineBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              onPress={() => setPlayingVideo(false)}
            >
              <X color="#FFFFFF" size={18} />
            </TouchableOpacity>
          </View>
        ) : (
          // Thumbnail view
          <>
            <TouchableOpacity 
              style={styles.videoThumbnailContainer}
              onPress={() => setPlayingVideo(true)}
            >
              {videoThumbnail ? (
                <Image source={{ uri: videoThumbnail }} style={styles.videoThumbnail} />
              ) : (
                <View style={styles.videoPlaceholder}>
                  {videoLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="large" />
                  ) : (
                    <Text style={styles.placeholderText}>Featured Video</Text>
                  )}
                </View>
              )}
              <View style={[styles.videoPlayButton, { backgroundColor: theme.accentColor }]}>
                <Play color="#FFFFFF" size={32} fill="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.videoCardTitle}>{videoTitle}</Text>
            <Text style={styles.videoDescription}>
              Discover how aligning your lifestyle with your hormonal cycle can transform your energy, mood, and overall well-being.
            </Text>
          </>
        )}
      </View>

      {/* Best Days Section */}
      {bestDays && (
        <View style={styles.bestDaysContainer}>
          <View style={styles.bestDaysHeader}>
            <Sparkles color={theme.accentColor} size={20} />
            <Text style={[styles.bestDaysTitle, { color: theme.accentColor }]}>Best Days for You</Text>
          </View>
          <View style={styles.bestDaysList}>
            <View style={[styles.bestDayCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.bestDayCardHeader}>
                <View style={styles.bestDayEmojiContainer}>
                  <Text style={styles.bestDayEmoji}>🏋️‍♀️</Text>
                </View>
                <View style={styles.bestDayCardContent}>
                  <Text style={styles.bestDayLabel}>Best Days to Work Out</Text>
                  <Text style={styles.bestDaySubtext}>Follicular + Ovulation</Text>
                </View>
              </View>
              <View style={[styles.bestDayDateBadge, { borderColor: theme.accentColor + '30' }]}>
                <Text style={[styles.bestDayDates, { color: theme.accentColor }]}>{bestDays.workout}</Text>
              </View>
            </View>
            
            <View style={[styles.bestDayCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.bestDayCardHeader}>
                <View style={styles.bestDayEmojiContainer}>
                  <Text style={styles.bestDayEmoji}>🚶‍♀️</Text>
                </View>
                <View style={styles.bestDayCardContent}>
                  <Text style={styles.bestDayLabel}>Best Days to Walk</Text>
                  <Text style={styles.bestDaySubtext}>Luteal (moderate movement, mood boost)</Text>
                </View>
              </View>
              <View style={[styles.bestDayDateBadge, { borderColor: theme.accentColor + '30' }]}>
                <Text style={[styles.bestDayDates, { color: theme.accentColor }]}>{bestDays.walk}</Text>
              </View>
            </View>
            
            <View style={[styles.bestDayCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.bestDayCardHeader}>
                <View style={styles.bestDayEmojiContainer}>
                  <Text style={styles.bestDayEmoji}>🧳</Text>
                </View>
                <View style={styles.bestDayCardContent}>
                  <Text style={styles.bestDayLabel}>Best Days to Travel</Text>
                  <Text style={styles.bestDaySubtext}>Follicular (energy, stable hormones)</Text>
                </View>
              </View>
              <View style={[styles.bestDayDateBadge, { borderColor: theme.accentColor + '30' }]}>
                <Text style={[styles.bestDayDates, { color: theme.accentColor }]}>{bestDays.travel}</Text>
              </View>
            </View>
            
            <View style={[styles.bestDayCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.bestDayCardHeader}>
                <View style={styles.bestDayEmojiContainer}>
                  <Text style={styles.bestDayEmoji}>🍿</Text>
                </View>
                <View style={styles.bestDayCardContent}>
                  <Text style={styles.bestDayLabel}>Best Days to Netflix & Chill</Text>
                  <Text style={styles.bestDaySubtext}>Menstrual or Luteal phase</Text>
                </View>
              </View>
              <View style={[styles.bestDayDateBadge, { borderColor: theme.accentColor + '30' }]}>
                <Text style={[styles.bestDayDates, { color: theme.accentColor }]}>{bestDays.chill}</Text>
              </View>
            </View>
            
            <View style={[styles.bestDayCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.bestDayCardHeader}>
                <View style={styles.bestDayEmojiContainer}>
                  <Text style={styles.bestDayEmoji}>🎨</Text>
                </View>
                <View style={styles.bestDayCardContent}>
                  <Text style={styles.bestDayLabel}>Best Days for Creativity</Text>
                  <Text style={styles.bestDaySubtext}>Ovulatory phase</Text>
                </View>
              </View>
              <View style={[styles.bestDayDateBadge, { borderColor: theme.accentColor + '30' }]}>
                <Text style={[styles.bestDayDates, { color: theme.accentColor }]}>{bestDays.creativity}</Text>
              </View>
            </View>
            
            <View style={[styles.bestDayCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.bestDayCardHeader}>
                <View style={styles.bestDayEmojiContainer}>
                  <Text style={styles.bestDayEmoji}>🛍️</Text>
                </View>
                <View style={styles.bestDayCardContent}>
                  <Text style={styles.bestDayLabel}>Best Days for Self-Care or Shopping</Text>
                  <Text style={styles.bestDaySubtext}>Early luteal (dopamine boost!)</Text>
                </View>
              </View>
              <View style={[styles.bestDayDateBadge, { borderColor: theme.accentColor + '30' }]}>
                <Text style={[styles.bestDayDates, { color: theme.accentColor }]}>{bestDays.selfCare}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick Access Cards */}
      <View style={styles.quickAccessContainer}>
        <View style={styles.quickAccessHeader}>
          <Sparkles color={theme.accentColor} size={20} />
          <Text style={[styles.quickAccessTitle, { color: theme.accentColor }]}>Quick Access</Text>
        </View>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={[styles.quickAccessCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => router.push('/tracking')}
          >
            <Text style={styles.quickAccessEmoji}>📊</Text>
            <Text style={styles.quickAccessLabel}>Track Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAccessCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => router.push('/insights')}
          >
            <Text style={styles.quickAccessEmoji}>💡</Text>
            <Text style={styles.quickAccessLabel}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAccessCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => router.push('/community')}
          >
            <Text style={styles.quickAccessEmoji}>👥</Text>
            <Text style={styles.quickAccessLabel}>Community</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAccessCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => router.push('/premium')}
          >
            <Text style={styles.quickAccessEmoji}>👑</Text>
            <Text style={styles.quickAccessLabel}>Premium</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Upsell Card */}
      <View style={[styles.premiumCard, { borderColor: theme.border }]}>
        <LinearGradient colors={[theme.accentColor, theme.gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumGradient}>
          <Crown color="#FFFFFF" size={20} />
          <Text style={styles.premiumTitle}>Unlock Premium</Text>
          <Text style={styles.premiumSubtitle}>Advanced insights, unlimited tracking & AI predictions</Text>
          <TouchableOpacity 
            style={styles.premiumBtn}
            onPress={() => router.push('/premium')}
          >
            <Text style={styles.premiumBtnText}>Explore Premium</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F7' },
  hero: { paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  brand: { fontSize: 18, color: 'rgba(255,255,255,0.95)', fontWeight: '700', letterSpacing: 3, fontFamily: 'System' },
  title: { fontSize: 30, fontWeight: '800', color: '#FFF', marginTop: 6, textAlign: 'left', lineHeight: 36, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 22 },
  exerciseText: { fontSize: 16, fontWeight: '800', textDecorationLine: 'underline' },
  fertilePill: { backgroundColor: 'rgba(0,0,0,0.25)', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  fertilePillText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, letterSpacing: 0.4 },
  phaseBlock: { },
  phaseLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  phaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  phaseName: { fontSize: 44, fontWeight: '800', color: '#FFF', letterSpacing: -1.2 },
  phaseIconText: { fontSize: 36 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 18 },
  phaseAffirm: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 12, lineHeight: 20, fontStyle: 'italic' },

  welcomeCard: { marginTop: 20, marginHorizontal: 20, borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' },
  welcomeAccent: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.15)' },
  welcomeKicker: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  welcomeTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 10, lineHeight: 36, letterSpacing: -0.8 },
  welcomeText: { fontSize: 15, color: 'rgba(255,255,255,0.92)', lineHeight: 22, fontWeight: '500' },

  quickRow: { marginTop: 12 },
  quickChip: { borderWidth: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF' },
  quickChipText: { color: '#111827', fontWeight: '700' },

  section: { marginTop: 18, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#4B5563', marginBottom: 8, letterSpacing: 0.3 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  streakMeta: { color: '#6B7280', marginTop: 8, fontSize: 12, fontWeight: '500' },

  card: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { color: '#6B7280', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', lineHeight: 28 },
  cardDesc: { fontSize: 14, color: '#6B7280', marginTop: 8, lineHeight: 20 },
  cta: { alignSelf: 'flex-end', marginTop: 16, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  ctaText: { color: '#FFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },

  cardAlt: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 14, padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeaderAlt: { color: '#6B7280', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitleAlt: { fontSize: 20, fontWeight: '700', color: '#111827', lineHeight: 28 },
  cardDescAlt: { fontSize: 14, color: '#6B7280', marginTop: 8, lineHeight: 20 },
  ctaAlt: { alignSelf: 'flex-end', marginTop: 16, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  ctaAltText: { color: '#FFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },

  illusWrap: { position: 'absolute', right: 12, top: 12 },
  illusCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', opacity: 0.9 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  modalLine: { fontSize: 14, color: '#4B5563', marginBottom: 6 },
  close: { marginTop: 12, backgroundColor: '#8B5A8F', borderRadius: 10, paddingVertical: 10 },
  closeText: { color: '#FFF', fontWeight: '700', textAlign: 'center' },


  momentCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 20, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  momentHeader: { fontSize: 13, fontWeight: '700', color: '#4B5563', marginBottom: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  momentText: { color: '#374151', textAlign: 'center', marginBottom: 16, fontSize: 15, lineHeight: 22, paddingHorizontal: 8 },
  momentPulse: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(138,90,143,0.12)', marginVertical: 8 },
  momentBtn: { marginTop: 4, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  momentBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },
  moodCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderWidth: 1 },
  moodTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  moodRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  moodBtn: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  moodEmoji: { fontSize: 28 },
  moodNote: { textAlign: 'center', marginTop: 12, fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  whyCard: { marginTop: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1 },
  whyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  whyCardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  whyPhaseTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16 },
  whyBenefits: { gap: 16 },
  whyBenefitItem: { marginBottom: 8 },
  whyBenefitLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  whyBenefitText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  bestDaysContainer: { marginTop: 24, marginHorizontal: 20 },
  bestDaysHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  bestDaysTitle: { fontSize: 20, fontWeight: '700', flex: 1, letterSpacing: 0.3 },
  bestDaysList: { gap: 12 },
  bestDayCard: { 
    borderRadius: 16, 
    padding: 18, 
    borderWidth: 1, 
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bestDayCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  bestDayEmojiContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#F9FAFB',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bestDayEmoji: { fontSize: 28 },
  bestDayCardContent: { flex: 1, paddingTop: 2 },
  bestDayLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 22 },
  bestDaySubtext: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  bestDayDateBadge: { 
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
  },
  bestDayDates: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  premiumCard: { marginTop: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  premiumGradient: { padding: 20, alignItems: 'center', gap: 8, position: 'relative' },
  premiumTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
  premiumSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 4 },
  comingSoonText: { position: 'absolute', top: 12, left: 16, fontSize: 12, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', fontWeight: '600' },
  premiumBtn: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  premiumBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  videoCard: { marginTop: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1 },
  videoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  videoSectionTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  videoThumbnailContainer: { height: 200, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 16 },
  videoThumbnail: { width: '100%', height: '100%', backgroundColor: '#000' },
  videoPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#FFFFFF', fontSize: 14 },
  videoPlayButton: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -32 }, { translateY: -32 }], width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  videoCardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  videoDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  inlineVideoContainer: { height: 250, position: 'relative', backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  inlineVideoWrapper: { width: '100%', height: '100%' },
  inlineVideoWebView: { width: '100%', height: '100%', backgroundColor: '#000' },
  closeInlineBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickAccessContainer: { marginTop: 24, marginHorizontal: 20 },
  quickAccessHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  quickAccessTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAccessCard: { width: '47%', padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minHeight: 100 },
  quickAccessEmoji: { fontSize: 32, marginBottom: 8 },
  quickAccessLabel: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center' },
});
