# 🏃‍♂️ OBESITY TO INFINITY
### *Walk-to-Run Progressive Habit Tracker, Clinical Health Diagnostic, & Nutrition/Fasting Engine*

Aplikasi web modern yang dirancang khusus untuk mendampingi penyandang obesitas menurunkan berat badan ke rentang ideal secara bertahap, aman bagi persendian, dan berkelanjutan.

---

## 🌟 3 Pilar Utama Aplikasi

### 1. 📅 Penjadwalan Olahraga Adaptif & Uji Kelayakan Target Realistis
- **Kalkulator BMI & Klasifikasi Obesitas WHO Asia-Pasifik**: Menentukan kategori obesitas ($<18.5$ Underweight, $18.5-22.9$ Normal, $23-24.9$ Overweight, $25-29.9$ Obesitas I, $\ge 30$ Obesitas II).
- **Engine Kelayakan Target (Clinical Reality Checker)**: Menguji apakah target penurunan berat badan pengguna realistis ($0.5 - 1.0\text{ kg/minggu}$). Jika target dinilai berbahaya/ekstrem ($>1.2\text{ kg/minggu}$), sistem memicu **Medical Warning Alert** dan memberikan 2 solusi koreksi otomatis:
  1. *Opsi A*: Menyesuaikan target berat badan yang aman untuk durasi tersebut.
  2. *Opsi B*: Memperpanjang durasi waktu yang sehat untuk mencapai target tersebut.
- **Peta Target Mingguan (Weekly Milestone Roadmap)**: Kalender dari Minggu ke-1 (awal bulan) hingga Minggu terakhir (akhir program) dengan tema adaptasi bertahap (*Gentle Walk &rarr; Brisk Walk &rarr; Walk-Jog Interval &rarr; Steady Jogging*).
- **Mekanisme Streak & Catch-Up Lock**: Hari berikutnya terkunci jika sesi latihan kardio penting sebelumnya belum diselesaikan, mencegah cedera sendi akibat lonjakan volume mendadak.
- **Tombol Swap Low-Impact ("Lutut/Sendi Lelah")**: Mengalihkan latihan ke versi ramah lutut jika sendi terasa lelah.

### 2. 🩺 Analisis Pasca Latihan & Deteksi Dini Risiko Kesehatan
- Setelah selesai berolahraga, pengguna menginput data aktual (durasi, RPE kelelahan skala 1–10, detak jantung opsional, dan checklist gejala fisik).
- **Triase Gejala Medis**:
  - 🟢 **Zona Aman**: Beban sesuai kapasitas &rarr; saran hidrasi dan nutrisi pemulihan normal.
  - 🟡 **Zona Perhatian (Deteksi Dini Overuse Sendi / Dehidrasi)**: Saran metode RICE (kompres dingin), peregangan spesifik, dan **Auto-Regulation** (sistem otomatis memperingan jadwal besok menjadi *Active Recovery Walk*).
  - 🔴 **Zona Red Flag (Peringatan Medis)**: Deteksi gejala sesak napas berat >10 menit / nyeri dada / pusing hebat &rarr; instruksi darurat & *lockdown* latihan intensif selama 48 jam.

### 3. 🥗 Pemodelan Diet & Puasa Intermiten (Diet & Fasting Engine)
- **Kalkulator BMR & TDEE**: Menghitung kebutuhan energi dan target defisit kalori moderat ($300 - 500\text{ kkal/hari}$).
- **Panduan Piring Sehat (Plate Model)**: Visualisasi porsi $\frac{1}{2}$ sayur/serat, $\frac{1}{4}$ protein berkualitas, $\frac{1}{4}$ karbohidrat kompleks.
- **Pelacak Jendela Puasa (Fasting Clock Ring)**: Visual jam interaktif untuk protokol 14:10 dan 16:8 dengan indikator fase autofagi & pembakaran lemak.
- **Sinkronisasi Waktu Olahraga vs Puasa/Makan**: Panduan waktu terbaik berjalan kaki agar tidak mual (*acid reflux*) atau lemas (*hypoglycemia*).
- **Pencegahan Post-Workout Binge Eating**: Tips meredam nafsu makan berlebih pasca olahraga.

---

## 🔑 Sistem Autentikasi Kode Akses (Access Code)

Aplikasi ini menggunakan sistem **Kode Akses Unik** (contoh: `OBE-8924`):
1. **Pengguna Baru**: Menekan tombol *"Buat Akun & Skrining Baru"*, mengisi data fisik dan target. Sistem otomatis men-generate Kode Akses unik.
2. **Pengguna Lama**: Cukup memasukkan Kode Akses untuk memulihkan seluruh progres, streak, jadwal kalender, dan logbook kesehatan.
3. **Mode Demo Cepat**: Disediakan tombol *"Coba Mode Demo Cepat"* (`OBE-DEMO`) untuk melihat langsung tampilan aplikasi yang sudah berjalan.

---

## 🗄️ Sinkronisasi Backend Supabase

Aplikasi dilengkapi modul hybrid:
- **Supabase REST API** untuk sinkronisasi data cloud.
- **LocalStorage Fallback** otomatis sehingga aplikasi tetap berfungsi cepat dan stabil secara offline.

### Menyiapkan Database Supabase:
1. Buka dashboard proyek Supabase Anda: `https://supabase.com/dashboard/project/sgvynqlwnukphnccencd`
2. Buka menu **SQL Editor**.
3. Buka file `supabase_schema.sql` di proyek ini, salin seluruh isinya, dan jalankan (*Run*) di Supabase SQL Editor.
4. Tabel `obesity_users`, `workout_schedules`, `post_workout_logs`, dan `daily_habits` akan dibuat otomatis beserta kebijakan keamanannya.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dibangun murni menggunakan **HTML5, Modern CSS, dan Vanilla JavaScript (ES6+)** tanpa perlu build tool yang rumit:

1. Cukup buka file `index.html` langsung di browser favorit Anda (Google Chrome, Edge, Safari, Firefox), ATAU
2. Buka proyek ini di VS Code dan gunakan ekstensi **Live Server**.
