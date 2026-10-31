/**
 * ==========================================================
 * SUPABASE CLIENT & HYBRID STORAGE ENGINE
 * Obesity to Infinity
 * Handles communication with Supabase REST API & LocalStorage Fallback
 * ==========================================================
 */

const SUPABASE_CONFIG = {
  url: 'https://sgvynqlwnukphnccencd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndnlucWx3bnVrcGhuY2NlbmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTM2NTksImV4cCI6MjEwMzYyOTY1OX0.Lj7LwszF54_ltowZ940FfNtXF88HmCxOuvXYHBaHeXA',
  storageKeyUser: 'obesity_current_user',
  storageKeyPrefix: 'obesity_data_'
};

class SupabaseService {
  constructor() {
    this.url = SUPABASE_CONFIG.url;
    this.key = SUPABASE_CONFIG.anonKey;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Prefer': 'return=representation'
    };
  }

  /**
   * Helper request to Supabase REST API
   */
  async request(endpoint, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    const fetchOptions = {
      headers: { ...this.headers, ...(options.headers || {}) },
      ...options
    };

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Supabase REST warning on ${endpoint} [${response.status}]:`, errText);
        return { success: false, status: response.status, error: errText };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.warn(`Supabase network error on ${endpoint}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Generate a unique memorable Access Code for user login
   * Format: OBE-XXXX (e.g., OBE-7892)
   */
  generateAccessCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `OBE-${num}`;
  }

  /**
   * Save User Profile to Supabase & LocalStorage
   */
  async saveUserProfile(userData) {
    // 1. Simpan ke LocalStorage sebagai primary immediate cache
    localStorage.setItem(SUPABASE_CONFIG.storageKeyUser, JSON.stringify(userData));
    localStorage.setItem(`${SUPABASE_CONFIG.storageKeyPrefix}${userData.access_code}`, JSON.stringify(userData));

    // 2. Coba simpan / upsert ke Supabase
    try {
      const payload = {
        access_code: userData.access_code,
        name: userData.name,
        age: parseInt(userData.age),
        gender: userData.gender,
        height: parseFloat(userData.height),
        start_weight: parseFloat(userData.start_weight),
        current_weight: parseFloat(userData.current_weight),
        target_weight: parseFloat(userData.target_weight),
        waist_circumference: userData.waist_circumference ? parseFloat(userData.waist_circumference) : null,
        bmi: parseFloat(userData.bmi),
        obesity_category: userData.obesity_category,
        program_duration_months: parseInt(userData.program_duration_months),
        fitness_level: userData.fitness_level,
        diet_model: userData.diet_model,
        fasting_protocol: userData.fasting_protocol,
        current_streak: userData.current_streak || 0,
        longest_streak: userData.longest_streak || 0,
        updated_at: new Date().toISOString()
      };

      const res = await this.request('obesity_users', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(payload)
      });

      if (res.success) {
        console.log('✓ User profile successfully synced to Supabase');
      }
    } catch (e) {
      console.log('Using LocalStorage mode for user profile');
    }

    return userData;
  }

  /**
   * Get User Profile by Access Code (Supabase first, then LocalStorage)
   */
  async getUserProfile(accessCode) {
    const code = accessCode.trim().toUpperCase();

    // 1. Coba ambil dari Supabase
    try {
      const res = await this.request(`obesity_users?access_code=eq.${code}&select=*`);
      if (res.success && res.data && res.data.length > 0) {
        const user = res.data[0];
        // Sinkronkan ke local storage
        localStorage.setItem(SUPABASE_CONFIG.storageKeyUser, JSON.stringify(user));
        localStorage.setItem(`${SUPABASE_CONFIG.storageKeyPrefix}${code}`, JSON.stringify(user));
        return user;
      }
    } catch (e) {
      console.log('Supabase fetch failed, checking local cache...');
    }

    // 2. Fallback: Cari di LocalStorage
    const localData = localStorage.getItem(`${SUPABASE_CONFIG.storageKeyPrefix}${code}`);
    if (localData) {
      const user = JSON.parse(localData);
      localStorage.setItem(SUPABASE_CONFIG.storageKeyUser, JSON.stringify(user));
      return user;
    }

    return null;
  }

  /**
   * Save Workout Schedules Array
   */
  async saveSchedules(accessCode, schedules) {
    const key = `obesity_schedules_${accessCode}`;
    localStorage.setItem(key, JSON.stringify(schedules));

    // Coba simpan ke Supabase jika tabel ada
    try {
      // Format payload untuk batch insert/upsert
      const rows = schedules.map(s => ({
        user_code: accessCode,
        day_number: s.day_number,
        week_number: s.week_number,
        month_number: s.month_number,
        title: s.title,
        workout_type: s.workout_type,
        prescribed_duration_mins: s.prescribed_duration_mins,
        description: s.description,
        is_completed: s.is_completed,
        is_locked: s.is_locked,
        completed_at: s.completed_at || null
      }));

      await this.request('workout_schedules', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(rows)
      });
    } catch (e) {
      // Local fallback active
    }
  }

  /**
   * Load Workout Schedules
   */
  async getSchedules(accessCode) {
    // 1. Coba dari Supabase
    try {
      const res = await this.request(`workout_schedules?user_code=eq.${accessCode}&order=day_number.asc`);
      if (res.success && res.data && res.data.length > 0) {
        localStorage.setItem(`obesity_schedules_${accessCode}`, JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {}

    // 2. Dari LocalStorage
    const local = localStorage.getItem(`obesity_schedules_${accessCode}`);
    return local ? JSON.parse(local) : null;
  }

  /**
   * Save Post-Workout Health Log
   */
  async savePostWorkoutLog(accessCode, logData) {
    const key = `obesity_logs_${accessCode}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(logData);
    localStorage.setItem(key, JSON.stringify(existing));

    // Simpan ke Supabase
    try {
      await this.request('post_workout_logs', {
        method: 'POST',
        body: JSON.stringify({
          user_code: accessCode,
          day_number: logData.day_number,
          actual_duration_mins: logData.actual_duration_mins,
          steps_count: logData.steps_count || null,
          distance_km: logData.distance_km || null,
          rpe_fatigue_level: logData.rpe_fatigue_level,
          avg_heart_rate: logData.avg_heart_rate || null,
          reported_symptoms: logData.reported_symptoms,
          risk_level: logData.risk_level,
          recommendations: logData.recommendations,
          auto_regulation_applied: logData.auto_regulation_applied || false
        })
      });
    } catch (e) {}

    return existing;
  }

  /**
   * Get Post-Workout Logs
   */
  async getPostWorkoutLogs(accessCode) {
    try {
      const res = await this.request(`post_workout_logs?user_code=eq.${accessCode}&order=created_at.desc`);
      if (res.success && res.data && res.data.length > 0) {
        localStorage.setItem(`obesity_logs_${accessCode}`, JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {}

    const local = localStorage.getItem(`obesity_logs_${accessCode}`);
    return local ? JSON.parse(local) : [];
  }

  /**
   * Save Daily Habit Log (Water, Fasting, Diet)
   */
  async saveDailyHabits(accessCode, habitData) {
    const key = `obesity_habits_${accessCode}_${habitData.log_date}`;
    localStorage.setItem(key, JSON.stringify(habitData));

    try {
      await this.request('daily_habits', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          user_code: accessCode,
          log_date: habitData.log_date,
          workout_completed: habitData.workout_completed,
          water_intake_ml: habitData.water_intake_ml,
          diet_adherence: habitData.diet_adherence,
          fasting_hours_completed: habitData.fasting_hours_completed,
          weight_log: habitData.weight_log || null
        })
      });
    } catch (e) {}
  }

  /**
   * Get Daily Habit Log
   */
  async getDailyHabits(accessCode, dateStr) {
    try {
      const res = await this.request(`daily_habits?user_code=eq.${accessCode}&log_date=eq.${dateStr}`);
      if (res.success && res.data && res.data.length > 0) {
        return res.data[0];
      }
    } catch (e) {}

    const key = `obesity_habits_${accessCode}_${dateStr}`;
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : {
      log_date: dateStr,
      workout_completed: false,
      water_intake_ml: 0,
      diet_adherence: false,
      fasting_hours_completed: 0,
      weight_log: null
    };
  }

  /**
   * Get Active Logged-in User from Local Session
   */
  getCurrentUser() {
    const raw = localStorage.getItem(SUPABASE_CONFIG.storageKeyUser);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Logout User
   */
  logout() {
    localStorage.removeItem(SUPABASE_CONFIG.storageKeyUser);
  }
}

// Inisialisasi Singleton Service
const dbService = new SupabaseService();
