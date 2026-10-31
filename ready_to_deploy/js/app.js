/**
 * ==========================================================
 * MAIN APPLICATION CONTROLLER
 * Obesity to Infinity
 * UI Management, Auth with User Access Codes, Calendar &
 * Weekly Milestones, Fasting Clock, and Post-Workout Health Logs
 * ==========================================================
 */

let currentUser = null;
let userSchedules = [];
let userLogs = [];
let currentHabits = null;
let currentWeekViewing = 1;
let weightChartInstance = null;
let fastingTimerInterval = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  initLucideIcons();
  await checkAuthStatus();
  setupEventListeners();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * 1. Auth Status & Screen Switching
 */
async function checkAuthStatus() {
  const user = dbService.getCurrentUser();
  if (user) {
    currentUser = user;
    await loadUserData();
    showMainApp();
  } else {
    showAuthScreen();
  }
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('main-app-screen').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-app-screen').classList.remove('hidden');
  updateHeaderProfile();
  renderCalendarTab();
  renderDietTab();
  renderAnalyticsTab();
  renderHealthLogHistory();
  initLucideIcons();
}

/**
 * 2. Load User Data & Schedules
 */
async function loadUserData() {
  if (!currentUser) return;

  // Ambil Jadwal
  let schedules = await dbService.getSchedules(currentUser.access_code);
  if (!schedules || schedules.length === 0) {
    schedules = HealthModels.generateProgramSchedules(currentUser);
    await dbService.saveSchedules(currentUser.access_code, schedules);
  }
  userSchedules = schedules;

  // Ambil Logbook Pasca Latihan
  userLogs = await dbService.getPostWorkoutLogs(currentUser.access_code);

  // Ambil Habit Hari Ini
  const todayStr = new Date().toISOString().split('T')[0];
  currentHabits = await dbService.getDailyHabits(currentUser.access_code, todayStr);
}

/**
 * 3. Update Header Profile & Badges
 */
function updateHeaderProfile() {
  if (!currentUser) return;
  document.getElementById('user-display-name').textContent = currentUser.name;
  document.getElementById('user-access-code-badge').textContent = currentUser.access_code;
  document.getElementById('user-streak-count').textContent = currentUser.current_streak || 0;
  document.getElementById('user-bmi-badge').textContent = `BMI ${currentUser.bmi}`;
  document.getElementById('user-bb-stat').textContent = `${currentUser.current_weight} kg`;
  document.getElementById('user-target-stat').textContent = `${currentUser.target_weight} kg`;
  
  // Hitung persentase progres menuju target
  const start = parseFloat(currentUser.start_weight);
  const current = parseFloat(currentUser.current_weight);
  const target = parseFloat(currentUser.target_weight);
  const totalDiff = start - target;
  const currentDiff = start - current;
  const progressPct = totalDiff > 0 ? Math.min(100, Math.max(0, Math.round((currentDiff / totalDiff) * 100))) : 0;
  
  const progressBar = document.getElementById('header-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPct}%`;
  }
}

/**
 * 4. Tab Navigation
 */
function switchTab(tabId) {
  // Update desktop side nav buttons
  document.querySelectorAll('.side-tab-btn').forEach(btn => {
    btn.classList.remove('bg-primary-container/20', 'text-primary', 'font-bold', 'border-r-4', 'border-primary');
    btn.classList.add('text-on-surface-variant');
  });

  const activeSideBtn = document.getElementById(`side-tab-btn-${tabId}`);
  if (activeSideBtn) {
    activeSideBtn.classList.add('bg-primary-container/20', 'text-primary', 'font-bold', 'border-r-4', 'border-primary');
    activeSideBtn.classList.remove('text-on-surface-variant');
  }

  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const targetPane = document.getElementById(`tab-pane-${tabId}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  if (tabId === 'analytics') {
    renderAnalyticsTab();
  } else if (tabId === 'calendar') {
    renderCalendarTab();
  } else if (tabId === 'diet') {
    renderDietTab();
  }

  initLucideIcons();
}

/**
 * 5. Render Kalender & Roadmap Mingguan (Weekly Milestone Roadmap)
 */
function renderCalendarTab() {
  if (!userSchedules || userSchedules.length === 0) return;

  const totalWeeks = (currentUser.program_duration_months || 1) * 4;
  const weekSelector = document.getElementById('week-selector-dropdown');
  if (weekSelector) {
    weekSelector.innerHTML = '';
    for (let w = 1; w <= totalWeeks; w++) {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = `Minggu ke-${w} (Bulan ${Math.ceil(w / 4)})`;
      if (w === currentWeekViewing) opt.selected = true;
      weekSelector.appendChild(opt);
    }
  }

  // Filter jadwal untuk minggu yang sedang dilihat
  const weekDays = userSchedules.filter(s => s.week_number === currentWeekViewing);
  const weekTheme = weekDays.length > 0 ? weekDays[0].week_theme : `Minggu ${currentWeekViewing}`;

  // Header Banner Target Mingguan
  document.getElementById('weekly-milestone-title').textContent = weekTheme;
  const completedInWeek = weekDays.filter(s => s.is_completed).length;
  const totalInWeek = weekDays.length;
  document.getElementById('weekly-progress-counter').textContent = `${completedInWeek} dari ${totalInWeek} Selesai (${Math.round((completedInWeek/totalInWeek)*100)}%)`;

  // Render Grid 7 Hari
  const gridContainer = document.getElementById('week-days-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  weekDays.forEach((day, idx) => {
    const card = document.createElement('div');
    card.className = `day-card rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between `;

    // Tentukan Style Status
    let statusBadge = '';
    let actionBtn = '';

    if (day.is_completed) {
      card.classList.add('day-completed', 'border-l-4', 'border-l-primary');
      statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-0.5"><span class="material-symbols-outlined text-xs">check_circle</span> Selesai</span>';
      actionBtn = `<button onclick="viewCompletedLog(${day.day_number})" class="text-xs text-primary font-bold hover:underline mt-3 flex items-center gap-1"><span class="material-symbols-outlined text-xs">visibility</span> Lihat Rekaman & Respon</button>`;
    } else if (day.is_locked) {
      card.classList.add('day-locked');
      statusBadge = '<span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-surface-container-high text-outline flex items-center gap-0.5"><span class="material-symbols-outlined text-xs">lock</span> Terkunci</span>';
      actionBtn = `<p class="text-[11px] text-outline mt-3 flex items-center gap-1"><span class="material-symbols-outlined text-xs">lock_clock</span> Selesaikan sesi sebelumnya.</p>`;
    } else {
      // Hari Aktif (Siap Latihan)
      card.classList.add('day-active');
      statusBadge = '<span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 text-amber-900 border border-amber-400 flex items-center gap-1"><span class="material-symbols-outlined text-xs">bolt</span> Aktif Hari Ini</span>';
      
      if (day.workout_type === 'rest_day') {
        actionBtn = `<button onclick="completeRestDay(${day.day_number})" class="w-full mt-3 py-2 px-3 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary font-bold text-xs rounded-xl shadow-sm transition">Selesaikan Istirahat Aktif</button>`;
      } else {
        actionBtn = `
          <div class="flex gap-2 mt-3">
            <button onclick="openPostWorkoutModal(${day.day_number})" class="flex-1 py-2 px-3 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1 hover:scale-[1.02]">
              <span class="material-symbols-outlined text-sm">check_circle</span> Selesai & Check-in
            </button>
            <button onclick="swapToLowImpact(${day.day_number})" title="Ganti ke latihan ramah lutut jika sendi ngilu" class="py-2 px-2.5 bg-tertiary-container/15 hover:bg-tertiary-container/30 text-tertiary font-bold text-xs rounded-xl border border-tertiary-container/30 transition flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">healing</span>
            </button>
          </div>
        `;
      }
    }

    const dayDisplayName = day.day_name ? `${day.day_name}, ${day.calendar_date || ''}` : `${dayNames[idx]}`;

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-outline">${dayDisplayName} (Hari ${day.day_number})</span>
          ${statusBadge}
        </div>
        <h4 class="font-bold text-on-surface text-sm mb-1">${day.title}</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed mb-2">${day.description}</p>
        ${day.prescribed_duration_mins > 0 ? `<div class="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"><span class="material-symbols-outlined text-xs">schedule</span> Target Jadwal: ${day.prescribed_duration_mins} Menit</div>` : ''}
      </div>
      <div>
        ${actionBtn}
      </div>
    `;

    gridContainer.appendChild(card);
  });

  initLucideIcons();
}

