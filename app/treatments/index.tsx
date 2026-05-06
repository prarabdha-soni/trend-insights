import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { getCycleDay, getCurrentHormonalPhase, themes } from '@/services/ThemeService';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, Stethoscope } from 'lucide-react-native';

type Treatment = { key: string; title: string; blurb: string; };

const TREATMENTS: Treatment[] = [
  { key: 'pcos', title: 'PCOS', blurb: 'Cycle‑first plan: insulin sensitivity, stress care, sleep, and ovulatory support.' },
  { key: 'pcod', title: 'PCOD', blurb: 'Lifestyle routine for regularity: nutrition, movement, supplements, and rest.' },
  { key: 'perimenopause', title: 'Perimenopause', blurb: 'Hot flashes and mood: evidence‑based routines, sleep, and symptom tracking.' },
  { key: 'menopause', title: 'Menopause', blurb: 'Bone, heart, and skin health; holistic care and HRT consults as appropriate.' },
];

type IndianCompany = { name: string; focus: string; website: string; };

const INDIAN_COMPANIES: IndianCompany[] = [
  { name: 'Practo', focus: 'Doctor consultations & health records', website: 'https://www.practo.com' },
  { name: 'mfine', focus: 'Online doctor consultations', website: 'https://www.mfine.co' },
  { name: 'Tata 1mg', focus: 'Medicines, lab tests & doctor consultations', website: 'https://www.1mg.com' },
  { name: 'PharmEasy', focus: 'Medicines, diagnostics & doctor consultations', website: 'https://pharmeasy.in' },
  { name: 'Apollo 24/7', focus: 'Telemedicine & health services', website: 'https://www.apollo247.com' },
  { name: 'Lybrate', focus: 'Doctor consultations & health tips', website: 'https://www.lybrate.com' },
  { name: 'Portea Medical', focus: 'Home healthcare services', website: 'https://www.portea.com' },
  { name: 'HealthifyMe', focus: 'Nutrition & wellness coaching', website: 'https://www.healthifyme.com' },
];

export default function TreatmentsScreen() {
  const { profile } = useUser();
  const router = useRouter();
  const phaseKey: 'Menstrual'|'Follicular'|'Ovulation'|'Luteal' = useMemo(() => {
    if (!profile.lastPeriodDate) return 'Follicular';
    return getCurrentHormonalPhase(getCycleDay(profile.lastPeriodDate));
  }, [profile.lastPeriodDate]);
  const theme = themes[phaseKey];

  // Randomly select 3-4 companies to display
  const displayedCompanies = useMemo(() => {
    const shuffled = [...INDIAN_COMPANIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 3); // 3-4 companies
  }, []);

  const callHelpline = () => Linking.openURL('tel:+1800123456');
  const connectToDoctor = () => router.push('/(tabs)/doctors' as any);
  const openCompanyWebsite = (url: string) => Linking.openURL(url);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { try { router.back(); } catch { router.replace('/(tabs)'); } }}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroTitle}>Personalized Treatments</Text>
        <Text style={styles.heroSub}>Cycle‑aware care for PCOS, PCOD, Perimenopause, Menopause</Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity onPress={connectToDoctor} style={[styles.connectDoctorBtn, { backgroundColor: '#FFFFFF' }]}>
            <Stethoscope color="#111827" size={18} />
            <Text style={[styles.connectDoctorText, { color: '#111827' }]}>Connect to a Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={callHelpline} style={[styles.helplineBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={[styles.helplineText, { color: '#FFFFFF' }]}>Call 24/7 Helpline</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Trusted Indian Partners Section */}
      <View style={styles.companiesSection}>
        <Text style={[styles.companiesTitle, { color: theme.accentColor }]}>Trusted Indian Partners</Text>
        <Text style={styles.companiesSubtitle}>Connect with leading healthcare platforms</Text>
        <View style={styles.companiesList}>
          {displayedCompanies.map((company, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.companyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => openCompanyWebsite(company.website)}
            >
              <View style={styles.companyCardContent}>
                <Text style={styles.companyName}>{company.name}</Text>
                <Text style={styles.companyFocus}>{company.focus}</Text>
              </View>
              <ExternalLink color={theme.accentColor} size={18} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.grid}> 
        {TREATMENTS.map(t => (
          <View key={t.key} style={[styles.card, { borderColor: theme.border }]}> 
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.blurb}>{t.blurb}</Text>
            <View style={styles.row}> 
              <TouchableOpacity onPress={() => router.push('/(tabs)/doctors' as any)} style={[styles.btn, { backgroundColor: theme.accentColor }]}>
                <Text style={styles.btnText}>Find Doctors</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/doctors' as any)} style={[styles.btn, { backgroundColor: '#111827' }]}>
                <Text style={styles.btnText}>Telemedicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingTop: 16 },
  hero: { borderRadius: 20, marginHorizontal: 16, padding: 20 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  heroButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  connectDoctorBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 18,
    flex: 1,
  },
  connectDoctorText: { fontWeight: '800', fontSize: 15 },
  helplineBtn: { 
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 14,
    alignSelf: 'center',
  },
  helplineText: { fontWeight: '800', fontSize: 13 },
  companiesSection: { marginTop: 24, marginHorizontal: 16 },
  companiesTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  companiesSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  companiesList: { gap: 12 },
  companyCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1,
  },
  companyCardContent: { flex: 1 },
  companyName: { color: '#1F2937', fontWeight: '800', fontSize: 16, marginBottom: 4 },
  companyFocus: { color: '#6B7280', fontSize: 13 },
  grid: { paddingHorizontal: 16, marginTop: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 12 },
  title: { color: '#1F2937', fontWeight: '800', fontSize: 16, marginBottom: 6 },
  blurb: { color: '#6B7280', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  btnText: { color: '#FFFFFF', fontWeight: '800' },
});


