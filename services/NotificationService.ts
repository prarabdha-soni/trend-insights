import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Notification types
export enum NotificationType {
  PERIOD_START = 'period_start',
  OVULATION = 'ovulation',
  SYMPTOM_LOGGING = 'symptom_logging',
  HEALTH_TIP = 'health_tip',
  POSITIVE_AFFIRMATION = 'positive_affirmation',
  MONTHLY_SUMMARY = 'monthly_summary',
  IRREGULARITY_ALERT = 'irregularity_alert',
  DAILY_CHECKIN = 'daily_checkin'
}

// Cycle phase types
export enum CyclePhase {
  PERIOD = 'period',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal'
}

// User preferences interface
export interface NotificationPreferences {
  periodReminders: boolean;
  ovulationReminders: boolean;
  symptomLogging: boolean;
  healthTips: boolean;
  positiveAffirmations: boolean;
  monthlySummary: boolean;
  irregularityAlerts: boolean;
  dailyCheckin: boolean;
  highFrequency: boolean; // When enabled, send a notification every intervalMinutes
  intervalMinutes: number; // Interval in minutes for high-frequency mode
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  timezone: string;
}

// Cycle data interface
export interface CycleData {
  lastPeriodDate: Date;
  cycleLength: number;
  periodLength: number;
  isRegular: boolean;
  averageCycleLength: number;
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
}

// Smart notification content aligned with cycle-first wellness theme
const NOTIFICATION_CONTENT = {
  [NotificationType.PERIOD_START]: [
    "Your period may start tomorrow. Be gentle with yourself and prepare essentials.",
    "Period expected soon. Light stretching and warm fluids can help you feel better.",
    "Cycle update: menstruation may begin tomorrow. How is your energy today?",
    "A new cycle is beginning. Consider iron-rich foods and extra rest.",
    "Reminder: your period could start tomorrow. Keep a pad/tampon handy and breathe.",
    "Menstrual care tip: hydration and warmth support comfort at the start of your cycle.",
    "Your cycle is resetting. A brief check-in helps tailor your support this week."
  ],
  [NotificationType.OVULATION]: [
    "You're approaching ovulation. Energy may feel higher—support it with protein and hydration.",
    "Fertile window likely today. Noting cervical mucus or mood can improve predictions.",
    "Ovulation phase: consider light cardio or social activities if you feel energized.",
    "Cycle note: fertility likely at its peak. Listen to your body and rest as needed.",
    "Around ovulation, skin may glow and mood may lift. Capture a quick check-in.",
    "Fertile window tip: balanced meals and steady sleep keep hormones happy.",
    "Peak window: a short walk or breath work can channel this natural energy."
  ],
  [NotificationType.SYMPTOM_LOGGING]: [
    "Gentle check-in: mood, energy, cramps, skin, and sleep—how are they today?",
    "Two-minute log: noting symptoms helps tailor guidance to your cycle phase.",
    "Quick track: any changes in flow, pain, or cravings today?",
    "How do you feel right now? Your notes improve tomorrow’s predictions.",
    "Short check-in: hydration, movement, and rest—which one would help most today?",
    "Your body shifts across the cycle. A small log keeps support personalized.",
    "Noticing patterns builds self-trust. Share a quick update."
  ],
  [NotificationType.HEALTH_TIP]: [
    "Sip warm water or herbal tea—gentle support for hormonal balance.",
    "Add leafy greens or seeds today for micronutrients your cycle loves.",
    "Deep breathing can calm cortisol and ease cramps.",
    "A short walk outdoors may lift energy and stabilize mood.",
    "Prioritize consistent sleep windows; hormones thrive on routine.",
    "Include protein and healthy fats to steady energy across the day.",
    "Magnesium-rich foods can support relaxation in the evening."
  ],
  [NotificationType.POSITIVE_AFFIRMATION]: [
    "Your body is wise. Each phase has a purpose—trust your rhythm.",
    "You deserve care and softness today. Small steps count.",
    "Your cycle is a guide. Listening to it is powerful.",
    "You are doing enough. Rest and nourishment are productive.",
    "Your energy will ebb and flow. Both are valuable.",
    "You can meet today with kindness—for yourself and your body.",
    "Every check-in is self-respect. You’ve got this."
  ],
  [NotificationType.MONTHLY_SUMMARY]: [
    "Your monthly cycle summary is ready—see patterns and gentle suggestions.",
    "New insights available: cycle timing, symptoms, and supportive tips.",
    "Monthly overview: notice what helped most in each phase.",
    "Cycle report ready. We’ve highlighted trends to support next month.",
    "Summary available: nutrition, movement, and rest ideas by phase.",
    "This month’s insights are here—simple steps for steadier hormones.",
    "Explore your month: what felt nourishing? Let’s keep more of that."
  ],
  [NotificationType.IRREGULARITY_ALERT]: [
    "We noticed a change in your cycle pattern. A gentle check-in may help.",
    "Cycle timing looks different this month. Track symptoms to refine insights.",
    "Your cycle may be shifting. If concerned, consider consulting a provider.",
    "Pattern update: we detected irregular timing. We’ll adapt guidance.",
    "Your body may need extra rest and nourishment this week.",
    "Cycle change detected. Logging a few details can clarify what’s happening.",
    "If you experience discomfort or worry, a clinician can support you."
  ],
  [NotificationType.DAILY_CHECKIN]: [
    "Good day. A brief check-in helps tailor support to your current phase.",
    "Morning note: how are energy, mood, and sleep?",
    "If you have 60 seconds, log anything notable today.",
    "Your cycle leads your health—how does your body feel right now?",
    "A small check-in now can make tonight’s tip more relevant.",
    "Noticing your body is powerful. Share a quick update when ready."
  ]
};

