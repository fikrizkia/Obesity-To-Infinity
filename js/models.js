/**
 * ==========================================================
 * CLINICAL & EXERCISE LOGIC ENGINE
 * Obesity to Infinity
 * Calculations for BMI, Feasibility, Workout Generator,
 * Nutrition & Fasting, and Post-Workout Health Diagnostics
 * ==========================================================
 */

const HealthModels = {
  /**
   * 1. Calculate BMI & WHO Asia-Pacific Obesity Classification
   */
  calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    let category = '';
    let categoryKey = '';
    let badgeColor = '';
    let description = '';

    if (bmi < 18.5) {
      category = 'Berat Badan Kurang (Underweight)';
      categoryKey = 'underweight';
      badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
      description = 'Berat badan Anda di bawah rentang sehat. Fokuskan pada peningkatan massa otot.';
    } else if (bmi <= 22.9) {
      category = 'Berat Badan Normal (Ideal)';
      categoryKey = 'normal';
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      description = 'Berat badan Anda berada pada rentang sehat optimal standar Asia-Pasifik.';
    } else if (bmi <= 24.9) {
      category = 'Kelebihan Berat Badan (Overweight)';
      categoryKey = 'overweight';
      badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      description = 'Anda berada pada kategori berisiko. Penurunan berat badan bertahap akan menurunkan beban sendi dan risiko sindrom metabolik.';
    } else if (bmi <= 29.9) {
      category = 'Obesitas Tingkat 1 (Class I)';
      categoryKey = 'obesity_1';
      badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
      description = 'Kategori obesitas tingkat 1. Dibutuhkan jadwal adaptif jalan santai & defisit kalori teratur untuk melindungi sendi lutut.';
    } else {
      category = 'Obesitas Tingkat 2 (Class II - Berat)';
      categoryKey = 'obesity_2';
      badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
      description = 'Kategori obesitas tingkat 2. Beban sendi saat bergerak tinggi; program harus dimulai dengan low-impact walking & perlindungan sendi ketat.';
    }

    // Hitung berat badan ideal (BMI 22.0)
    const idealWeightMin = parseFloat((18.5 * heightM * heightM).toFixed(1));
    const idealWeightMax = parseFloat((22.9 * heightM * heightM).toFixed(1));
    const idealWeightMid = parseFloat((22.0 * heightM * heightM).toFixed(1));

    return {
      bmi,
      category,
      categoryKey,
      badgeColor,
      description,
      idealWeightMin,
      idealWeightMax,
      idealWeightMid
    };
  },

  /**
   * 2. Realistic Weight Goal Feasibility & Clinical Reality Checker
   */
  evaluateWeightGoal(startWeight, targetWeight, heightCm, durationMonths) {
    const totalWeeks = durationMonths * 4;
    const totalDays = durationMonths * 30;
    const totalLossKg = parseFloat((startWeight - targetWeight).toFixed(1));
    const weeklyRateKg = parseFloat((totalLossKg / totalWeeks).toFixed(2));
    const dailyCalorieDeficit = Math.round((totalLossKg * 7700) / totalDays);

    const heightM = heightCm / 100;
    const targetBMI = parseFloat((targetWeight / (heightM * heightM)).toFixed(1));

    let status = 'realistic'; // realistic | challenging | unrealistic
    let statusTitle = '';
    let statusColor = '';
    let message = '';
    let medicalWarnings = [];
    let smartSolutions = null;

    // Evaluasi 1: Target BMI terlalu rendah (< 18.5)
    if (targetBMI < 18.5) {
      status = 'unrealistic';
      statusTitle = 'Target Membahayakan: Menuju Underweight';
      statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
      message = `Target berat badan ${targetWeight} kg akan membuat BMI Anda menjadi ${targetBMI} (di bawah batas normal sehat 18.5).`;
      medicalWarnings.push('Risiko malnutrisi, penurunan kekebalan tubuh, dan osteoporosis.');
      
      const idealTarget = parseFloat((22.0 * heightM * heightM).toFixed(1));
      smartSolutions = {
        optionA: {
          title: 'Sesuaikan ke Batas Sehat (BMI 22.0)',
          suggestedTarget: idealTarget,
          suggestedLoss: parseFloat((startWeight - idealTarget).toFixed(1)),
          weeklyRate: 'Sangat Aman & Ideal'
        }
      };
    }
    // Evaluasi 2: Laju Penurunan > 1.2 kg per minggu (Ekstrem / Bahaya Crash Diet)
    else if (weeklyRateKg > 1.2) {
      status = 'unrealistic';
      statusTitle = 'Target Tidak Realistis & Berbahaya Secara Medis';
      statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
      message = `Anda ingin menurunkan ${totalLossKg} kg dalam ${durationMonths} bulan (${weeklyRateKg} kg/minggu). Laju ini melampaui batas aman fisiologi tubuh (maks. 1.0 kg/minggu).`;
      
      medicalWarnings = [
        'Kerusakan Metabolisme (Metabolic Slowdown): Tubuh masuk mode kelaparan dan membakar massa otot daripada lemak.',
        'Risiko Batu Empedu (Gallstones): Kolesterol mengendap akibat pelepasan lemak drastis.',
        'Efek Yoyo Ekstrem: 95% pelaku diet terlalu cepat mengalami kenaikan BB lebih berat dalam beberapa bulan.',
        'Beban Kardiovaskular Akut & Dehidrasi/Ketidakseimbangan Elektrolit.'
      ];

      // Hitung solusi realistis
      const safeMaxLoss = parseFloat((1.0 * totalWeeks).toFixed(1));
      const recommendedTargetForDuration = parseFloat((startWeight - safeMaxLoss).toFixed(1));
      let recommendedMonthsForTarget = Math.ceil(totalLossKg / (0.85 * 4)); // asumsi laju 0.85 kg/minggu
      if (recommendedMonthsForTarget < 2) recommendedMonthsForTarget = 2;
      if (recommendedMonthsForTarget > 6) recommendedMonthsForTarget = 6;

      smartSolutions = {
        optionA: {
          title: `Opsi A (Tetap ${durationMonths} Bulan)`,
          suggestedTarget: recommendedTargetForDuration,
          suggestedLoss: safeMaxLoss,
          weeklyRate: '1.0 kg/minggu (Aman & Permanen)'
        },
        optionB: {
          title: `Opsi B (Target Turun ${totalLossKg} kg)`,
          suggestedMonths: recommendedMonthsForTarget,
          weeklyRate: `${parseFloat((totalLossKg / (recommendedMonthsForTarget * 4)).toFixed(2))} kg/minggu (Sehat & Berkelanjutan)`
        }
      };
    }
    // Evaluasi 3: Laju 1.0 - 1.2 kg/minggu (Ambisius / Perlu Pengawasan)
    else if (weeklyRateKg > 1.0) {
      status = 'challenging';
      statusTitle = 'Target Ambisius (Perlu Disiplin Ekstra)';
      statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
      message = `Target penurunan ${weeklyRateKg} kg/minggu tergolong cukup agresif namun masih dapat dicapai dengan hidrasi optimal dan asupan protein tinggi.`;
      medicalWarnings.push('Pastikan tidak memangkas asupan kalori di bawah 1.200 kkal/hari.');
    }
    // Evaluasi 4: Laju 0.5 - 1.0 kg/minggu (Zona Emas Realistis & Aman)
    else if (weeklyRateKg >= 0.2) {
      status = 'realistic';
      statusTitle = 'Target Sangat Realistis & Sehat Optimal';
      statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      message = `Target penurunan ${weeklyRateKg} kg/minggu adalah standar emas medis (WHO & Kemenkes). Target ini membakar murni lemak, menjaga otot, dan menjaga metabolisme tetap prima!`;
    } else {
      status = 'realistic';
      statusTitle = 'Target Pemeliharaan / Penurunan Sangat Ringan';
      statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
      message = 'Target ini sangat aman dan mudah dipertahankan dalam jangka panjang.';
    }

    return {
      totalLossKg,
      weeklyRateKg,
      dailyCalorieDeficit,
      targetBMI,
      status,
      statusTitle,
      statusColor,
      message,
      medicalWarnings,
      smartSolutions
    };
  },

  /**
   * 3. BMR, TDEE, and Nutrition / Fasting Modeling
   */
  calculateNutritionPlan(user) {
    const { gender, current_weight, height, age, diet_model, fasting_protocol } = user;
    const weight = parseFloat(current_weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    // Formula Mifflin-St Jeor
    let bmr = (10 * weight) + (6.25 * h) - (5 * a);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    bmr = Math.round(bmr);

    // TDEE dengan faktor aktivitas sedentary-to-light (1.35)
    const tdee = Math.round(bmr * 1.35);

    // Target Defisit Kalori Harian (Moderately Safe: ~400 kcal)
    const targetCalories = Math.max(1300, tdee - 450);

    // Pembagian Makronutrisi (Plate Model)
    // Protein: 1.5g per kg BB (melindungi otot)
    const proteinGrams = Math.round(Math.min(weight * 1.5, (targetCalories * 0.30) / 4));
    const proteinCalories = proteinGrams * 4;

    // Lemak Sehat: 25% dari total kalori
    const fatCalories = Math.round(targetCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);

    // Karbohidrat Kompleks: Sisa kalori
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4);

    // Model Piring Sehat
    const plateModel = {
      veggiesAndFiber: '50% Piring (Sayuran Hijau, Brokoli, Wortel, Selada - Kenyang Lama & Rendah Kalori)',
      leanProtein: '25% Piring (Dada Ayam, Ikan, Telur, Tahu/Tempe - Melindungi Otot)',
      complexCarbs: '25% Piring (Nasi Merah, Ubi Rebus, Kentang Panggang, Oatmeal)'
    };

    // Protokol Puasa Intermiten
    let fastingDetails = {
      name: 'Pola Makan Teratur (Non-Fasting)',
      fastingHours: 0,
      eatingHours: 24,
      scheduleAdvice: 'Makan 3 kali porsi sedang dengan jeda 4-5 jam. Hindari ngemil larut malam.'
    };

    if (fasting_protocol === '14_10') {
      fastingDetails = {
        name: 'Intermittent Fasting 14:10 (Pemula)',
        fastingHours: 14,
        eatingHours: 10,
        exampleWindow: '08:00 - 18:00 (Jendela Makan) | 18:00 - 08:00 (Puasa)',
        workoutSync: 'Lakukan jalan santai di pagi hari (jam 07:00) sebelum buka puasa, atau 1.5 jam setelah makan siang.',
        scheduleAdvice: 'Sangat ramah lambung bagi penderita obesitas, membantu memperbaiki sensitivitas insulin.'
      };
    } else if (fasting_protocol === '16_8') {
      fastingDetails = {
        name: 'Intermittent Fasting 16:8 (Standar Leangains)',
        fastingHours: 16,
        eatingHours: 8,
        exampleWindow: '12:00 - 20:00 (Jendela Makan) | 20:00 - 12:00 (Puasa)',
        workoutSync: 'Waktu terbaik jalan kaki: Jam 17:00 (dalam jendela makan) atau jam 10:30 (akhir puasa dengan intensitas ringan).',
        scheduleAdvice: 'Memicu autofagi dan mempercepat pembakaran lemak cadangan tubuh.'
      };
    }

    return {
      bmr,
      tdee,
      targetCalories,
      proteinGrams,
      fatGrams,
      carbGrams,
      plateModel,
      fastingDetails
    };
  },

  /**
   * 4. Dynamic Workout Schedule & Weekly Milestone Roadmap Generator
   */
  generateProgramSchedules(user) {
    const { access_code, program_duration_months, fitness_level, obesity_category } = user;
    const months = parseInt(program_duration_months) || 1;
    const totalWeeks = months * 4;
    const schedules = [];

    // Tentukan tema mingguan dan progres bertahap
    // Ambil tanggal mulai dan hari mulai
    const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    let startDate = new Date();
    if (user.program_start_date) {
      const parsed = new Date(user.program_start_date);
      if (!isNaN(parsed.getTime())) {
        startDate = parsed;
      }
    }

    for (let w = 1; w <= totalWeeks; w++) {
      const monthNum = Math.ceil(w / 4);
      const weekInMonth = ((w - 1) % 4) + 1;

      // Rancang tema per minggu
      let weekTheme = '';
      if (w === 1) {
        weekTheme = 'Minggu 1: Adaptasi Persendian & Postur Jalan';
      } else if (w === 2) {
        weekTheme = 'Minggu 2: Peningkatan Ritme Nafas & Brisk Walking';
      } else if (w === 3) {
        weekTheme = 'Minggu 3: Penguatan Daya Tahan Kardiovaskular Dasar';
      } else if (w === 4) {
        weekTheme = 'Minggu 4: Konsistensi Ritme & Evaluasi Bulan ke-1';
      } else if (w <= 8) {
        weekTheme = `Minggu ${w}: Progresi Jalan Cepat ke Walk-Jog Interval`;
      } else if (w <= 12) {
        weekTheme = `Minggu ${w}: Peningkatan Interval Joging Ringan & Efisiensi Lemak`;
      } else {
        weekTheme = `Minggu ${w}: Fase Peak Endurance Menuju 5K Continuous Run`;
      }

      let workoutDaysCount = 0;

      // Buat 7 hari per minggu
      for (let d = 1; d <= 7; d++) {
        const dayNumber = (w - 1) * 7 + d;
        let title = '';
        let workoutType = '';
        let prescribedDuration = 0;
        let description = '';

        // Hitung tanggal kalender nyata untuk hari ke-N
        const dayDate = new Date(startDate.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000);
        const dayName = dayNamesIndo[dayDate.getDay()];
        const dateFormatted = dayDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const fullDateFormatted = dayDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

        // Pola latihan mingguan:
        // Hari 1, 3, 5: Kardio Utama
        // Hari 2: Mobilitas & Peregangan Sendi
        // Hari 4, 7: Istirahat
        // Hari 6: Pemulihan Aktif

        if (d === 1 || d === 3 || d === 5) {
          workoutDaysCount++;
          if (w <= 2) {
            workoutType = 'walk_gentle';
            prescribedDuration = 25 + (w * 5);
            title = `Sesi Jalan Santai Berirama (${prescribedDuration} Menit)`;
            description = 'Jalan kaki dengan postur tegak, langkah pendek dan ritme konstan. Jaga napas teratur.';
          } else if (w <= 5) {
            workoutType = 'brisk_walk';
            prescribedDuration = 30 + ((w - 2) * 5);
            title = `Sesi Jalan Cepat / Brisk Walk (${prescribedDuration} Menit)`;
            description = 'Jalan dengan tempo lebih cepat (kecepatan percakapan). Ayunkan lengan secara rileks.';
          } else if (w <= 10) {
            workoutType = 'walk_jog_interval';
            prescribedDuration = 35;
            title = `Sesi Walk-Jog Interval (35 Menit)`;
            description = 'Kombinasi 3 menit jalan cepat + 45 detik joging santai. Dengarkan sinyal sendi lutut Anda.';
          } else {
            workoutType = 'steady_jog';
            prescribedDuration = 35 + ((w - 10) * 3);
            title = `Sesi Steady Jogging (${prescribedDuration} Menit)`;
            description = 'Joging santai berkelanjutan dengan ritme pernapasan stabil.';
          }
        } else if (d === 6) {
          workoutDaysCount++;
          workoutType = 'active_recovery';
          prescribedDuration = 20;
          title = 'Jalan Santai Pemulihan Aktif (20 Menit)';
          description = 'Jalan santai santai tanpa target kecepatan untuk melancarkan sirkulasi asam laktat.';
        } else if (d === 2) {
          workoutType = 'mobility_stretch';
          prescribedDuration = 15;
          title = 'Peregangan Sendi & Mobilitas Kaki (15 Menit)';
          description = 'Lakukan peregangan betis, paha depan (quads), paha belakang (hamstring), dan telapak kaki.';
        } else {
          workoutType = 'rest_day';
          prescribedDuration = 0;
          title = (d === 7 && weekInMonth === 4) ? 'Hari Evaluasi Bulanan & Istirahat Total' : 'Hari Istirahat Penuh (Rest Day)';
          description = 'Istirahatkan otot dan sendi. Penuhi target hidrasi 2.5L air dan tidur berkualitas minimal 7-8 jam.';
        }

        schedules.push({
          user_code: access_code,
          day_number: dayNumber,
          week_number: w,
          month_number: monthNum,
          week_theme: weekTheme,
          day_of_week: d,
          day_name: dayName,
          calendar_date: dateFormatted,
          full_date_label: fullDateFormatted,
          title,
          workout_type: workoutType,
          prescribed_duration_mins: prescribedDuration,
          description,
          is_completed: false,
          completed_at: null,
          is_locked: dayNumber !== 1
        });
      }
    }

    return schedules;
  },

  /**
   * 5. Post-Workout Health Risk & Symptom Diagnostic Engine
   * Termasuk Analisis Fisiologis Durasi Berlebih (Excess Duration Analysis)
   */
  diagnosePostWorkout(inputData) {
    const { actualDuration, prescribedDuration = 0, rpeLevel, avgHeartRate, symptoms = [] } = inputData;
    const actual = parseInt(actualDuration) || 0;
    const prescribed = parseInt(prescribedDuration) || 0;
    const rpe = parseInt(rpeLevel) || 5;

    let riskLevel = 'green'; // green | yellow | red
    let riskTitle = 'Kondisi Optimal & Pemulihan Normal';
    let riskBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let autoRegulationApplied = false;
    let autoRegulationMessage = '';
    const adviceList = [];
    const targetedStretches = [];

    // Deteksi Durasi Berlebih
    let isExcessDuration = false;
    let excessMinutes = 0;
    let excessAnalysis = null;

    if (prescribed > 0 && actual > (prescribed + 5)) {
      isExcessDuration = true;
      excessMinutes = actual - prescribed;
      const surplusPct = Math.round((excessMinutes / prescribed) * 100);

      excessAnalysis = {
        excessMinutes,
        surplusPct,
        summary: `Durasi latihan aktual (${actual} menit) melebihi target jadwal (${prescribed} menit) sebesar +${excessMinutes} menit (+${surplusPct}%).`,
        physiologicalEffects: [
          {
            title: '1. Lonjakan Beban Impak Sendi Lutut & Ankle (Cartilage Overload)',
            desc: `Pada penderita obesitas, setiap langkah memberikan beban 3 hingga 4 kali berat badan ke tempurung lutut. Menambah durasi +${excessMinutes} menit menambahkan sekitar ${excessMinutes * 100}–${excessMinutes * 130} hentakan kaki ekstra ke tulang rawan sendi sebelum jaringan lunak sempat beradaptasi.`
          },
          {
            title: '2. Penurunan Efisiensi Pembakaran Lemak & Lonjakan Hormon Kortisol',
            desc: 'Pada intensitas yang melebihi batas adaptasi harian, tubuh mengalami penurunan efisiensi Fat Max (pembakaran lemak) dan beralih ke katabolisme otot (pemecahan massa otot) disertai peningkatan hormon stres kortisol yang memicu penumpukan air (water retention).'
          },
          {
            title: '3. Lonjakan Hormon Lapar Malam Hari (Compensatory Ghrelin Surge)',
            desc: 'Pengurasan glikogen yang terlalu dalam akibat durasi berlebih merangsang pelepasan hormon ghrelin secara agresif, memicu rasa lapar meledak atau dorongan "binge eating" 2–4 jam setelah latihan.'
          },
          {
            title: '4. Risiko Mikrolesi Tulang Kering & Fasia Kaki (Shin Splints / Plantar)',
            desc: 'Kelelahan otot penopang kaki membuat hentakan langsung diserap oleh tulang tibia dan fasia telapak kaki, meningkatkan risiko nyeri tulang kering dan tumit dalam 24–48 jam ke depan.'
          }
        ],
        recoveryProtocol: [
          '🧊 Elevasi Kaki & Kompres Dingin: Berbaring dengan kaki diangkat lebih tinggi dari dada selama 15 menit. Kompres es batu berbalut handuk pada lutut jika terasa hangat.',
          '💧 Rehidrasi Elektrolit Ekstra: Minum tambahan 400–500 ml air putih ditambah sedikit garam mineral atau air kelapa untuk mencegah kram otot malam hari.',
          '🍗 Nutrisi Penahan Lapar: Konsumsi 20–25g protein berkualitas (telur rebus/tempe/dada ayam) dalam 45 menit untuk meredam lonjakan hormon lapar ghrelin.',
          '🔄 Auto-Regulation Jadwal: Hari berikutnya disarankan untuk diisi dengan istirahat aktif atau jalan santai ringan agar persendian memiliki waktu regenerasi 24 jam penuh.'
        ]
      };
    }

    // 1. Cek Gejala Red Flag (Peringatan Medis Keras)
    const redFlagSymptoms = [
      'chest_tightness',      // Nyeri dada / dada tertekan
      'palpitations',        // Dada berdebar kencang tidak beraturan
      'severe_dyspnea',      // Sesak napas berat > 10 menit tidak reda
      'severe_dizziness',    // Pusing berputar hebat / pandangan gelap
      'sharp_joint_pain'     // Nyeri sendi tajam saat melangkah
    ];

    const hasRedFlag = symptoms.some(s => redFlagSymptoms.includes(s));

    if (hasRedFlag || rpe >= 9) {
      riskLevel = 'red';
      riskTitle = 'Peringatan Medis: Butuh Istirahat Total & Waspada Kardiovaskular';
      riskBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
      autoRegulationApplied = true;
      autoRegulationMessage = 'Sistem mengunci aktivitas berat selama 48 jam ke depan dan mengubah jadwal menjadi Istirahat Total demi keselamatan jantung dan persendian Anda.';

      adviceList.push({
        title: 'Tindakan Darurat Segera',
        text: 'Segera duduk bersandar atau berbaring dengan posisi kaki sedikit lebih tinggi. Longgarkan pakaian ketat dan bernapas dalam secara perlahan.'
      });
      adviceList.push({
        title: 'Peringatan Dokter',
        text: 'Jika sesak napas berat atau rasa tertekan di dada tidak mereda dalam 15 menit, segera minta bantuan keluarga untuk memeriksakan diri ke IGD / klinik terdekat.'
      });
    }
    // 2. Cek Gejala Yellow Zone (Overuse Sendi / Dehidrasi Ringan / RPE 7-8 / Durasi Berlebih Signifikan)
    else {
      const yellowSymptoms = [
        'knee_dull_pain',    // Nyeri tumpul tempurung lutut (Patellofemoral)
        'itb_outer_knee',    // Nyeri sisi luar lutut (IT Band)
        'heel_plantar_pain', // Nyeri tumit / telapak kaki (Plantar Fasciitis)
        'shin_splints',      // Nyeri tulang kering depan
        'lower_back_strain', // Pegal pinggang bawah
        'muscle_cramps',     // Kram betis
        'mild_dizziness',    // Pusing ringan saat berdiri cepat
        'extreme_hunger'     // Dorongan makan berlebih
      ];

      const hasYellowSymptoms = symptoms.some(s => yellowSymptoms.includes(s));

      if (hasYellowSymptoms || rpe >= 7 || (isExcessDuration && excessMinutes >= 15)) {
        riskLevel = 'yellow';
        riskTitle = isExcessDuration && !hasYellowSymptoms 
          ? 'Perhatian: Durasi Berlebih Terdeteksi (Overuse Cartilage Alert)'
          : 'Perhatian: Indikasi Kelelahan / Deteksi Dini Overuse Sendi';
        riskBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
        autoRegulationApplied = true;
        autoRegulationMessage = isExcessDuration
          ? `Sistem mendeteksi durasi latihan berlebih (+${excessMinutes} menit). Jadwal besok secara otomatis diperingan menjadi Jalan Santai Pemulihan 15 Menit agar sendi lutut tidak mengalami radang kronis.`
          : 'Sistem mendeteksi beban tinggi pada otot/sendi. Jadwal besok secara otomatis diperingan menjadi Jalan Santai Pemulihan 15 Menit.';

        // Spesifik Saran Ortopedi
        if (symptoms.includes('knee_dull_pain') || symptoms.includes('itb_outer_knee')) {
          adviceList.push({
            title: 'Protokol RICE untuk Lutut',
            text: 'Kompres es batu yang dibalut handuk pada area lutut selama 12–15 menit. Hindari posisi jongkok atau menekuk lutut terlalu tajam hari ini.'
          });
          targetedStretches.push('Peregangan Quadriceps (Paha Depan) & Peregangan Hamstring sambil duduk di kursi');
        }

        if (symptoms.includes('heel_plantar_pain')) {
          adviceList.push({
            title: 'Pencegahan Plantar Fasciitis',
            text: 'Pijat lembut telapak kaki menggunakan botol air dingin atau bola tenis selama 5 menit untuk melemaskan fasia telapak kaki.'
          });
          targetedStretches.push('Peregangan Tendon Achilles & Betis menempel pada dinding');
        }

        if (symptoms.includes('shin_splints')) {
          adviceList.push({
            title: 'Penanganan Tulang Kering (Shin Splints)',
            text: 'Kompres dingin area tulang kering depan dan pastikan Anda tidak melangkah terlalu panjang (overstriding) di sesi berikutnya.'
          });
        }

        if (symptoms.includes('mild_dizziness')) {
          adviceList.push({
            title: 'Penanganan Hipotensi Postural / Dehidrasi',
            text: 'Minum 400 ml air mineral ditambah sedikit garam atau air kelapa alami untuk mengembalikan elektrolit yang hilang.'
          });
        }

        if (symptoms.includes('extreme_hunger')) {
          adviceList.push({
            title: 'Pencegahan Binge Eating Pasca Latihan',
            text: 'Konsumsi 1 gelas air hangat + camilan tinggi protein (seperti 1 butir telur rebus atau segenggam edamame) sebelum makan besar untuk menekan hormon ghrelin.'
          });
        }
      } else {
        // Green Zone
        riskLevel = 'green';
        riskTitle = 'Kondisi Prima & Beban Latihan Sangat Sesuai';
        riskBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        adviceList.push({
          title: 'Hidrasi & Pemulihan Standar',
          text: 'Bagus sekali! Minum 300–500 ml air putih dan konsumsi makanan sehat bergizi seimbang dalam 1–2 jam ke depan.'
        });
        adviceList.push({
          title: 'Kesiapan Jadwal',
          text: 'Tubuh Anda beradaptasi dengan sangat baik. Jadwal latihan besok berjalan sesuai rencana normal.'
        });
      }
    }

    return {
      riskLevel,
      riskTitle,
      riskBadgeColor,
      autoRegulationApplied,
      autoRegulationMessage,
      adviceList,
      targetedStretches,
      isExcessDuration,
      excessMinutes,
      excessAnalysis
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthModels;
}