function changeWeekViewing(direction) {
  const totalWeeks = (currentUser.program_duration_months || 1) * 4;
  const newWeek = currentWeekViewing + direction;
  if (newWeek >= 1 && newWeek <= totalWeeks) {
    currentWeekViewing = newWeek;
    renderCalendarTab();
  }
}

function onWeekDropdownChange(e) {
  currentWeekViewing = parseInt(e.target.value);
  renderCalendarTab();
}

/**
 * 6. Selesaikan Hari Istirahat Aktif
 */
async function completeRestDay(dayNumber) {
  const day = userSchedules.find(s => s.day_number === dayNumber);
  if (!day) return;

  day.is_completed = true;
  day.completed_at = new Date().toISOString();

  // Buka hari berikutnya
  unlockNextDay(dayNumber);

  // Tambah Streak
  currentUser.current_streak = (currentUser.current_streak || 0) + 1;
  if (currentUser.current_streak > (currentUser.longest_streak || 0)) {
    currentUser.longest_streak = currentUser.current_streak;
  }

  await dbService.saveSchedules(currentUser.access_code, userSchedules);
  await dbService.saveUserProfile(currentUser);

  celebrateStreak();
  updateHeaderProfile();
  renderCalendarTab();
  alert('🎉 Hari istirahat aktif diselesaikan! Tubuh Anda memulihkan energi untuk sesi berikutnya.');
}

/**
 * 7. Ganti Latihan ke Low Impact jika Sendi Lelah
 */
async function swapToLowImpact(dayNumber) {
  const day = userSchedules.find(s => s.day_number === dayNumber);
  if (!day) return;

  if (confirm(`Apakah lutut/sendi Anda terasa lelah hari ini?\n\nSistem akan mengalihkan sesi Hari ke-${dayNumber} menjadi "Jalan Santai Pemulihan Lutut & Peregangan Sendi (20 Menit)" yang sangat aman bagi persendian.`)) {
    day.title = 'Jalan Santai Pemulihan Lutut & Peregangan Sendi (20 Menit)';
    day.workout_type = 'active_recovery';
    day.prescribed_duration_mins = 20;
    day.description = 'Latihan low-impact untuk menjaga sirkulasi darah tanpa memberikan tekanan impak pada tempurung lutut.';
    
    await dbService.saveSchedules(currentUser.access_code, userSchedules);
    renderCalendarTab();
  }
}

/**
 * 8. Unlock Next Day in Linear Progression
 */
function unlockNextDay(completedDayNumber) {
  const nextDay = userSchedules.find(s => s.day_number === completedDayNumber + 1);
  if (nextDay) {
    nextDay.is_locked = false;
  }
}

/**
 * 9. Post-Workout Health Check-in Modal
 */
let activeWorkoutDayNumber = null;

function openPostWorkoutModal(dayNumber) {
  activeWorkoutDayNumber = dayNumber;
  const day = userSchedules.find(s => s.day_number === dayNumber);
  if (!day) return;

  const prescribed = day.prescribed_duration_mins || 30;
  const dayTitle = day.day_name ? `${day.day_name}, ${day.calendar_date || ''} (Hari ${dayNumber})` : `Hari ke-${dayNumber}`;
  
  document.getElementById('modal-workout-day-title').textContent = `Check-in Latihan: ${dayTitle}`;
  
  const targetBadge = document.getElementById('modal-prescribed-duration-badge');
  if (targetBadge) {
    targetBadge.textContent = `${prescribed} Menit`;
  }
  
  const durationInput = document.getElementById('post-duration-input');
  if (durationInput) {
    durationInput.value = prescribed;
  }
  
  document.getElementById('post-rpe-input').value = '5';
  document.getElementById('rpe-value-display').textContent = '5 - Cukup Melelahkan (Bisa Bicara Pendek)';
  document.getElementById('post-heartrate-input').value = '';
  document.getElementById('post-steps-input').value = '';

  // Reset checkboxes
  document.querySelectorAll('.symptom-checkbox').forEach(cb => cb.checked = false);

  // Check real-time alert
  checkExcessDurationRealtime();

  // Sembunyikan hasil diagnosa awal
  document.getElementById('diagnostic-result-container').classList.add('hidden');
  document.getElementById('post-workout-form-inputs').classList.remove('hidden');

  document.getElementById('post-workout-modal').classList.remove('hidden');
}