// Health tips by cycle phase
const HEALTH_TIPS_BY_PHASE = {
  [CyclePhase.PERIOD]: [
    "Stay hydrated and rest well during your period. 💧",
    "Gentle yoga can help with menstrual cramps. 🧘‍♀️",
    "Iron-rich foods support your body during menstruation. 🥬",
    "Warm baths can ease period discomfort. 🛁"
  ],
  [CyclePhase.FOLLICULAR]: [
    "Your energy is rising! Perfect time for light exercise. 💪",
    "Focus on protein-rich foods to support hormone production. 🥗",
    "Fresh air and sunlight boost your mood during this phase. ☀️",
    "Gentle cardio can enhance your natural energy. 🏃‍♀️"
  ],
  [CyclePhase.OVULATION]: [
    "Peak fertility days! Track your symptoms carefully. 📊",
    "Your body is at its most energetic. Enjoy it! ⚡",
    "Fertility awareness: Your body is working perfectly. 🌟",
    "Ovulation energy is powerful. Channel it positively! ✨"
  ],
  [CyclePhase.LUTEAL]: [
    "Progesterone is rising. Focus on relaxation and self-care. 🧘‍♀️",
    "Your body is preparing. Be gentle with yourself. 💕",
    "PMS prevention: Magnesium-rich foods can help. 🥜",
    "Luteal phase calls for extra rest and nourishment. 🌙"
  ]
};

// Positive affirmations by cycle phase
const AFFIRMATIONS_BY_PHASE = {
  [CyclePhase.PERIOD]: [
    "Your body is cleansing and renewing. Trust the process. 🌸",
    "Menstruation is a sign of health and vitality. You're amazing! 💪",
    "Your body is working perfectly. Honor this natural process. ✨",
    "Every period is a fresh start. You're exactly where you need to be. 🌺"
  ],
  [CyclePhase.FOLLICULAR]: [
    "New beginnings are here! Your energy is building beautifully. 🌱",
    "Your body is preparing for new possibilities. Trust the journey. 💫",
    "Fresh energy flows through you. Embrace this renewal. 🌸",
    "The follicular phase brings hope and new energy. You're growing! 🌟"
  ],
  [CyclePhase.OVULATION]: [
    "You're at your peak! Your body is powerful and fertile. ⚡",
    "Ovulation energy is creative and strong. Channel it wisely. ✨",
    "Your fertility is a gift. Honor this powerful phase. 🌸",
    "Peak performance time! Your body is amazing. 💪"
  ],
  [CyclePhase.LUTEAL]: [
    "Your body is preparing with wisdom and care. Trust it. 🌙",
    "The luteal phase brings depth and intuition. Honor it. 💕",
    "Your body knows exactly what to do. Trust the process. 🌸",
    "Preparation phase is beautiful. You're exactly where you need to be. ✨"
  ]
};

