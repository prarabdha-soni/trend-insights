export type HormonalPhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';

/**
 * Calculates the current cycle day based on the last period date.
 * Automatically progresses through the 28-day cycle in real-time.
 * 
 * @param lastPeriodDate - The date when the user's last period started
 * @returns Cycle day (0-27), where 0 = Day 1 (Menstrual phase start)
 * 
 * Note: This function uses the current date, so the phase automatically
 * changes each day without requiring user input. Users only need to update
 * their period date once a month when their next period starts.
 */
export function getCycleDay(lastPeriodDate: Date): number {
  const now = new Date();
  const ms = now.getTime() - lastPeriodDate.getTime();
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  // Wrap around 28-day cycle: Day 28 becomes Day 0 (next cycle Day 1)
  return ((d % 28) + 28) % 28; // 0..27
}

/**
 * Determines the current hormonal phase based on cycle day.
 * Phase automatically progresses in real-time:
 * - Days 1-7: Menstrual (Phase 1)
 * - Days 8-14: Follicular (Phase 2)
 * - Days 15-21: Ovulation (Phase 3)
 * - Days 22-28: Luteal (Phase 4)
 * 
 * @param dayZeroIndexed - Cycle day (0-27 from getCycleDay)
 * @returns Current hormonal phase
 */
export function getCurrentHormonalPhase(dayZeroIndexed: number): HormonalPhase {
  const day = dayZeroIndexed + 1; // Convert to 1-28 for easier logic
  if (day >= 1 && day <= 7) return 'Menstrual';    // Phase 1
  if (day >= 8 && day <= 14) return 'Follicular';  // Phase 2
  if (day >= 15 && day <= 21) return 'Ovulation';  // Phase 3
  return 'Luteal';                                  // Phase 4 (Days 22-28)
}

export type PhaseTheme = {
  gradient: [string, string];
  accentColor: string;
  surface: string; // app background surface color
  border: string; // subtle border color for cards
  phaseIcon: string;
  phaseText: string;
  // Enhanced workout fields
  workoutRecommendation: string;
  workoutDetails: string;
  workoutFocus: string;
  workoutTypes: string[];
  workoutWhy: string;
  fitnessSummary: string;
  workoutVideoURL?: string; // Optional video URL
  workoutProgramVideos?: string[]; // Array of phase-specific workout video URLs
  yogaVideoURL?: string; // Yoga video URL for current phase
  danceVideoURL?: string; // Dance video URL for current phase
  workoutTime: string; // e.g., "35 min"
  workoutLevel: string; // e.g., "Advanced"
  // Diet fields
  dietFocusTitle: string; // e.g., "Iron & Restorative Fats"
  macroGoals: string; // e.g., "40% Carbs, 35% Protein, 25% Fat"
  supplementRecommendation: string; // e.g., "Prioritize Magnesium"
  featuredRecipeName: string; // e.g., "Hearty Lentil Soup"
  dailyMealPlan: { meal: string; suggestion: string }[]; // Breakfast, Lunch, Dinner
  // Legacy fields (kept for backward compatibility)
  sleepRecommendation: string;
  sleepDetails: string;
  sleepPattern: string;
  sleepRecommendations: string[];
  sleepAids: string[];
  sleepSummary: string;
  beautyTip: string;
  beautyAction: string;
  suggestions: string[];
  beautyRoutine: string[]; // ordered routine steps for the day
  beautyConcerns: string[]; // common concerns this phase
  beautySummary: string;
  hairSummary: string;
  hairTips: string[];
  nutritionSummary: string;
  nutritionTips: string[];
  weightLossTips: string[];
};

// ============= Flo-inspired unified color palette =============
// Override per-phase colors so the entire app uses one consistent theme,
// regardless of cycle phase. Only colors/gradient are unified—phase-specific
// content (workouts, diet, etc.) remains intact.
// Whoop-style dark palette (inspired by reference health tracker UI)
export const FLO_COLORS = {
  primary: '#22E58A',        // neon green accent
  primaryDark: '#16B870',
  primaryDeep: '#0B0F12',    // near-black background
  surface: '#0B0F12',        // app background
  surfaceAlt: '#15191D',     // card background
  card: '#15191D',
  border: '#22272C',         // subtle card borders
  textPrimary: '#FFFFFF',
  textSecondary: '#C7CDD3',
  textMuted: '#7A8088',
  success: '#22E58A',
  warning: '#F5A623',
  danger: '#FF6B6B',
  info: '#7FE8E1',
};

