export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface Substance {
  id: number;
  name: string;
  icon_name: string;
  color_hex: string;
  cost_per_day: number; // Cost baseline at the height of spending (daily rate equivalent)
  cost_per_unit?: number; // Cost of an individual unit (pack, can, bottle, etc.)
  frequency?: FrequencyType; // Frequency of the cost baseline input ('daily' | 'weekly' | 'monthly')
  unit_name?: string; // Unit description (e.g. 'pack', 'can', 'bottle', 'drink', 'gram', 'unit')
  daily_habit_units?: number;
  quit_date?: string | null; // ISO string if quit/abstinent
  created_at: string;
  is_active: boolean;
}

export type TriggerTag =
  | 'Stress'
  | 'Boredom'
  | 'Social Pressure'
  | 'Anxiety'
  | 'Fatigue'
  | 'Habit / Routine'
  | 'Celebration'
  | 'Late Night'
  | 'Loneliness'
  | 'Craving Rush';

export interface ExpenseLog {
  id: number;
  substance_id: number;
  amount_spent: number;
  units_count: number;
  trigger_tag?: TriggerTag | string | null;
  note?: string | null;
  logged_at: string; // ISO string
}

export interface UrgeLog {
  id: number;
  substance_id: number;
  intensity: number; // 1-10
  activity_chosen: string;
  surfed_successfully: boolean;
  notes?: string | null;
  logged_at: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  biometrics_enabled: boolean;
  biometrics_pin: string; // 4-digit PIN
  cloud_sync_enabled: boolean; // default false
  currency: string;
  user_name?: string;
  last_unlocked_at?: string;
  device_frame_mode?: boolean;
}

export interface Affirmation {
  id: string;
  day: number;
  text: string;
  author: string;
  category: 'Compassion' | 'Resilience' | 'Clarity' | 'Freedom' | 'Grounding';
}

export interface UrgeActivity {
  id: string;
  title: string;
  duration_category: '<2min' | '5-15min' | '15+min';
  duration_label: string;
  description: string;
  type: 'breathing' | 'grounding' | 'cold_shock' | 'timer' | 'journal' | 'physical' | 'environment';
  instructions: string[];
}
