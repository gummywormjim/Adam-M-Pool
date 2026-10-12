import { Substance, ExpenseLog, UrgeLog, AppSettings, TriggerTag } from '../types';

export const SQLITE_DDL_SCHEMA = `
-- ========================================================
-- HABITVAULT LOCAL-FIRST ENCRYPTED SQLITE DATABASE (SQLCipher AES-256)
-- ========================================================

CREATE TABLE IF NOT EXISTS substances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  cost_per_day REAL NOT NULL,
  cost_per_unit REAL,
  frequency TEXT DEFAULT 'daily',
  unit_name TEXT DEFAULT 'day',
  daily_habit_units REAL DEFAULT 1,
  quit_date DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS expense_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  substance_id INTEGER NOT NULL,
  amount_spent REAL NOT NULL,
  units_count REAL DEFAULT 1,
  trigger_tag TEXT,
  note TEXT,
  logged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (substance_id) REFERENCES substances(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS urge_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  substance_id INTEGER,
  intensity INTEGER CHECK(intensity BETWEEN 1 AND 10),
  activity_chosen TEXT NOT NULL,
  surfed_successfully INTEGER DEFAULT 1,
  notes TEXT,
  logged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expense_substance ON expense_logs(substance_id);
CREATE INDEX IF NOT EXISTS idx_expense_logged_at ON expense_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_urge_logged_at ON urge_logs(logged_at);
`.trim();

const STORAGE_KEY = 'haven_sqlite_cipher_vault_v1';
const ENCRYPTION_SALT = 'haven-local-aes256-salt-v1';

export interface DatabaseState {
  substances: Substance[];
  expense_logs: ExpenseLog[];
  urge_logs: UrgeLog[];
  app_settings: Record<string, string>;
  last_encrypted_backup_at?: string;
}

const DEFAULT_SUBSTANCES: Substance[] = [
  {
    id: 1,
    name: 'Cigarettes',
    icon_name: 'flame',
    color_hex: '#EF4444',
    cost_per_day: 12.50,
    cost_per_unit: 12.50,
    unit_name: 'pack',
    quit_date: new Date().toISOString(), // Zero days clean streak when user opens app for the first time
    created_at: new Date().toISOString(),
    is_active: true,
  },
];

const DEFAULT_EXPENSES: ExpenseLog[] = [];

const DEFAULT_URGES: UrgeLog[] = [];

const DEFAULT_SETTINGS: Record<string, string> = {
  theme: 'dark',
  biometrics_enabled: 'true',
  biometrics_pin: '',
  security_setup_completed: 'false',
  tutorial_completed: 'false',
  cloud_sync_enabled: 'false',
  currency: '$',
  device_frame_mode: 'false',
};

