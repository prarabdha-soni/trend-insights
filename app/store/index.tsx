import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { getCycleDay, getCurrentHormonalPhase, themes } from '@/services/ThemeService';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react-native';
const shethrivesCup = require('@/assets/images/shethrives-cup.png');

const PRODUCT = {
  name: 'SheThrives Menstrual Cup',
  price: '₹999',
  rating: 4.9,
  reviews: 2150,
  description:
    'Soft, medical-grade silicone cup designed for up to 12 hours of leak-free comfort. Reusable, eco-friendly and travel-ready.',
  features: [
    'Medical-grade silicone',
    '12-hour leak-free wear',
    'Reusable up to 10 years',
    'Carry pouch included',
  ],
};

export default function StoreScreen() {
  const { profile } = useUser();
  const router = useRouter();
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');

  const phaseKey: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' = useMemo(() => {
    if (!profile.lastPeriodDate) return 'Follicular';
    return getCurrentHormonalPhase(getCycleDay(profile.lastPeriodDate));
  }, [profile.lastPeriodDate]);

  const theme = themes[phaseKey];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.surface }]} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { try { router.back(); } catch { router.replace('/(tabs)'); } }}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Shop</Text>
        <Text style={styles.pageSubtitle}>Loved by 2,000+ women</Text>
      </View>

      {/* Hero image */}
      <View style={styles.imageHero}>
        <Image source={shethrivesCup} style={styles.heroImage} resizeMode="contain" />
      </View>

      {/* Product info */}
      <View style={styles.infoCard}>
        <Text style={styles.productName}>{PRODUCT.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>⭐ {PRODUCT.rating}</Text>
          <Text style={styles.reviews}>({PRODUCT.reviews} reviews)</Text>
        </View>
        <Text style={[styles.price, { color: theme.accentColor }]}>{PRODUCT.price}</Text>
        <Text style={styles.desc}>{PRODUCT.description}</Text>

        <Text style={styles.sectionLabel}>Choose size</Text>
        <View style={styles.sizeRow}>
          {(['S', 'M', 'L'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.sizeChip,
                { borderColor: theme.border },
                size === s && { backgroundColor: theme.accentColor, borderColor: theme.accentColor },
              ]}
              onPress={() => setSize(s)}
            >
              <Text style={[styles.sizeText, size === s && { color: '#FFFFFF' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>What's included</Text>
        <View style={{ gap: 8, marginBottom: 16 }}>
          {PRODUCT.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Check color={theme.accentColor} size={16} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: theme.accentColor }]}>
          <ShoppingBag color="#FFFFFF" size={18} />
          <Text style={styles.addToCartText}>Add to Cart · {PRODUCT.price}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingTop: 16 },
  header: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A40', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: '#6B7280' },
  imageHero: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroImage: { width: 260, height: 260 },
  infoCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  productName: { fontSize: 22, fontWeight: '700', color: '#1A1A40', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stars: { fontSize: 14, fontWeight: '700', color: '#1A1A40' },
  reviews: { fontSize: 13, color: '#6B7280' },
  price: { fontSize: 26, fontWeight: '700', marginBottom: 12 },
  desc: { fontSize: 14, color: '#4A4A5E', lineHeight: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A40', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  sizeChip: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  sizeText: { fontSize: 16, fontWeight: '700', color: '#1A1A40' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#4A4A5E' },
  addToCartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 16,
  },
  addToCartText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

