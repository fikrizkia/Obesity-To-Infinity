# 🚀 Panduan Deploy Cepat ke Netlify (Obesity to Infinity)

Folder `ready_to_deploy` ini sudah siap 100% untuk diunggah langsung ke **Netlify**.

---

## 📦 Isi Folder `ready_to_deploy`:
1. **`index.html`** – File HTML utama dengan integrasi desain responsif Google Stitch Vitality Flow.
2. **`index_single_file.html`** – Versi *all-in-one standalone* (HTML + CSS + JS inline) jika Anda ingin mengunggah 1 file saja tanpa sub-folder.
3. **`css/styles.css`** – Style sheet responsif (Mobile, Tablet, Laptop, Desktop) dengan safe-area inset dan micro-animations.
4. **`js/`** – Logika aplikasi klinis (`models.js`, `supabase-client.js`, `app.js`).
5. **`_redirects`** – Aturan routing SPA untuk Netlify (`/* /index.html 200`).
6. **`netlify.toml`** – Konfigurasi header keamanan & caching Netlify.

---

## ⚡ Opsi 1: Deploy Instan (Drag & Drop ke Netlify Drop - Paling Mudah)
1. Buka browser dan kunjungi: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Login ke akun Netlify Anda (atau daftar gratis).
3. **Drag & Drop (Tarik dan Lepas)** seluruh folder **`ready_to_deploy`** ke area kotak putus-putus di halaman Netlify Drop.
4. Tunggu ~5–10 detik hingga proses upload selesai.
5. Website Anda **langsung live di internet** dengan URL HTTPS publik (contoh: `https://obesity-to-infinity.netlify.app`)!

---

## 💻 Opsi 2: Deploy melalui Netlify CLI (Terminal)
Jika Anda menggunakan Netlify CLI di terminal/command prompt:
```bash
# 1. Install Netlify CLI (jika belum)
npm install -g netlify-cli

# 2. Masuk ke folder ready_to_deploy
cd "d:/PROYEK MANDIRI/OBESITY TO INFINITY/ready_to_deploy"

# 3. Deploy langsung ke production
netlify deploy --prod --dir=.
```

---

## 📱 Optimasi Responsif Mobile & Laptop yang Disematkan:
* **iOS / Safari Auto-Zoom Fix**: Ukuran font input form otomatis terjaga 16px di layar kecil sehingga tidak merusak layout saat mengetik.
* **Safe-Area Insets (`pb-safe`)**: Tampilan bilah navigasi bawah smartphone menyesuaikan notch dan home indicator iPhone & Android.
* **Zero Horizontal Scroll**: Menggunakan `overflow-x: hidden` dan sistem *fluid grid* untuk semua ukuran layar (320px hingga 4K display).
* **Fluid WebGL Wave Shader**: Kanvas shader air dinamis menyesuaikan ukuran layar secara otomatis menggunakan `ResizeObserver`.