export class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences | null = null;
  private cycleData: CycleData | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  public async initialize(): Promise<void> {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Load user preferences and cycle data
    await this.loadUserData();
  }

  // Load user preferences and cycle data from local storage
  private async loadUserData(): Promise<void> {
    try {
      const preferencesData = await AsyncStorage.getItem('notificationPreferences');
      const cycleDataString = await AsyncStorage.getItem('cycleData');

      if (preferencesData) {
        this.preferences = JSON.parse(preferencesData);
      } else {
        // Set default preferences
        this.preferences = {
          periodReminders: true,
          ovulationReminders: true,
          symptomLogging: true,
          healthTips: true,
          positiveAffirmations: true,
          monthlySummary: true,
          irregularityAlerts: true,
          dailyCheckin: true,
          highFrequency: true,
          intervalMinutes: 15,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        await this.savePreferences();
      }

      if (cycleDataString) {
        const cycleData = JSON.parse(cycleDataString);
        this.cycleData = {
          ...cycleData,
          lastPeriodDate: new Date(cycleData.lastPeriodDate),
          nextPeriodDate: new Date(cycleData.nextPeriodDate),
          ovulationDate: new Date(cycleData.ovulationDate),
          fertileWindowStart: new Date(cycleData.fertileWindowStart),
          fertileWindowEnd: new Date(cycleData.fertileWindowEnd)
        };
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Save user preferences to local storage
  private async savePreferences(): Promise<void> {
    if (this.preferences) {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    }
  }

  // Save cycle data to local storage
  private async saveCycleData(): Promise<void> {
    if (this.cycleData) {
      await AsyncStorage.setItem('cycleData', JSON.stringify(this.cycleData));
    }
  }

  // Update cycle data
  public async updateCycleData(lastPeriodDate: Date, cycleLength: number = 28, periodLength: number = 5): Promise<void> {
    const today = new Date();
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

    const fertileWindowEnd = new Date(ovulationDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

    this.cycleData = {
      lastPeriodDate,
      cycleLength,
      periodLength,
      isRegular: true, // This would be calculated based on historical data
      averageCycleLength: cycleLength,
      nextPeriodDate,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd
    };

    await this.saveCycleData();
    await this.scheduleNotifications();
  }

  // Calculate current cycle phase
  private getCurrentCyclePhase(): CyclePhase {
    if (!this.cycleData) return CyclePhase.FOLLICULAR;

    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today.getTime() - this.cycleData.lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastPeriod <= this.cycleData.periodLength) {
      return CyclePhase.PERIOD;
    } else if (daysSinceLastPeriod <= 14) {
      return CyclePhase.FOLLICULAR;
    } else if (daysSinceLastPeriod <= 16) {
      return CyclePhase.OVULATION;
    } else {
      return CyclePhase.LUTEAL;
    }
  }

  // Schedule all notifications
  public async scheduleNotifications(): Promise<void> {
    if (!this.preferences || !this.cycleData) return;

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const today = new Date();
    const currentPhase = this.getCurrentCyclePhase();

    // High-frequency mode: schedule ALL notification types every 15 minutes
    if (this.preferences.highFrequency) {
      const intervalMs = Math.max(1, this.preferences.intervalMinutes) * 60 * 1000;
      // Schedule the next 24 hours worth of notifications at interval boundaries
      const end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      let cursor = new Date(today.getTime() + intervalMs);
      
      const notificationTypes = [
        NotificationType.DAILY_CHECKIN,
        NotificationType.SYMPTOM_LOGGING,
        NotificationType.HEALTH_TIP,
        NotificationType.POSITIVE_AFFIRMATION
      ];
      
      // Add dummy notification types for testing
      const dummyNotifications = [
        "🌸 Your cycle is in the follicular phase - perfect time for gentle exercise!",
        "💧 Stay hydrated today! Your body needs extra water during this phase.",
        "🧘‍♀️ Take a moment for deep breathing - it helps balance your hormones.",
        "🥗 Add leafy greens to your next meal for iron and folate.",
        "🌙 Your body is preparing for ovulation - listen to your energy levels.",
        "✨ You're doing amazing! Trust your body's natural rhythm.",
        "💪 Gentle movement today can boost your mood and energy.",
        "🍯 Consider magnesium-rich foods to support your cycle naturally.",
        "🌱 Your energy is building - this is a great time for new projects!",
        "💖 You deserve rest and nourishment - be gentle with yourself today."
      ];
      
      while (cursor <= end) {
        // Schedule a random notification type every 15 minutes
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        let content = '';
        
        if (randomType === NotificationType.HEALTH_TIP) {
          const phase = this.getCurrentCyclePhase();
          content = this.getRandomContent(HEALTH_TIPS_BY_PHASE[phase]);
        } else if (randomType === NotificationType.POSITIVE_AFFIRMATION) {
          const phase = this.getCurrentCyclePhase();
          content = this.getRandomContent(AFFIRMATIONS_BY_PHASE[phase]);
        } else {
          content = this.getRandomContent(NOTIFICATION_CONTENT[randomType]);
        }
        
        // Add some dummy notifications for variety
        if (Math.random() < 0.3) { // 30% chance of dummy notification
          content = this.getRandomContent(dummyNotifications);
        }
        
        await this.scheduleNotification(randomType, cursor, content);
        cursor = new Date(cursor.getTime() + intervalMs);
      }
    }

    // Schedule period start reminder (1 day before)
    if (this.preferences.periodReminders) {
      const periodReminderDate = new Date(this.cycleData.nextPeriodDate);
      periodReminderDate.setDate(periodReminderDate.getDate() - 1);
      
      if (periodReminderDate > today) {
        await this.scheduleNotification(
          NotificationType.PERIOD_START,
          periodReminderDate,
          this.getRandomContent(NOTIFICATION_CONTENT[NotificationType.PERIOD_START])
        );
      }
    }

    // Schedule ovulation reminder
    if (this.preferences.ovulationReminders) {
      if (this.cycleData.ovulationDate > today) {
        await this.scheduleNotification(
          NotificationType.OVULATION,
          this.cycleData.ovulationDate,
          this.getRandomContent(NOTIFICATION_CONTENT[NotificationType.OVULATION])
        );
      }
    }

    // Schedule daily symptom logging (every day at 9 AM)
    if (this.preferences.symptomLogging) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        date.setHours(9, 0, 0, 0);
        
        if (date > today) {
          await this.scheduleNotification(
            NotificationType.SYMPTOM_LOGGING,
            date,
            this.getRandomContent(NOTIFICATION_CONTENT[NotificationType.SYMPTOM_LOGGING])
          );
        }
      }
    }

    // Schedule health tips (every day at 2 PM)
    if (this.preferences.healthTips) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        date.setHours(14, 0, 0, 0);
        
        if (date > today) {
          const phase = this.getCurrentCyclePhase();
          const healthTip = this.getRandomContent(HEALTH_TIPS_BY_PHASE[phase]);
          await this.scheduleNotification(
            NotificationType.HEALTH_TIP,
            date,
            healthTip
          );
        }
      }
    }

    // Schedule positive affirmations (every day at 7 PM)
    if (this.preferences.positiveAffirmations) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        date.setHours(19, 0, 0, 0);
        
        if (date > today) {
          const phase = this.getCurrentCyclePhase();
          const affirmation = this.getRandomContent(AFFIRMATIONS_BY_PHASE[phase]);
          await this.scheduleNotification(
            NotificationType.POSITIVE_AFFIRMATION,
            date,
            affirmation
          );
        }
      }
    }

    // Schedule monthly summary (1st of each month at 10 AM)
    if (this.preferences.monthlySummary) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(10, 0, 0, 0);
      
      await this.scheduleNotification(
        NotificationType.MONTHLY_SUMMARY,
        nextMonth,
        this.getRandomContent(NOTIFICATION_CONTENT[NotificationType.MONTHLY_SUMMARY])
      );
    }

    // Schedule daily check-in (every day at 8 AM)
    if (this.preferences.dailyCheckin) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        date.setHours(8, 0, 0, 0);
        
        if (date > today) {
          await this.scheduleNotification(
            NotificationType.DAILY_CHECKIN,
            date,
            this.getRandomContent(NOTIFICATION_CONTENT[NotificationType.DAILY_CHECKIN])
          );
        }
      }
    }
  }

  // Schedule a single notification
  private async scheduleNotification(
    type: NotificationType,
    date: Date,
    content: string
  ): Promise<void> {
    if (!this.preferences) return;

    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const notificationTime = date.getHours() * 60 + date.getMinutes();
      const quietStart = this.timeToMinutes(this.preferences.quietHours.start);
      const quietEnd = this.timeToMinutes(this.preferences.quietHours.end);
      
      if (this.isInQuietHours(notificationTime, quietStart, quietEnd)) {
        return;
      }
    }

    const seconds = Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'NariCare',
        body: content,
        data: { type },
        sound: 'default',
      },
      trigger,
    });
  }

  // Convert time string to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Check if time is in quiet hours
  private isInQuietHours(time: number, start: number, end: number): boolean {
    if (start <= end) {
      return time >= start && time <= end;
    } else {
      return time >= start || time <= end;
    }
  }

  // Get random content from array
  private getRandomContent(contentArray: string[]): string {
    return contentArray[Math.floor(Math.random() * contentArray.length)];
  }

  // Update notification preferences
  public async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    if (this.preferences) {
      this.preferences = { ...this.preferences, ...newPreferences };
      await this.savePreferences();
      await this.scheduleNotifications();
    }
  }

  // Get current preferences
  public getPreferences(): NotificationPreferences | null {
    return this.preferences;
  }

  // Get current cycle data
  public getCycleData(): CycleData | null {
    return this.cycleData;
  }

  // Cancel all notifications
  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get scheduled notifications
  public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Enable high-frequency mode for testing (sends notifications every 15 minutes)
  public async enableHighFrequencyMode(): Promise<void> {
    await this.updatePreferences({ 
      highFrequency: true, 
      intervalMinutes: 15 
    });
  }

  // Disable high-frequency mode
  public async disableHighFrequencyMode(): Promise<void> {
    await this.updatePreferences({ 
      highFrequency: false 
    });
  }
}