export const themes: Record<HormonalPhase, PhaseTheme> = {
  Follicular: {
    gradient: ['#A073E1', '#E7A0F8'],
    accentColor: '#FFC107',
    surface: '#FAF3FF',
    border: '#E8D5E8',
    phaseIcon: '🌸',
    phaseText: 'Your energy is rising this week.',
    workoutRecommendation: 'Full-Body Strength & Cardio',
    workoutDetails: 'Heavy lifting to leverage peak strength.',
    workoutFocus: 'Building strength and increasing intensity',
    workoutTypes: ['Cardio', 'Circuit training', 'Strength training', 'HIIT'],
    workoutWhy: 'Estrogen rises, boosting energy, strength, and endurance—great for intensity and muscle gains.',
    fitnessSummary: 'Energy and strength are rising—ideal for cardio, strength training and HIIT. Try new challenges and build muscle/endurance.',
    workoutVideoURL: 'https://www.youtube.com/watch?v=xxa8IdKd8M0',
    yogaVideoURL: 'https://www.youtube.com/watch?v=mfG0p1sv9OI',
    danceVideoURL: 'https://www.youtube.com/watch?v=GQd6yeQ4-sI',
    workoutProgramVideos: [
      'https://www.youtube.com/watch?v=xxa8IdKd8M0',
    ],
    workoutTime: '30 min',
    workoutLevel: 'Intermediate',
    dietFocusTitle: 'Protein & Fiber Boost',
    macroGoals: '45% Carbs, 30% Protein, 25% Fat',
    supplementRecommendation: 'B-Complex vitamins for energy',
    featuredRecipeName: 'Masala Oats with Nuts',
    dailyMealPlan: [
      { meal: 'Breakfast', suggestion: 'Masala Oats with Almonds' },
      { meal: 'Lunch', suggestion: 'Paneer Tikka with Roti & Dal' },
      { meal: 'Dinner', suggestion: 'Chicken Curry with Brown Rice' },
    ],
    sleepRecommendation: 'Meditation for morning freshness',
    sleepDetails: 'Calm your mind to maximize energy gain for the rising phase.',
    sleepPattern: 'Generally improved sleep quality with more deep and REM sleep.',
    sleepRecommendations: ['Regular sleep schedule', 'Morning sunlight exposure', 'Avoid late caffeine/electronics'],
    sleepAids: ['Mindfulness meditation', 'Light daytime aerobic exercise'],
    sleepSummary: 'Sleep quality improves. Reinforce schedule, get morning light, and limit late caffeine and screens to anchor circadian rhythm.',
    beautyTip: 'Hydrate & nourish',
    beautyAction: 'Rich hydration to help skin bloom while oil is lower.',
    suggestions: ['Vitamin C serum', 'Gentle exfoliant 1–2×/week', 'Gel moisturizer'],
    beautyRoutine: ['Gentle cleanse', 'Vitamin C serum', 'Light moisturizer', 'Sunscreen (SPF 30+)'],
    beautyConcerns: ['Dullness after period', 'Mild dryness'],
    beautySummary: 'Skin looks brighter and resilient. Use lightweight hydration and antioxidants. Good time to try exfoliation or pro treatments.',
    hairSummary: 'Estrogen rises, supporting hair growth and strength.',
    hairTips: [
      'Use nourishing treatments and protein‑enriched masks.',
      'Light scalp exfoliation prepares follicles for growth.',
      'Protective hairstyles and trims help maintain healthy ends.'
    ],
    nutritionSummary: 'Protein + fiber to fuel rising energy and support muscle building.',
    nutritionTips: ['Lean proteins (eggs, fish, tofu)', 'High‑fiber veg and whole grains', 'Hydration and electrolytes'],
    weightLossTips: ['Leverage higher energy for HIIT/strength', 'Prioritize protein at each meal', 'Track recovery and sleep'],
  },
  Ovulation: {
    gradient: ['#FF7F50', '#FFDAB9'],
    accentColor: '#4CAF50',
    surface: '#FFF6ED',
    border: '#F2D6C7',
    phaseIcon: '✨',
    phaseText: 'Peak energy & clarity!',
    workoutRecommendation: 'High-Intensity Power Flow',
    workoutDetails: 'Explosive HIIT to maximize energy and endurance.',
    workoutFocus: 'Power and performance',
    workoutTypes: ['High‑intensity intervals', 'Skill‑based workouts', 'Tennis', 'Dance'],
    workoutWhy: 'Peak estrogen and LH provide maximum strength, speed, and coordination—ideal for performance.',
    fitnessSummary: 'Peak performance—focus on HIIT, dance, intense cardio or skill work. Social workouts feel rewarding.',
    workoutVideoURL: 'https://www.youtube.com/watch?v=PBd2CZC-JIE',
    yogaVideoURL: 'https://www.youtube.com/watch?v=mfG0p1sv9OI',
    danceVideoURL: 'https://www.youtube.com/watch?v=9EaLMMz2KsE',
    workoutProgramVideos: [
      'https://www.youtube.com/watch?v=PBd2CZC-JIE',
    ],
    workoutTime: '25 min',
    workoutLevel: 'Advanced',
    dietFocusTitle: 'Zinc & Antioxidants',
    macroGoals: '40% Carbs, 35% Protein, 25% Fat',
    supplementRecommendation: 'Zinc for peak performance',
    featuredRecipeName: 'Ragi Dosa with Sambar',
    dailyMealPlan: [
      { meal: 'Breakfast', suggestion: 'Poha with Nuts & Seeds' },
      { meal: 'Lunch', suggestion: 'Fish Curry with Steamed Rice' },
      { meal: 'Dinner', suggestion: 'Mixed Sprout Salad with Roti' },
    ],
    sleepRecommendation: 'Short naps for clarity',
    sleepDetails: 'Use deep, short rest to maintain peak focus and energy.',
    sleepPattern: 'Possible restlessness or difficulty falling asleep due to hormonal surge.',
    sleepRecommendations: ['Breathing exercises before bed', 'Cool, dark environment', 'Avoid stimulating screens/activities'],
    sleepAids: ['Blackout curtains', 'Relaxing sleep stories'],
    sleepSummary: 'Mild restlessness is common; keep the room cool/dark and use breathwork or mindfulness to unwind.',
    beautyTip: 'Your glow peaks — exfoliate gently',
    beautyAction: 'Remove dead skin to maximize radiance; mind increased oil.',
    suggestions: ['Light AHA toner', 'Hydrating sunscreen', 'Brightening serum'],
    beautyRoutine: ['Cleanse', 'Gentle exfoliation (2–3×/week)', 'Hydrating serum', 'SPF 50'],
    beautyConcerns: ['Shine/oil', 'Makeup pilling'],
    beautySummary: 'Radiant skin, slightly oilier—maintain cleansing, optional clay mask for oil. Minimal makeup shines.',
    hairSummary: 'Hair appears shinier, fuller, and healthier at peak estrogen.',
    hairTips: [
      'Minimize harsh chemical treatments; focus on hydration and shine.',
      'Avoid excessive heat styling to preserve gloss and reduce breakage.',
      'Use lightweight serums or oils to enhance natural shine.'
    ],
    nutritionSummary: 'Zinc + antioxidants support peak performance and skin.',
    nutritionTips: ['Colorful fruits/veg (vitamin C)', 'Seeds/nuts for zinc', 'Steady protein + hydration'],
    weightLossTips: ['High‑intensity blocks possible', 'Mind portion sizes with higher appetite', 'Keep carbs around workouts'],
  },
  Luteal: {
    gradient: ['#8A2BE2', '#DA70D6'],
    accentColor: '#800080',
    surface: '#F5EEFF',
    border: '#E5D4F7',
    phaseIcon: '🧘‍♀️',
    phaseText: 'Focus on self-care & winding down.',
    workoutRecommendation: 'Balancing Flow & Recovery',
    workoutDetails: 'Gentle movement to support mood and energy balance.',
    workoutFocus: 'Calm and recovery',
    workoutTypes: ['Moderate cardio', 'Yoga', 'Pilates', 'Low‑impact strength'],
    workoutWhy: 'Progesterone rises causing lower energy and fatigue—prioritize restorative consistency.',
    fitnessSummary: 'Energy dips—favor moderate, enjoyable movement (yoga, Pilates, light cardio). Focus on recovery and hydration.',
    workoutVideoURL: 'https://www.youtube.com/watch?v=4JaCcp39iVI',
    yogaVideoURL: 'https://www.youtube.com/watch?v=mfG0p1sv9OI',
    danceVideoURL: 'https://www.youtube.com/watch?v=AhKQdriZJMI',
    workoutProgramVideos: [
      'https://www.youtube.com/watch?v=4JaCcp39iVI',
    ],
    workoutTime: '35 min',
    workoutLevel: 'Beginner',
    dietFocusTitle: 'Magnesium & Complex Carbs',
    macroGoals: '50% Carbs, 25% Protein, 25% Fat',
    supplementRecommendation: 'Prioritize Magnesium',
    featuredRecipeName: 'Moong Dal Khichdi',
    dailyMealPlan: [
      { meal: 'Breakfast', suggestion: 'Dalia Upma with Vegetables' },
      { meal: 'Lunch', suggestion: 'Vegetable Biryani with Curd' },
      { meal: 'Dinner', suggestion: 'Jowar Roti with Dal & Sabzi' },
    ],
    sleepRecommendation: 'Magnesium + calming routine',
    sleepDetails: 'Warm, gentle routines to prepare for rest and ease tension.',
    sleepPattern: 'Increased need for sleep and more awakenings; higher body temperature.',
    sleepRecommendations: ['Breathable bedding & lower room temperature', 'Consistent wind‑down ritual', 'Avoid heavy meals or late strenuous workouts'],
    sleepAids: ['CBT‑I techniques', 'Guided sleep meditations'],
    sleepSummary: 'More awakenings and warmth—keep room cooler, maintain wind‑down, avoid heavy meals and late strenuous exercise.',
    beautyTip: 'Keep it clean and calm',
    beautyAction: 'Double‑cleanse and use anti‑inflammatory ingredients for breakouts.',
    suggestions: ['Niacinamide', 'Clay mask', 'Non‑stripping cleanser'],
    beautyRoutine: ['Non‑stripping cleanse', 'Niacinamide serum', 'Calming moisturizer', 'Spot treatment (if needed)'],
    beautyConcerns: ['Congestion', 'Hormonal breakouts', 'Sensitivity'],
    beautySummary: 'Breakouts/oil more likely—gentle exfoliants, non‑comedogenic moisturizers, spot treat; avoid harsh new actives.',
    hairSummary: 'Progesterone can increase scalp oil and shedding.',
    hairTips: [
      'Use gentle clarifying shampoos to manage excess oil.',
      'Soothe the scalp with anti‑inflammatory treatments if irritated.',
      'Avoid heavy styling products and reduce heat styling.'
    ],
    nutritionSummary: 'Magnesium + complex carbs to stabilize mood and sleep.',
    nutritionTips: ['Magnesium‑rich foods (cacao, nuts, leafy greens)', 'Complex carbs (oats, quinoa)', 'Limit caffeine late day'],
    weightLossTips: ['Favor low‑impact consistency', 'Manage cravings with protein/fiber', 'Prioritize sleep and stress care'],
  },
  Menstrual: {
    gradient: ['#5C1349', '#9E2A2B'],
    accentColor: '#D32F2F',
    surface: '#FCEEF2',
    border: '#F4D6DE',
    phaseIcon: '🩸',
    phaseText: 'Deep rest & introspection.',
    workoutRecommendation: 'Gentle Restorative Flow',
    workoutDetails: 'Restorative movement to ease discomfort and promote recovery.',
    workoutFocus: 'Restorative and gentle movement',
    workoutTypes: ['Light walking', 'Yoga', 'Stretching', 'Restorative Pilates'],
    workoutWhy: 'Energy and estrogen are lower—gentle movement promotes blood flow and reduces discomfort.',
    fitnessSummary: 'Prioritize rest and low‑impact movement—gentle yoga, stretching, easy walks. No pressure for high intensity.',
    workoutVideoURL: 'https://www.youtube.com/watch?v=mfG0p1sv9OI', // Note: Dailymotion link not supported
    yogaVideoURL: 'https://www.youtube.com/watch?v=mfG0p1sv9OI',
    danceVideoURL: 'https://www.youtube.com/watch?v=mfG0p1sv9OI',
    workoutProgramVideos: [
      'https://www.youtube.com/watch?v=mfG0p1sv9OI',
    ],
    workoutTime: '20 min',
    workoutLevel: 'Beginner',
    dietFocusTitle: 'Iron & Restorative Fats',
    macroGoals: '40% Carbs, 30% Protein, 30% Fat',
    supplementRecommendation: 'Iron with Vitamin C',
    featuredRecipeName: 'Palak Paneer with Roti',
    dailyMealPlan: [
      { meal: 'Breakfast', suggestion: 'Methi Paratha with Dahi' },
      { meal: 'Lunch', suggestion: 'Palak Paneer with Roti & Dal' },
      { meal: 'Dinner', suggestion: 'Moong Dal Khichdi with Ghee' },
    ],
    sleepRecommendation: 'Deep rest with flute sounds',
    sleepDetails: 'Long, deep sleep cycles support hormonal repair.',
    sleepPattern: 'Lighter, fragmented sleep; cramps may disrupt rest.',
    sleepRecommendations: ['Use heat pads', 'Relaxation or guided meditation', 'Consistent bedtime for easier onset'],
    sleepAids: ['Calming sleep music', 'Gentle yoga', 'Aromatherapy'],
    sleepSummary: 'Sleep can be lighter/fragmented—use warmth, relaxation/guided meditation, and consistent bedtime for comfort.',
    beautyTip: 'Gentle TLC and repair',
    beautyAction: 'Barrier‑repair serums and gentle cleansers for sensitivity.',
    suggestions: ['Ceramide serum', 'Fragrance‑free moisturizer', 'Soothing mist'],
    beautyRoutine: ['Creamy cleanse', 'Ceramide serum', 'Barrier moisturizer', 'SPF if outdoors'],
    beautyConcerns: ['Redness', 'Dryness', 'Sensitivity'],
    beautySummary: 'Skin more sensitive/dry; use mild fragrance‑free cleansers, rich moisturizers, avoid new actives; focus on soothing care.',
    hairSummary: 'Hair may feel dull or dry due to lower estrogen.',
    hairTips: [
      'Gentle cleansing with moisturizing shampoo and conditioner.',
      'Avoid heavy styling products or heat tools that dry hair.',
      'Massage scalp with coconut or jojoba oil to stimulate circulation.'
    ],
    nutritionSummary: 'Iron + hydration to restore and support comfort.',
    nutritionTips: ['Iron‑rich foods (leafy greens, beans)', 'Vitamin C with iron for absorption', 'Warm fluids and hydration'],
    weightLossTips: ['Prioritize rest; maintenance is okay', 'Gentle walks/yoga', 'Avoid aggressive deficits'],
  },
};



// Apply Flo unified palette across all phases (must run AFTER themes is defined)
(['Menstrual', 'Follicular', 'Ovulation', 'Luteal'] as HormonalPhase[]).forEach((p) => {
  themes[p].gradient = ['#15191D', '#0B0F12'];
  themes[p].accentColor = FLO_COLORS.primary;
  themes[p].surface = FLO_COLORS.surface;
  themes[p].border = FLO_COLORS.border;
});