function closePostWorkoutModal() {
  document.getElementById('post-workout-modal').classList.add('hidden');
}

function checkExcessDurationRealtime() {
  if (!activeWorkoutDayNumber) return;
  const day = userSchedules.find(s => s.day_number === activeWorkoutDayNumber);
  const prescribed = day ? (day.prescribed_duration_mins || 30) : 30;
  const actual = parseInt(document.getElementById('post-duration-input').value) || 0;
  
  const alertBanner = document.getElementById('post-excess-alert-banner');
  const alertTitle = document.getElementById('post-excess-alert-title');
  const alertDesc = document.getElementById('post-excess-alert-desc');
  
  if (alertBanner && prescribed > 0 && actual > prescribed + 5) {
    const diff = actual - prescribed;
    const surplusPct = Math.round((diff / prescribed) * 100);
    alertTitle.textContent = `Peringatan: Durasi Latihan Melebihi Jadwal (+${diff} Menit / +${surplusPct}%)`;
    alertDesc.textContent = `Anda berjalan ${diff} menit lebih lama dari target aman. Sistem akan menyertakan analisis proteksi sendi lutut, lonjakan hormon stres/lapar, dan panduan pemulihan khusus pasca latihan.`;
    alertBanner.classList.remove('hidden');
  } else if (alertBanner) {
    alertBanner.classList.add('hidden');
  }
}

async function submitPostWorkoutCheckin(e) {
  e.preventDefault();
  if (!activeWorkoutDayNumber) return;

  const actualDuration = parseInt(document.getElementById('post-duration-input').value) || 30;
  const rpeLevel = parseInt(document.getElementById('post-rpe-input').value) || 5;
  const avgHeartRate = document.getElementById('post-heartrate-input').value ? parseInt(document.getElementById('post-heartrate-input').value) : null;
  const stepsCount = document.getElementById('post-steps-input').value ? parseInt(document.getElementById('post-steps-input').value) : null;

  const day = userSchedules.find(s => s.day_number === activeWorkoutDayNumber);
  const prescribedDuration = day ? (day.prescribed_duration_mins || 0) : 0;

  const symptoms = [];
  document.querySelectorAll('.symptom-checkbox:checked').forEach(cb => {
    symptoms.push(cb.value);
  });

  // Jalankan Diagnostic Engine
  const diagnosis = HealthModels.diagnosePostWorkout({
    actualDuration,
    prescribedDuration,
    rpeLevel,
    avgHeartRate,
    symptoms
  });

  // Simpan logbook ke DB/LocalStorage
  const logData = {
    day_number: activeWorkoutDayNumber,
    prescribed_duration_mins: prescribedDuration,
    actual_duration_mins: actualDuration,
    steps_count: stepsCount,
    rpe_fatigue_level: rpeLevel,
    avg_heart_rate: avgHeartRate,
    reported_symptoms: symptoms,
    risk_level: diagnosis.riskLevel,
    risk_title: diagnosis.riskTitle,
    recommendations: diagnosis.adviceList,
    targeted_stretches: diagnosis.targetedStretches,
    is_excess_duration: diagnosis.isExcessDuration,
    excess_minutes: diagnosis.excessMinutes,
    auto_regulation_applied: diagnosis.autoRegulationApplied,
    created_at: new Date().toISOString()
  };

  await dbService.savePostWorkoutLog(currentUser.access_code, logData);

  // Tandai hari latihan selesai
  if (day) {
    day.is_completed = true;
    day.completed_at = new Date().toISOString();
    unlockNextDay(activeWorkoutDayNumber);
  }

  // Jika Auto-Regulation menyarankan peringan jadwal besok:
  if (diagnosis.autoRegulationApplied) {
    const nextDay = userSchedules.find(s => s.day_number === activeWorkoutDayNumber + 1);
    if (nextDay && nextDay.workout_type !== 'rest_day') {
      nextDay.title = 'Active Recovery Walk (Penyesuaian Perlindungan Sendi)';
      nextDay.workout_type = 'active_recovery';
      nextDay.prescribed_duration_mins = 15;
      nextDay.description = 'Jadwal diperingan otomatis oleh sistem untuk memberi waktu pemulihan sendi dan tendon.';
    }
  }

  // Update Streak
  currentUser.current_streak = (currentUser.current_streak || 0) + 1;
  if (currentUser.current_streak > (currentUser.longest_streak || 0)) {
    currentUser.longest_streak = currentUser.current_streak;
  }

  await dbService.saveSchedules(currentUser.access_code, userSchedules);
  await dbService.saveUserProfile(currentUser);

  // Tampilkan Hasil Diagnosa di Modal
  renderDiagnosticResult(diagnosis);
  celebrateStreak();
  updateHeaderProfile();
  renderCalendarTab();
  renderHealthLogHistory();
}

