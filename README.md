# 🧠 Kraepelin Test Pro (Web-Based Cognitive Assessment)

🔗 **Live Demo**  
https://cerminsiji.github.io/Kraepelin-Test/

---

## 📌 Overview
**Kraepelin Test Pro** adalah aplikasi berbasis web yang mensimulasikan **Tes Kraepelin (Pauli Test)** — sebuah metode psikotes klasik yang digunakan untuk mengukur:

- Kecepatan kerja (work speed)
- Ketelitian (accuracy)
- Konsistensi (stability)
- Daya tahan mental (endurance / fatigue)
- Kontrol impuls (impulse control)

Aplikasi ini dirancang menyerupai **standar psikotes perusahaan (HR assessment)** dengan pengalaman yang cepat, sederhana, dan responsif.

---

## ⚙️ How It Works
Pengguna akan diberikan operasi penjumlahan sederhana:

Contoh:
9 + 6 = 15 → Jawaban: 5 
8 + 7 = 15 → Jawaban: 5

### Aturan:
- Angka selalu antara **0 – 9**
- Hasil penjumlahan bisa > 9
- Jawaban yang dimasukkan adalah **angka satuan (%10)**
- Tekan **ENTER** untuk submit dan lanjut ke soal berikutnya

---

## ✨ Key Features

### 🧪 Core Test Engine
- Continuous addition (stream-based)
- Real Kraepelin logic (bukan per kolom statis)
- Fast-paced interaction (keyboard-driven)

### ⚡ Performance Tracking
- Total answered questions (speed)
- Accuracy rate (% correct)
- Reaction time (ms)
- Fatigue analysis (early vs late performance)

### 💾 Persistence System
- Auto-save menggunakan **localStorage**
- Resume test setelah refresh / keluar
- Tidak kehilangan progress saat gangguan koneksi

### 📱 User Experience
- Mobile-friendly design
- Minimalist & distraction-free UI
- Instant input (tanpa klik tombol)

### 🧠 Psychological Insight
- Klasifikasi performa:
  - High Performer
  - Stable Performer
  - Impulsive
  - Easily Fatigued

---

## 🚀 Getting Started

### 1. Run Locally
```bash
git clone https://github.com/your-username/kraepelin-test.git
cd kraepelin-test
