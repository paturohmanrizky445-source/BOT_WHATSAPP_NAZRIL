# INSTALLATION & SETUP GUIDE

## 📥 Instalasi Bot

### 1. Clone Repository
```bash
git clone https://github.com/paturohmanrizky445-source/BOT_WHATSAPP_NAZRIL.git
cd BOT_WHATSAPP_NAZRIL
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

### 4. Jalankan Bot
```bash
npm start
```

Atau dengan nodemon (untuk development):
```bash
npm run dev
```

---

## 🔧 Konfigurasi

### 1. Edit .env File
```env
BOT_NAME=Nazril-Bot
BOT_VERSION=6.0.0
BOT_PREFIX=.!/#
OWNER_NUMBER=62xxxxxxxxxxx
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
```

### 2. Edit config/settings.json
Sesuaikan pengaturan bot sesuai kebutuhan Anda

---

## 🚀 Menjalankan Bot

### Mode Development
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

### Dengan PM2
```bash
pm2 start src/index.js --name "nazril-bot"
pm2 save
```

---

## 📱 QR Code Scanning

1. Jalankan bot dengan `npm start`
2. QR code akan ditampilkan di terminal
3. Buka WhatsApp di HP Anda
4. Pergi ke Settings > Linked Devices
5. Scan QR code yang ditampilkan
6. Tunggu sampai bot terhubung

---

## 🎮 Menggunakan Perintah

### Format Dasar
```
<prefix><command> [arguments]
```

### Contoh Penggunaan
```
.menu              - Tampilkan menu utama
.ping              - Tes kecepatan bot
.gpt Apa itu AI    - Tanya ke ChatGPT
.tiktok <url>      - Download TikTok
!alive             - Status bot
/settings          - Lihat pengaturan
#broadcast hello   - Kirim broadcast
```

---

## 🔐 Owner Only Commands

Hanya owner yang bisa menggunakan perintah ini:

```
.broadcast         - Kirim broadcast
.maintenance on/off - Mode maintenance
.settings          - Pengaturan bot
.update            - Update bot
.reload            - Reload bot
.sudo <cmd>        - Execute command
```

---

## ⚙️ Auto Features

Mengaktifkan/menonaktifkan auto features:

```
.autoread on       - Aktifkan auto read
.autoread off      - Nonaktifkan auto read
.autoreply on      - Aktifkan auto reply
.autotyping on     - Aktifkan auto typing
```

---

## 🛠️ Troubleshooting

### Bot tidak terhubung
- Pastikan internet stabil
- Restart bot: `npm start`
- Hapus folder `session` dan scan ulang QR code

### Command tidak bekerja
- Periksa prefix (. ! / #)
- Pastikan Anda owner atau akses diizinkan
- Lihat status command: `.listcmd`

### Error EACCES
```bash
sudo chown -R $USER:$USER .
```

---

## 📚 Dokumentasi Lengkap

Lihat file berikut untuk informasi lebih:
- `README.md` - Pengenalan bot
- `FEATURES.md` - Daftar lengkap fitur
- `config/commands-status.json` - Status command

---

## 📞 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Hubungi owner

---

**Happy Coding! 🚀**