function renderDiagnosticResult(diagnosis) {
  document.getElementById('post-workout-form-inputs').classList.add('hidden');
  const resultContainer = document.getElementById('diagnostic-result-container');
  resultContainer.classList.remove('hidden');

  let bannerBg = 'bg-primary/10 border-primary/20 text-on-surface';
  let badgeText = '🟢 ZONA AMAN & OPTIMAL';
  if (diagnosis.riskLevel === 'yellow') {
    bannerBg = 'bg-amber-50 border-amber-300 text-amber-950';
    badgeText = '🟡 ZONA PERHATIAN: OVERUSE / KELELAHAN';
  } else if (diagnosis.riskLevel === 'red') {
    bannerBg = 'bg-error-container/40 border-error/30 text-on-error-container';
    badgeText = '🔴 ZONA PERINGATAN MEDIS DARURAT';
  }

  let adviceHTML = diagnosis.adviceList.map(adv => `
    <div class="p-3 bg-white rounded-xl border border-outline-variant/30 shadow-sm">
      <h5 class="font-bold text-on-surface text-xs mb-1">${adv.title}</h5>
      <p class="text-xs text-on-surface-variant leading-relaxed">${adv.text}</p>
    </div>
  `).join('');

  let stretchHTML = '';
  if (diagnosis.targetedStretches && diagnosis.targetedStretches.length > 0) {
    stretchHTML = `
      <div class="mt-3 p-3 bg-secondary-container/20 border border-secondary-container/40 rounded-xl">
        <h5 class="font-bold text-secondary text-xs mb-1">🧘 Rekomendasi Peregangan Khusus:</h5>
        <ul class="list-disc list-inside text-xs text-on-surface-variant space-y-1">
          ${diagnosis.targetedStretches.map(st => `<li>${st}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let autoRegHTML = '';
  if (diagnosis.autoRegulationApplied) {
    autoRegHTML = `
      <div class="mt-3 p-3 bg-tertiary-container/15 border border-tertiary-container/30 rounded-xl">
        <h5 class="font-bold text-tertiary text-xs mb-1">🔄 Penyesuaian Jadwal Otomatis (Auto-Regulation):</h5>
        <p class="text-xs text-on-surface-variant">${diagnosis.autoRegulationMessage}</p>
      </div>
    `;
  }

  // Komponen Khusus Analisis Fisiologis Durasi Berlebih
  let excessHTML = '';
  if (diagnosis.isExcessDuration && diagnosis.excessAnalysis) {
    const ex = diagnosis.excessAnalysis;
    excessHTML = `
      <div class="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl space-y-3 shadow-sm">
        <div class="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
          <span class="material-symbols-outlined text-amber-600 text-base">warning</span>
          <span>ANALISIS FISIOLOGIS: DURASI OLAHRAGA BERLEBIH (+${ex.excessMinutes} MENIT)</span>
        </div>
        <p class="text-xs text-amber-900 leading-relaxed font-medium">${ex.summary}</p>
        
        <div class="space-y-2 pt-1">
          <span class="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">Efek pada Tubuh & Persendian Obesitas:</span>
          ${ex.physiologicalEffects.map(ef => `
            <div class="p-2.5 bg-white/95 rounded-xl border border-amber-200 text-xs shadow-xs">
              <strong class="text-amber-950 block font-bold mb-0.5">${ef.title}</strong>
              <p class="text-slate-600 leading-relaxed text-[11px]">${ef.desc}</p>
            </div>
          `).join('')}
        </div>

        <div class="p-3 bg-white/95 rounded-xl border border-amber-200 shadow-xs">
          <span class="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1.5">Rekomendasi Pemulihan Khusus Durasi Berlebih:</span>
          <ul class="space-y-1 text-xs text-slate-700">
            ${ex.recoveryProtocol.map(rec => `<li class="flex items-start gap-1.5"><span class="text-primary font-bold">•</span><span>${rec}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  resultContainer.innerHTML = `
    <div class="p-4 rounded-2xl border ${bannerBg} mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-white shadow-sm">${badgeText}</span>
        <span class="text-xs font-bold text-primary">Streak +1 🔥</span>
      </div>
      <h4 class="font-bold text-sm mb-1">${diagnosis.riskTitle}</h4>
    </div>

    <div class="space-y-3 mb-4">
      ${excessHTML}
      <h5 class="font-bold text-on-surface text-xs uppercase tracking-wider">Saran Pemulihan & Pencegahan:</h5>
      ${adviceHTML}
      ${stretchHTML}
      ${autoRegHTML}
    </div>

    <button onclick="closePostWorkoutModal()" class="w-full py-3 px-4 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl shadow transition">
      Tutup & Lihat Jadwal Selanjutnya
    </button>
  `;
}

function viewCompletedLog(dayNumber) {
  const log = userLogs.find(l => l.day_number === dayNumber);
  if (!log) {
    alert(`Rekaman untuk hari ke-${dayNumber} telah selesai.`);
    return;
  }
  renderDiagnosticResult({
    riskLevel: log.risk_level,
    riskTitle: log.risk_title || 'Rekaman Latihan Selesai',
    adviceList: log.recommendations || [],
    targetedStretches: log.targeted_stretches || [],
    autoRegulationApplied: log.auto_regulation_applied,
    autoRegulationMessage: 'Jadwal telah disesuaikan berdasarkan rekaman respon fisik Anda.'
  });
  document.getElementById('post-workout-modal').classList.remove('hidden');
}

/**
 * 10. Render Riwayat Logbook di Tab Kesehatan
 */
function renderHealthLogHistory() {
  const container = document.getElementById('health-logs-history-list');
  if (!container) return;

  if (!userLogs || userLogs.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-outline bg-surface-container rounded-2xl border border-outline-variant/30">
        <span class="material-symbols-outlined text-3xl mx-auto mb-2 opacity-50 block text-primary">assignment_turned_in</span>
        <p class="text-xs">Belum ada rekaman latihan. Selesaikan sesi olahraga pertama Anda untuk melihat analisa kesehatan.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = userLogs.map(log => {
    let badgeColor = 'bg-primary/10 text-primary border-primary/20';
    if (log.risk_level === 'yellow') badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    if (log.risk_level === 'red') badgeColor = 'bg-error-container text-on-error-container border-error/30';

    return `
      <div class="p-4 glass-card rounded-2xl">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h5 class="font-bold text-on-surface text-sm">Hari ke-${log.day_number} (${log.actual_duration_mins} Menit)</h5>
            <span class="text-[11px] text-outline">${new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${badgeColor}">
            ${log.risk_level.toUpperCase()}
          </span>
        </div>
        <div class="flex gap-4 text-xs text-on-surface-variant mb-2">
          <span>Tingkat Kelelahan: <strong>${log.rpe_fatigue_level}/10 (Borg)</strong></span>
          ${log.avg_heart_rate ? `<span>Detak Jantung: <strong>${log.avg_heart_rate} bpm</strong></span>` : ''}
        </div>
        ${log.reported_symptoms && log.reported_symptoms.length > 0 ? `
          <div class="text-[11px] text-on-surface-variant bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
            <strong>Gejala yang dilaporkan:</strong> ${log.reported_symptoms.join(', ')}
          </div>
        ` : '<div class="text-[11px] text-primary flex items-center gap-1"><span class="material-symbols-outlined text-xs">check_circle</span> Tidak ada keluhan sendi atau pernapasan berat.</div>'}
      </div>
    `;
  }).join('');
}

/**
 * 11. Render Tab Diet & Puasa Intermiten
 */
function renderDietTab() {
  if (!currentUser) return;
  const nutrition = HealthModels.calculateNutritionPlan(currentUser);

  document.getElementById('stat-bmr').textContent = `${nutrition.bmr} kkal`;
  document.getElementById('stat-tdee').textContent = `${nutrition.tdee} kkal`;
  document.getElementById('stat-target-calories').textContent = `${nutrition.targetCalories} kkal`;

  document.getElementById('stat-protein-g').textContent = `${nutrition.proteinGrams}g`;
  document.getElementById('stat-carbs-g').textContent = `${nutrition.carbGrams}g`;
  document.getElementById('stat-fat-g').textContent = `${nutrition.fatGrams}g`;

  document.getElementById('plate-veggies').textContent = nutrition.plateModel.veggiesAndFiber;
  document.getElementById('plate-protein').textContent = nutrition.plateModel.leanProtein;
  document.getElementById('plate-carbs').textContent = nutrition.plateModel.complexCarbs;

  document.getElementById('fasting-protocol-title').textContent = nutrition.fastingDetails.name;
  document.getElementById('fasting-schedule-advice').textContent = nutrition.fastingDetails.scheduleAdvice;
  if (nutrition.fastingDetails.workoutSync) {
    document.getElementById('fasting-workout-sync').textContent = nutrition.fastingDetails.workoutSync;
    document.getElementById('fasting-sync-container').classList.remove('hidden');
  } else {
    document.getElementById('fasting-sync-container').classList.add('hidden');
  }

  initFastingClock();
}

/**
 * 12. Fasting Clock Engine
 */
let fastingState = {
  isFasting: true,
  hoursElapsed: 8.5,
  targetHours: 16
};

function initFastingClock() {
  const protocol = currentUser ? currentUser.fasting_protocol : '16_8';
  if (protocol === '14_10') fastingState.targetHours = 14;
  else if (protocol === '16_8') fastingState.targetHours = 16;
  else fastingState.targetHours = 12;

  updateFastingClockUI();
}

function updateFastingClockUI() {
  const pct = Math.min(100, (fastingState.hoursElapsed / fastingState.targetHours) * 100);
  const offset = 283 - (283 * pct) / 100;
  
  const circle = document.getElementById('fasting-progress-circle');
  if (circle) circle.style.strokeDashoffset = offset;

  const hoursDisplay = document.getElementById('fasting-time-elapsed');
  if (hoursDisplay) {
    const hours = Math.floor(fastingState.hoursElapsed);
    const mins = Math.round((fastingState.hoursElapsed - hours) * 60);
    hoursDisplay.textContent = `${hours}j ${mins}m`;
  }

  const phaseTag = document.getElementById('fasting-phase-tag');
  if (phaseTag) {
    if (fastingState.hoursElapsed >= 12) {
      phaseTag.textContent = '🔥 Fase Pembakaran Lemak & Sensitivitas Insulin Tinggi';
      phaseTag.className = 'text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300';
    } else {
      phaseTag.textContent = '🌿 Fase Penurunan Gula Darah & Pencernaan Beristirahat';
      phaseTag.className = 'text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300';
    }
  }
}

function toggleFastingMode() {
  fastingState.isFasting = !fastingState.isFasting;
  const btn = document.getElementById('toggle-fasting-btn');
  if (fastingState.isFasting) {
    btn.textContent = 'Selesaikan Puasa & Buka Jendela Makan';
    btn.className = 'w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition';
  } else {
    btn.textContent = 'Mulai Jendela Puasa Sekarang';
    btn.className = 'w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition';
  }
}

/**
 * 13. Water Intake Tracker & WebGL Wave Shader
 */
let hydrationShaderState = {
  gl: null,
  prog: null,
  uTime: null,
  uRes: null,
  uFillLevel: null,
  canvas: null,
  fillLevel: 0.1,
  animId: null
};

function initHydrationShader() {
  const canvas = document.getElementById('shader-canvas-hydration');
  if (!canvas) return;

  function syncSize() {
    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 300;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_fillLevel;

void main() {
    vec2 uv = v_texCoord;
    float fill = clamp(u_fillLevel, 0.08, 0.92);
    
    // Wave ripple math matching Vitality Flow shader
    float wave = sin(uv.x * 12.0 + u_time * 2.5) * 0.022 + cos(uv.x * 6.0 - u_time * 1.5) * 0.012;
    float waterLine = fill + wave;
    
    vec3 waterColor = vec3(0.0, 0.42, 0.38); // Vitality Teal (#006a61)
    vec3 lightWater = vec3(0.52, 0.95, 0.89); // Secondary Container (#86f2e4)
    
    float dist = waterLine - uv.y;
    vec3 surfaceColor = vec3(0.96, 0.98, 0.96);
    vec3 waveColor = mix(waterColor, lightWater, clamp(uv.y / max(0.01, fill), 0.0, 1.0));
    
    vec3 finalColor = mix(surfaceColor, waveColor, smoothstep(0.0, 0.015, dist));
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uFillLevel = gl.getUniformLocation(prog, 'u_fillLevel');

  hydrationShaderState = {
    gl,
    prog,
    uTime,
    uRes,
    uFillLevel,
    canvas,
    fillLevel: hydrationShaderState.fillLevel || 0.1,
    animId: null
  };

  function render(t) {
    if (!document.getElementById('shader-canvas-hydration')) return;
    syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uFillLevel) gl.uniform1f(uFillLevel, hydrationShaderState.fillLevel);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    hydrationShaderState.animId = requestAnimationFrame(render);
  }

  if (hydrationShaderState.animId) cancelAnimationFrame(hydrationShaderState.animId);
  render(0);
}

async function addWaterIntake(amountMl) {
  if (!currentHabits) return;
  currentHabits.water_intake_ml = (currentHabits.water_intake_ml || 0) + amountMl;
  await dbService.saveDailyHabits(currentUser.access_code, currentHabits);
  renderAnalyticsTab();
}

function resetWaterIntake() {
  if (!currentHabits) return;
  currentHabits.water_intake_ml = 0;
  dbService.saveDailyHabits(currentUser.access_code, currentHabits);
  renderAnalyticsTab();
}

/**
 * 14. Render Tab Analytics & Chart.js
 */
function renderAnalyticsTab() {
  if (!currentUser) return;

  // Water Display
  const currentWater = currentHabits ? (currentHabits.water_intake_ml || 0) : 0;
  const targetWater = 2500;
  document.getElementById('water-intake-current').textContent = `${(currentWater / 1000).toFixed(1)} L`;
  const waterPct = Math.min(100, Math.round((currentWater / targetWater) * 100));
  const waterBar = document.getElementById('water-progress-bar');
  if (waterBar) waterBar.style.width = `${waterPct}%`;

  // Update WebGL Shader Wave Level
  hydrationShaderState.fillLevel = Math.max(0.08, Math.min(0.92, (currentWater / targetWater) * 0.8 + 0.1));
  initHydrationShader();

  // Render Chart
  renderWeightChart();
}

function renderWeightChart() {
  const ctx = document.getElementById('weightProgressChart');
  if (!ctx) return;

  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  const startWeight = parseFloat(currentUser.start_weight);
  const currentWeight = parseFloat(currentUser.current_weight);
  const targetWeight = parseFloat(currentUser.target_weight);

  // Label mingguan
  const months = currentUser.program_duration_months || 1;
  const totalWeeks = months * 4;
  const labels = ['Awal'];
  const dataPoints = [startWeight];
  const targetTrend = [startWeight];

  const weeklyStep = (startWeight - targetWeight) / totalWeeks;

  for (let w = 1; w <= totalWeeks; w++) {
    labels.push(`Mgg ${w}`);
    targetTrend.push(parseFloat((startWeight - (weeklyStep * w)).toFixed(1)));
    if (w === 1) {
      dataPoints.push(currentWeight);
    } else {
      dataPoints.push(null);
    }
  }

  weightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Berat Aktual (kg)',
          data: dataPoints,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#059669'
        },
        {
          label: 'Target Penurunan Realistis (kg)',
          data: targetTrend,
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          fill: false,
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' } }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'Berat Badan (kg)' },
          grid: { color: '#f1f5f9' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * 15. Modal Update Berat Badan & Evaluasi Bulanan
 */
function openWeightUpdateModal() {
  document.getElementById('new-weight-input').value = currentUser.current_weight;
  document.getElementById('weight-update-modal').classList.remove('hidden');
}

function closeWeightUpdateModal() {
  document.getElementById('weight-update-modal').classList.add('hidden');
}

async function submitWeightUpdate(e) {
  e.preventDefault();
  const newWeight = parseFloat(document.getElementById('new-weight-input').value);
  if (isNaN(newWeight) || newWeight <= 20) {
    alert('Mohon masukkan angka berat badan yang valid.');
    return;
  }

  currentUser.current_weight = newWeight;
  // Hitung ulang BMI
  const bmiResult = HealthModels.calculateBMI(newWeight, currentUser.height);
  currentUser.bmi = bmiResult.bmi;
  currentUser.obesity_category = bmiResult.category;

  await dbService.saveUserProfile(currentUser);
  closeWeightUpdateModal();
  updateHeaderProfile();
  renderAnalyticsTab();
  renderDietTab();
  celebrateStreak();
  alert(`✓ Berat badan berhasil diperbarui ke ${newWeight} kg (BMI: ${bmiResult.bmi})!`);
}

/**
 * 16. Onboarding & Registration Wizard
 */
let onboardingStep = 1;
let tempOnboardingData = {};

function startRegistration() {
  onboardingStep = 1;
  tempOnboardingData = {};
  showOnboardingStep(1);
  
  const today = new Date();
  const dateInput = document.getElementById('reg-start-date');
  if (dateInput) {
    dateInput.value = today.toISOString().split('T')[0];
  }
  const helper = document.getElementById('reg-start-date-helper');
  if (helper) {
    helper.textContent = `Hari ke-1 dimulai Hari Ini: ${today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
  }

  document.getElementById('login-box').classList.add('hidden');
  document.getElementById('onboarding-box').classList.remove('hidden');
}

function onStartTimingChange(e) {
  const timing = e.target.value;
  const dateInput = document.getElementById('reg-start-date');
  const helper = document.getElementById('reg-start-date-helper');
  const today = new Date();
  
  if (timing === 'today') {
    dateInput.value = today.toISOString().split('T')[0];
    if (helper) helper.textContent = `Hari ke-1 dimulai Hari Ini: ${today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
  } else if (timing === 'tomorrow') {
    const tomorrow = new Date(today.getTime() + 86400000);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    if (helper) helper.textContent = `Hari ke-1 dimulai Besok: ${tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
  } else if (timing === 'next_monday') {
    const day = today.getDay();
    const diff = (day === 0 ? 1 : 8 - day);
    const nextMon = new Date(today.getTime() + diff * 86400000);
    dateInput.value = nextMon.toISOString().split('T')[0];
    if (helper) helper.textContent = `Hari ke-1 dimulai Hari Senin Depan: ${nextMon.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
  } else {
    if (helper) helper.textContent = 'Pilih tanggal mulai yang Anda kehendaki pada pemilih tanggal di samping.';
  }
}

function backToLogin() {
  document.getElementById('onboarding-box').classList.add('hidden');
  document.getElementById('login-box').classList.remove('hidden');
}

function showOnboardingStep(step) {
  onboardingStep = step;
  document.querySelectorAll('.onboarding-step-pane').forEach(p => p.classList.add('hidden'));
  const targetPane = document.getElementById(`onboarding-step-${step}`);
  if (targetPane) targetPane.classList.remove('hidden');

  // Update progress dots
  document.querySelectorAll('.step-dot').forEach((dot, idx) => {
    if (idx + 1 <= step) {
      dot.classList.add('bg-emerald-600', 'text-white');
      dot.classList.remove('bg-slate-200', 'text-slate-500');
    } else {
      dot.classList.remove('bg-emerald-600', 'text-white');
      dot.classList.add('bg-slate-200', 'text-slate-500');
    }
  });
}

function processStep1() {
  const name = document.getElementById('reg-name').value.trim();
  const age = parseInt(document.getElementById('reg-age').value);
  const gender = document.getElementById('reg-gender').value;
  const height = parseFloat(document.getElementById('reg-height').value);
  const weight = parseFloat(document.getElementById('reg-weight').value);
  const waist = document.getElementById('reg-waist').value ? parseFloat(document.getElementById('reg-waist').value) : null;
  const startDateInput = document.getElementById('reg-start-date');
  const startDateVal = startDateInput && startDateInput.value ? startDateInput.value : new Date().toISOString().split('T')[0];

  if (!name || isNaN(age) || isNaN(height) || isNaN(weight)) {
    alert('Mohon lengkapi semua data wajib pada formulir.');
    return;
  }

  tempOnboardingData.name = name;
  tempOnboardingData.age = age;
  tempOnboardingData.gender = gender;
  tempOnboardingData.height = height;
  tempOnboardingData.start_weight = weight;
  tempOnboardingData.current_weight = weight;
  tempOnboardingData.waist_circumference = waist;
  tempOnboardingData.program_start_date = startDateVal;

  // Hitung BMI & Kategori Obesitas
  const bmiResult = HealthModels.calculateBMI(weight, height);
  tempOnboardingData.bmi = bmiResult.bmi;
  tempOnboardingData.obesity_category = bmiResult.category;

  // Tampilkan di Step 2
  document.getElementById('display-step2-bmi').textContent = bmiResult.bmi;
  document.getElementById('display-step2-category').textContent = bmiResult.category;
  document.getElementById('display-step2-desc').textContent = bmiResult.description;
  document.getElementById('display-step2-ideal-range').textContent = `${bmiResult.idealWeightMin} - ${bmiResult.idealWeightMax} kg (Rekomendasi Sehat: ${bmiResult.idealWeightMid} kg)`;

  // Default target berat badan
  document.getElementById('reg-target-weight').value = bmiResult.idealWeightMid;

  showOnboardingStep(2);
  checkFeasibilityRealtime();
}

function checkFeasibilityRealtime() {
  const startWeight = tempOnboardingData.start_weight;
  const targetWeight = parseFloat(document.getElementById('reg-target-weight').value);
  const durationMonths = parseInt(document.getElementById('reg-duration-months').value);
  const height = tempOnboardingData.height;

  if (isNaN(targetWeight) || isNaN(durationMonths)) return;

  const evalResult = HealthModels.evaluateWeightGoal(startWeight, targetWeight, height, durationMonths);
  const alertContainer = document.getElementById('feasibility-alert-container');

  if (evalResult.status === 'unrealistic') {
    let warningListHTML = evalResult.medicalWarnings.map(w => `<li>${w}</li>`).join('');
    let solutionHTML = '';

    if (evalResult.smartSolutions && evalResult.smartSolutions.optionA) {
      const optA = evalResult.smartSolutions.optionA;
      const optB = evalResult.smartSolutions.optionB;
      solutionHTML = `
        <div class="mt-3 pt-3 border-t border-rose-200">
          <p class="text-xs font-bold text-rose-900 mb-2">💡 Rekomendasi Solusi Medis Realistis:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button type="button" onclick="applySmartOptionA(${optA.suggestedTarget})" class="p-2.5 text-left bg-white hover:bg-rose-50 border border-rose-300 rounded-xl transition">
              <span class="text-xs font-bold text-rose-800 block">${optA.title}</span>
              <span class="text-[11px] text-slate-600 block">Turunkan ke <strong>${optA.suggestedTarget} kg</strong> (${optA.weeklyRate})</span>
            </button>
            <button type="button" onclick="applySmartOptionB(${optB.suggestedMonths})" class="p-2.5 text-left bg-white hover:bg-rose-50 border border-rose-300 rounded-xl transition">
              <span class="text-xs font-bold text-rose-800 block">${optB.title}</span>
              <span class="text-[11px] text-slate-600 block">Perpanjang Waktu ke <strong>${optB.suggestedMonths} Bulan</strong></span>
            </button>
          </div>
        </div>
      `;
    }

    alertContainer.innerHTML = `
      <div class="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl">
        <div class="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
          <i data-lucide="alert-triangle" class="w-5 h-5"></i>
          <span>${evalResult.statusTitle}</span>
        </div>
        <p class="text-xs text-rose-700 leading-relaxed mb-2">${evalResult.message}</p>
        <ul class="list-disc list-inside text-xs text-rose-800 space-y-1 mb-2">
          ${warningListHTML}
        </ul>
        ${solutionHTML}
      </div>
    `;
    alertContainer.classList.remove('hidden');
    initLucideIcons();
  } else if (evalResult.status === 'challenging') {
    alertContainer.innerHTML = `
      <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs">
        <strong>${evalResult.statusTitle}:</strong> ${evalResult.message}
      </div>
    `;
    alertContainer.classList.remove('hidden');
  } else {
    alertContainer.innerHTML = `
      <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
        <span><strong>${evalResult.statusTitle}:</strong> ${evalResult.message}</span>
      </div>
    `;
    alertContainer.classList.remove('hidden');
    initLucideIcons();
  }
}

function applySmartOptionA(newTarget) {
  const input = document.getElementById('reg-target-weight');
  if (input) {
    input.value = newTarget;
    input.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-50');
    setTimeout(() => {
      input.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-50');
    }, 1000);
  }
  checkFeasibilityRealtime();
}

function applySmartOptionB(newMonths) {
  const select = document.getElementById('reg-duration-months');
  if (select) {
    let optionExists = false;
    for (let i = 0; i < select.options.length; i++) {
      if (parseInt(select.options[i].value) === parseInt(newMonths)) {
        optionExists = true;
        break;
      }
    }
    if (!optionExists) {
      const newOpt = document.createElement('option');
      newOpt.value = newMonths;
      newOpt.textContent = `${newMonths} Bulan (${newMonths * 4} Minggu - Program Realistis)`;
      select.appendChild(newOpt);
    }
    select.value = newMonths;
    select.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-50');
    setTimeout(() => {
      select.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-50');
    }, 1000);
  }
  checkFeasibilityRealtime();
}

function processStep2() {
  const targetWeight = parseFloat(document.getElementById('reg-target-weight').value);
  const durationMonths = parseInt(document.getElementById('reg-duration-months').value);

  if (isNaN(targetWeight) || isNaN(durationMonths)) {
    alert('Mohon masukkan target berat badan dan pilihan durasi.');
    return;
  }

  // Cek jika masih ekstrem tidak realistis
  const evalResult = HealthModels.evaluateWeightGoal(tempOnboardingData.start_weight, targetWeight, tempOnboardingData.height, durationMonths);
  if (evalResult.status === 'unrealistic') {
    if (!confirm('Target Anda dinilai berbahaya secara medis oleh sistem karena melampaui batas fisiologi tubuh. Apakah Anda yakin tetap ingin melanjutkan atau ingin memilih rekomendasi realistis kami?')) {
      return;
    }
  }

  tempOnboardingData.target_weight = targetWeight;
  tempOnboardingData.program_duration_months = durationMonths;

  showOnboardingStep(3);
}

async function finalizeRegistration() {
  const submitBtn = document.querySelector('button[onclick="finalizeRegistration()"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="animate-pulse">Sedang Menyusun Program...</span>';
  }

  try {
    const fitnessEl = document.querySelector('input[name="reg-fitness-level"]:checked');
    const fitnessLevel = fitnessEl ? fitnessEl.value : 'level_0';

    // Selector aman untuk diet model (hidden atau radio)
    const dietEl = document.querySelector('input[name="reg-diet-model"]:checked') || document.querySelector('input[name="reg-diet-model"]');
    const dietModel = dietEl ? dietEl.value : 'deficit_moderate';

    const fastingEl = document.querySelector('input[name="reg-fasting-protocol"]:checked');
    const fastingProtocol = fastingEl ? fastingEl.value : '16_8';

    tempOnboardingData.fitness_level = fitnessLevel;
    tempOnboardingData.diet_model = dietModel;
    tempOnboardingData.fasting_protocol = fastingProtocol;
    tempOnboardingData.access_code = dbService.generateAccessCode();
    tempOnboardingData.current_streak = 0;
    tempOnboardingData.longest_streak = 0;

    // Tampilkan Kode Akses di Modal Penutup Onboarding
    const codeDisplay = document.getElementById('display-new-access-code');
    if (codeDisplay) {
      codeDisplay.textContent = tempOnboardingData.access_code;
    }
    
    // Simpan ke Supabase & LocalStorage
    currentUser = await dbService.saveUserProfile(tempOnboardingData);
    
    // Buat Jadwal Lengkap
    const schedules = HealthModels.generateProgramSchedules(currentUser);
    await dbService.saveSchedules(currentUser.access_code, schedules);
    userSchedules = schedules;

    // Pindah ke Step 4 (Tampilan Kode Akses Berhasil)
    showOnboardingStep(4);
    celebrateStreak();
    initLucideIcons();
  } catch (err) {
    console.error('Error during finalizeRegistration:', err);
    alert('Terjadi kendala saat membuat program: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i><span>Buat Kode Akses & Program Saya</span>';
      initLucideIcons();
    }
  }
}

function finishOnboardingAndEnterApp() {
  showMainApp();
}

/**
 * 17. Login dengan Kode Akses
 */
async function loginWithCode(e) {
  e.preventDefault();
  const codeInput = document.getElementById('login-access-code-input').value.trim();
  if (!codeInput) {
    alert('Mohon masukkan Kode Akses Anda.');
    return;
  }

  const btn = document.getElementById('login-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Memeriksa Kode...';

  const user = await dbService.getUserProfile(codeInput);
  btn.disabled = false;
  btn.textContent = 'Masuk ke Akun';

  if (user) {
    currentUser = user;
    await loadUserData();
    showMainApp();
  } else {
    alert(`Kode Akses "${codeInput}" tidak ditemukan di database maupun penyimpanan lokal. Silakan buat akun baru jika belum memiliki kode.`);
  }
}

/**
 * 18. Quick Demo User Setup
 */
async function loadDemoUser() {
  const demoCode = 'OBE-DEMO';
  const demoData = {
    access_code: demoCode,
    name: 'Budi Santoso',
    age: 34,
    gender: 'male',
    height: 170,
    start_weight: 96,
    current_weight: 94.5,
    target_weight: 75,
    waist_circumference: 104,
    bmi: 33.2,
    obesity_category: 'Obesitas Tingkat 2 (Class II - Berat)',
    program_duration_months: 3,
    fitness_level: 'level_0',
    diet_model: 'deficit_moderate',
    fasting_protocol: '16_8',
    current_streak: 4,
    longest_streak: 4
  };

  currentUser = await dbService.saveUserProfile(demoData);
  const schedules = HealthModels.generateProgramSchedules(currentUser);
  // Buat beberapa hari pertama sudah selesai untuk demo
  schedules[0].is_completed = true;
  schedules[1].is_completed = true;
  schedules[2].is_completed = true;
  schedules[3].is_completed = true;
  schedules[4].is_locked = false; // Hari ke-5 aktif
  await dbService.saveSchedules(demoCode, schedules);

  await loadUserData();
  showMainApp();
}

/**
 * 19. Copy Access Code Helper
 */
function copyAccessCode() {
  if (!currentUser) return;
  navigator.clipboard.writeText(currentUser.access_code).then(() => {
    alert(`✓ Kode Akses ${currentUser.access_code} berhasil disalin! Simpan kode ini untuk login di perangkat lain.`);
  });
}

function userLogout() {
  if (confirm('Apakah Anda ingin keluar dari akun? Pastikan Anda sudah mencatat Kode Akses Anda.')) {
    dbService.logout();
    currentUser = null;
    showAuthScreen();
  }
}

/**
 * 20. Celebration Animation
 */
function celebrateStreak() {
  if (window.confetti) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

/**
 * 21. Event Listeners Setup
 */
function setupEventListeners() {
  // RPE Slider label change
  const rpeSlider = document.getElementById('post-rpe-input');
  if (rpeSlider) {
    rpeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      const display = document.getElementById('rpe-value-display');
      const descriptions = {
        1: '1 - Sangat Ringan (Bisa bernyanyi)',
        2: '2 - Ringan (Napas sangat santai)',
        3: '3 - Nyaman (Bisa mengobrol lancar)',
        4: '4 - Mulai Hangat (Sedikit berkeringat)',
        5: '5 - Cukup Melelahkan (Bisa bicara pendek)',
        6: '6 - Berat Moderat (Napas mulai dalam)',
        7: '7 - Berat (Hanya bisa bicara 1-2 kata)',
        8: '8 - Sangat Berat (Napas terengah-engah)',
        9: '9 - Mendekati Batas Maksimal (Sangat lelah)',
        10: '10 - Kelelahan Ekstrem Maksimal'
      };
      if (display) display.textContent = descriptions[val] || `${val}/10`;
    });
  }

  // Real-time Feasibility Inputs
  const targetWeightInput = document.getElementById('reg-target-weight');
  const durationSelect = document.getElementById('reg-duration-months');
  if (targetWeightInput) targetWeightInput.addEventListener('input', checkFeasibilityRealtime);
  if (durationSelect) durationSelect.addEventListener('change', checkFeasibilityRealtime);
}
