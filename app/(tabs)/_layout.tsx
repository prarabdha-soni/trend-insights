import { Tabs } from 'expo-router';
import { Home, User, Sparkles, Leaf, ShoppingBag, BookOpen } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { getCycleDay, getCurrentHormonalPhase, themes } from '@/services/ThemeService';

export default function TabLayout() {
  const { profile } = useUser();
  const phaseKey: 'Menstrual'|'Follicular'|'Ovulation'|'Luteal' = profile.lastPeriodDate ? getCurrentHormonalPhase(getCycleDay(profile.lastPeriodDate)) : 'Follicular';
  const theme = themes[phaseKey];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accentColor,
        tabBarInactiveTintColor: '#B8A8BA',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1.5,
          borderTopColor: theme.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="treatments"
        options={{
          title: 'Treatments',
          tabBarIcon: ({ size, color }) => (
            <Sparkles size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ size, color }) => (
            <Leaf size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Products',
          tabBarIcon: ({ size, color }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pcos"
        options={{
          title: 'Education',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="yoga" options={{ href: null }} />
      <Tabs.Screen name="dance" options={{ href: null }} />
      <Tabs.Screen name="workout" options={{ href: null }} />
      <Tabs.Screen name="diet" options={{ href: null }} />
      <Tabs.Screen name="beauty" options={{ href: null }} />
      <Tabs.Screen name="mind" options={{ href: null }} />
      <Tabs.Screen name="sleep" options={{ href: null }} />
      <Tabs.Screen name="doctors" options={{ href: null }} />
    </Tabs>
  );
}