// Web Crypto AES-GCM 256 Helper for simulated local encrypted SQLite (SQLCipher concept)
async function deriveKey(pinOrSecret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pinOrSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(ENCRYPTION_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, secretKey: string = 'haven-default-master'): Promise<string> {
  try {
    const key = await deriveKey(secretKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(data)
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.warn('WebCrypto fallback to base64 encoding:', e);
    return btoa(data);
  }
}

export async function decryptData(cipherText: string, secretKey: string = 'haven-default-master'): Promise<string> {
  try {
    const raw = atob(cipherText);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const key = await deriveKey(secretKey);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    try {
      // Fallback if not encrypted or key changed
      return atob(cipherText);
    } catch {
      return cipherText;
    }
  }
}

class SQLiteStorageEngine {
  private state: DatabaseState = {
    substances: [],
    expense_logs: [],
    urge_logs: [],
    app_settings: {},
  };
  private isLoaded: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public async init(): Promise<DatabaseState> {
    if (this.isLoaded) return this.state;

    try {
      const rawStored = localStorage.getItem(STORAGE_KEY);
      if (rawStored) {
        const decrypted = await decryptData(rawStored);
        const parsed = JSON.parse(decrypted);
        const rawSubstances = parsed.substances || DEFAULT_SUBSTANCES;
        const normalizedSubstances: Substance[] = rawSubstances.map((s: any) => {
          const costPerDay = s.cost_per_day != null
            ? Number(s.cost_per_day)
            : s.cost_per_unit != null
            ? Number(((s.cost_per_unit * (s.daily_habit_units || 1)) / (s.frequency === 'weekly' ? 7 : 1)).toFixed(2))
            : 10;
          const costPerUnit = s.cost_per_unit != null && Number(s.cost_per_unit) > 0
            ? Number(s.cost_per_unit)
            : costPerDay;
          return {
            ...s,
            cost_per_day: costPerDay,
            cost_per_unit: costPerUnit,
            unit_name: s.unit_name || 'unit',
          };
        });

        const isTutorialCompleted = parsed.app_settings?.tutorial_completed === 'true';
        let substancesToUse = normalizedSubstances;
        let expensesToUse = parsed.expense_logs || DEFAULT_EXPENSES;
        let urgesToUse = parsed.urge_logs || DEFAULT_URGES;

        // If tutorial has not been completed, enforce first-time state:
        // Only Tracked Substance: Cigarettes, Sober Streak: 0 days
        if (!isTutorialCompleted) {
          substancesToUse = [
            {
              id: 1,
              name: 'Cigarettes',
              icon_name: 'flame',
              color_hex: '#EF4444',
              cost_per_day: 12.50,
              cost_per_unit: 12.50,
              unit_name: 'pack',
              quit_date: new Date().toISOString(), // Zero days clean streak
              created_at: new Date().toISOString(),
              is_active: true,
            },
          ];
          expensesToUse = [];
          urgesToUse = [];
        }

        this.state = {
          substances: substancesToUse,
          expense_logs: expensesToUse,
          urge_logs: urgesToUse,
          app_settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.app_settings || {}),
            tutorial_completed: isTutorialCompleted ? 'true' : 'false',
          },
        };
        if (!isTutorialCompleted) {
          await this.persist();
        }
      } else {
        // Seed default dataset
        this.state = {
          substances: DEFAULT_SUBSTANCES,
          expense_logs: DEFAULT_EXPENSES,
          urge_logs: DEFAULT_URGES,
          app_settings: DEFAULT_SETTINGS,
        };
        await this.persist();
      }
    } catch (err) {
      console.error('Error initializing SQLite storage vault:', err);
      this.state = {
        substances: DEFAULT_SUBSTANCES,
        expense_logs: DEFAULT_EXPENSES,
        urge_logs: DEFAULT_URGES,
        app_settings: DEFAULT_SETTINGS,
      };
    }

    this.isLoaded = true;
    this.notify();
    return this.state;
  }

  private async persist(): Promise<void> {
    try {
      const json = JSON.stringify(this.state);
      const encrypted = await encryptData(json);
      localStorage.setItem(STORAGE_KEY, encrypted);
      this.notify();
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  // --- SUBSTANCES CRUD ---
  public getSubstances(): Substance[] {
    return this.state.substances.filter((s) => s.is_active !== false);
  }

  public getSubstanceById(id: number): Substance | undefined {
    return this.state.substances.find((s) => s.id === id);
  }

  public async addSubstance(substance: Omit<Substance, 'id' | 'created_at' | 'is_active'>): Promise<Substance> {
    const nextId = this.state.substances.length > 0 ? Math.max(...this.state.substances.map((s) => s.id)) + 1 : 1;
    const costPerDay = substance.cost_per_day != null
      ? Number(substance.cost_per_day)
      : 10;
    const costPerUnit = substance.cost_per_unit != null && Number(substance.cost_per_unit) > 0
      ? Number(substance.cost_per_unit)
      : costPerDay;

    const newSubstance: Substance = {
      ...substance,
      cost_per_day: costPerDay,
      cost_per_unit: costPerUnit,
      unit_name: substance.unit_name || 'unit',
      id: nextId,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    this.state.substances.push(newSubstance);
    await this.persist();
    return newSubstance;
  }

  public async updateSubstance(id: number, updates: Partial<Substance>): Promise<Substance | null> {
    const index = this.state.substances.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const current = this.state.substances[index];
    const newCostPerDay = updates.cost_per_day != null
      ? Number(updates.cost_per_day)
      : current.cost_per_day;
    const newCostPerUnit = updates.cost_per_unit != null && Number(updates.cost_per_unit) > 0
      ? Number(updates.cost_per_unit)
      : current.cost_per_unit ?? newCostPerDay;
    const newUnitName = updates.unit_name !== undefined
      ? updates.unit_name
      : current.unit_name || 'unit';

    this.state.substances[index] = {
      ...current,
      ...updates,
      cost_per_day: newCostPerDay,
      cost_per_unit: newCostPerUnit,
      unit_name: newUnitName,
    };
    await this.persist();
    return this.state.substances[index];
  }

  public async deleteSubstance(id: number): Promise<boolean> {
    const index = this.state.substances.findIndex((s) => s.id === id);
    if (index === -1) return false;
    // Soft delete or remove
    this.state.substances[index].is_active = false;
    await this.persist();
    return true;
  }

  // --- EXPENSE LOGS CRUD ---
  public getExpenseLogs(substanceId?: number): ExpenseLog[] {
    if (substanceId) {
      return this.state.expense_logs
        .filter((e) => e.substance_id === substanceId)
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
    }
    return [...this.state.expense_logs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
  }

  public async addExpenseLog(log: {
    substance_id: number;
    amount_spent: number;
    units_count?: number;
    trigger_tag?: TriggerTag | string | null;
    note?: string | null;
    logged_at?: string;
  }): Promise<ExpenseLog> {
    const nextId = this.state.expense_logs.length > 0 ? Math.max(...this.state.expense_logs.map((e) => e.id)) + 1 : 1;
    const newLog: ExpenseLog = {
      id: nextId,
      substance_id: log.substance_id,
      amount_spent: log.amount_spent,
      units_count: log.units_count ?? 1,
      trigger_tag: log.trigger_tag ?? null,
      note: log.note ?? null,
      logged_at: log.logged_at || new Date().toISOString(),
    };
    this.state.expense_logs.unshift(newLog);
    await this.persist();
    return newLog;
  }

  public async deleteExpenseLog(id: number): Promise<boolean> {
    const prevCount = this.state.expense_logs.length;
    this.state.expense_logs = this.state.expense_logs.filter((e) => e.id !== id);
    if (this.state.expense_logs.length !== prevCount) {
      await this.persist();
      return true;
    }
    return false;
  }

  public async clearAllExpenseLogs(substanceId?: number): Promise<boolean> {
    if (substanceId !== undefined) {
      this.state.expense_logs = this.state.expense_logs.filter((e) => e.substance_id !== substanceId);
    } else {
      this.state.expense_logs = [];
    }
    await this.persist();
    return true;
  }

  // --- URGE LOGS CRUD ---
  public getUrgeLogs(): UrgeLog[] {
    return [...this.state.urge_logs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
  }

  public async addUrgeLog(log: Omit<UrgeLog, 'id' | 'logged_at'>): Promise<UrgeLog> {
    const nextId = this.state.urge_logs.length > 0 ? Math.max(...this.state.urge_logs.map((u) => u.id)) + 1 : 1;
    const newUrge: UrgeLog = {
      ...log,
      id: nextId,
      logged_at: new Date().toISOString(),
    };
    this.state.urge_logs.unshift(newUrge);
    await this.persist();
    return newUrge;
  }

  // --- SETTINGS CRUD ---
  public getSetting(key: string, defaultValue: string = ''): string {
    return this.state.app_settings[key] ?? defaultValue;
  }

  public getAllSettings(): Record<string, string> {
    return { ...this.state.app_settings };
  }

  public async setSetting(key: string, value: string): Promise<void> {
    this.state.app_settings[key] = value;
    await this.persist();
  }

  public async setSettingsBatch(settings: Record<string, string>): Promise<void> {
    this.state.app_settings = { ...this.state.app_settings, ...settings };
    await this.persist();
  }

  // --- LIKED AFFIRMATIONS CRUD ---
  public getLikedAffirmationIds(): string[] {
    const raw = this.getSetting('liked_affirmation_ids', '[]');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public async toggleLikedAffirmation(id: string): Promise<boolean> {
    const current = this.getLikedAffirmationIds();
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [...current, id];
    await this.setSetting('liked_affirmation_ids', JSON.stringify(updated));
    return !exists;
  }

  // --- FINANCIAL CALCULATIONS (Saved vs Spent) ---
  public calculateFinancials(timeframe: 'week' | 'month' | 'all' = 'all') {
    const now = Date.now();
    let cutoffMs = 0;
    if (timeframe === 'week') {
      cutoffMs = now - 7 * 24 * 60 * 60 * 1000;
    } else if (timeframe === 'month') {
      cutoffMs = now - 30 * 24 * 60 * 60 * 1000;
    }

    const activeSubstances = this.getSubstances();

    // 1. Calculate Total Spent from logged expenses
    const relevantExpenses = this.state.expense_logs.filter((e) => {
      if (cutoffMs === 0) return true;
      return new Date(e.logged_at).getTime() >= cutoffMs;
    });

    const totalSpent = relevantExpenses.reduce((sum, item) => sum + item.amount_spent, 0);

    // 2. Calculate Total Saved:
    // For each substance with a quit_date, calculate expected spend between quit_date (or cutoff) and now
    let totalSaved = 0;
    const perSubstanceSaved: Record<number, number> = {};
    const perSubstanceSpent: Record<number, number> = {};

    activeSubstances.forEach((s) => {
      perSubstanceSpent[s.id] = relevantExpenses
        .filter((e) => e.substance_id === s.id)
        .reduce((sum, e) => sum + e.amount_spent, 0);

      if (s.quit_date) {
        const quitTime = new Date(s.quit_date).getTime();
        const effectiveStartTime = cutoffMs > 0 ? Math.max(quitTime, cutoffMs) : quitTime;
        const daysElapsed = Math.max(0, (now - effectiveStartTime) / (1000 * 60 * 60 * 24));

        const dailyCost = s.cost_per_day != null
          ? s.cost_per_day
          : s.cost_per_unit != null
          ? (s.cost_per_unit * (s.daily_habit_units || 1)) / (s.frequency === 'weekly' ? 7 : s.frequency === 'monthly' ? 30 : 1)
          : 10;

        const expectedCost = dailyCost * daysElapsed;
        // Saved is expected baseline cost minus any slips logged in this timeframe for this substance
        const slips = perSubstanceSpent[s.id];
        const saved = Math.max(0, expectedCost - slips);
        perSubstanceSaved[s.id] = saved;
        totalSaved += saved;
      } else {
        perSubstanceSaved[s.id] = 0;
      }
    });

    const netImpact = totalSaved - totalSpent;

    return {
      totalSpent,
      totalSaved,
      netImpact,
      relevantExpensesCount: relevantExpenses.length,
      perSubstanceSaved,
      perSubstanceSpent,
    };
  }

  // --- BACKUP, RESTORE & WIPE ---
  public async exportBackup(): Promise<string> {
    const backupPayload = {
      version: 1,
      engine: 'SQLite3_SQLCipher_AES256',
      exported_at: new Date().toISOString(),
      data: this.state,
    };
    return JSON.stringify(backupPayload, null, 2);
  }

  public async importBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.data && Array.isArray(parsed.data.substances)) {
        this.state = parsed.data;
        await this.persist();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import backup failed:', e);
      return false;
    }
  }

  public async wipeAllData(): Promise<void> {
    this.state = {
      substances: [],
      expense_logs: [],
      urge_logs: [],
      app_settings: {
        ...DEFAULT_SETTINGS,
        biometrics_enabled: 'false',
      },
    };
    await this.persist();
  }

  public async resetToDefaults(): Promise<void> {
    this.state = {
      substances: [
        {
          id: 1,
          name: 'Cigarettes',
          icon_name: 'flame',
          color_hex: '#EF4444',
          cost_per_day: 12.50,
          cost_per_unit: 12.50,
          unit_name: 'pack',
          quit_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          is_active: true,
        },
      ],
      expense_logs: [],
      urge_logs: [],
      app_settings: {
        ...DEFAULT_SETTINGS,
        tutorial_completed: 'false',
      },
    };
    await this.persist();
  }
}

export const sqliteStorage = new SQLiteStorageEngine();
