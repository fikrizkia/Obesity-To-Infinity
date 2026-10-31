-- ==========================================================
-- SKEMA DATABASE SUPABASE: OBESITY TO INFINITY
-- Jalankan query ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================================

-- 1. Buat Tabel Profil Pengguna (obesity_users)
CREATE TABLE IF NOT EXISTS public.obesity_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    height NUMERIC(5,2) NOT NULL,
    start_weight NUMERIC(5,2) NOT NULL,
    current_weight NUMERIC(5,2) NOT NULL,
    target_weight NUMERIC(5,2) NOT NULL,
    waist_circumference NUMERIC(5,2),
    bmi NUMERIC(5,2) NOT NULL,
    obesity_category VARCHAR(50) NOT NULL,
    program_duration_months INT NOT NULL, -- 1, 2, 3, 6 bulan
    fitness_level VARCHAR(30) NOT NULL, -- level_0, level_1, level_2, level_3
    diet_model VARCHAR(50) NOT NULL, -- deficit_moderate, deficit_high_protein
    fasting_protocol VARCHAR(30) NOT NULL, -- none, 14_10, 16_8, alternate
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel Jadwal & Progres Latihan (workout_schedules)
CREATE TABLE IF NOT EXISTS public.workout_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_code VARCHAR(32) REFERENCES public.obesity_users(access_code) ON DELETE CASCADE,
    day_number INT NOT NULL,
    week_number INT NOT NULL,
    month_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    workout_type VARCHAR(50) NOT NULL, -- walk_gentle, brisk_walk, walk_jog_interval, active_recovery, rest_day
    prescribed_duration_mins INT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_locked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat Tabel Rekaman Pasca Latihan & Analisis Kesehatan (post_workout_logs)
CREATE TABLE IF NOT EXISTS public.post_workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_code VARCHAR(32) REFERENCES public.obesity_users(access_code) ON DELETE CASCADE,
    day_number INT NOT NULL,
    actual_duration_mins INT NOT NULL,
    steps_count INT,
    distance_km NUMERIC(5,2),
    rpe_fatigue_level INT NOT NULL, -- Skala 1 - 10
    avg_heart_rate INT,
    reported_symptoms JSONB, -- Array gejala persendian dan kardiovaskular
    risk_level VARCHAR(20) NOT NULL, -- green, yellow, red
    recommendations JSONB, -- Saran pemulihan spesifik
    auto_regulation_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buat Tabel Log Harian Habit & Puasa (daily_habits)
CREATE TABLE IF NOT EXISTS public.daily_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_code VARCHAR(32) REFERENCES public.obesity_users(access_code) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    workout_completed BOOLEAN DEFAULT FALSE,
    water_intake_ml INT DEFAULT 0,
    diet_adherence BOOLEAN DEFAULT FALSE,
    fasting_hours_completed NUMERIC(4,1) DEFAULT 0,
    weight_log NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_code, log_date)
);

-- 5. Aktifkan Row Level Security (RLS) & Kebijakan Akses Publik via Anon Key
ALTER TABLE public.obesity_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Policy Akses Bebas (Select, Insert, Update) berbasis access_code untuk Anon
CREATE POLICY "Allow public read access for obesity_users" ON public.obesity_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for obesity_users" ON public.obesity_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for obesity_users" ON public.obesity_users FOR UPDATE USING (true);

CREATE POLICY "Allow public all access for workout_schedules" ON public.workout_schedules FOR ALL USING (true);
CREATE POLICY "Allow public all access for post_workout_logs" ON public.post_workout_logs FOR ALL USING (true);
CREATE POLICY "Allow public all access for daily_habits" ON public.daily_habits FOR ALL USING (true);
