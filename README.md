# Yalçın Pastaneleri — Full-Stack Satış & Sipariş Platformu

Yalçın Pastaneleri (Osmaniye) için gerçek işletme verilerine dayanan, Apple standartlarında minimal ve premium **Next.js Web Sitesi**, **React Native Mobil Uygulaması** ve **Node.js + PostgreSQL Core API Altyapısı**.

---

## 🏛️ Mimari ve Teknoloji Yığını

- **Monorepo:** npm workspaces (`packages/shared`, `apps/api`, `apps/web`, `apps/mobile`)
- **Web Sitesi:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons
- **Mobil Uygulama:** React Native + TypeScript + Expo
- **Backend API:** Node.js + Fastify + TypeScript + PostgreSQL (`pg`)
- **Veritabanı:** PostgreSQL 16 (İlişkisel şema, transaction-safe, tam sayı kuruş para hesaplama)
- **Bildirimler:** Firebase Cloud Messaging (FCM) işlemsel bildirim servisi
- **Doğrulanmış Varlıklar:** Resmî QR menü (`https://qrmenu.yalcinpastaneleri.com/`) ve Instagram (`@yalcinpastaneleri`) kaynaklı orijinal logo, favicon ve 179 ürün/kategori fotoğrafı.

---

## 📍 Doğrulanmış Şubeler

1. **Raufbey Şubesi (Merkez):**
   - **Adres:** Raufbey Mah. Atatürk Cd. No:308, Osmaniye Merkez
   - **Telefon:** 0544 648 60 40
   - **Konsept:** Pastane, unlu mamuller, geleneksel tatlılar, kahvaltı, paket servis ve gel-al.

2. **Adnan Menderes Şubesi (Kafe & Restoran):**
   - **Adres:** Adnan Menderes Mah. 19524. Sk. No:8, Osmaniye Merkez
   - **Telefon:** 0501 369 00 80
   - **Konsept:** Dünya mutfağı, pizza, burger, ızgara et/tavuk yemekleri, kafe ve pastane.

---

## 🚀 Çalıştırma Talimatları

### 1. Bağımlılıkları Yükleme ve Derleme

```bash
# Monorepo bağımlılıkları
npm install

# Paylaşılan tipleri derleme
npm --workspace=packages/shared run build

# API derleme
npm --workspace=apps/api run build

# Web derleme
npm --workspace=apps/web run build
```

### 2. Veritabanı Migrasyon ve Seed

```bash
# Tabloları oluşturma
npx tsx apps/api/src/db/migrate.ts

# Gerçek 179 ürün ve 19 kategoriyi aktarma
npx tsx apps/api/src/db/seed.ts

# Testleri çalıştırma
npx tsx --test apps/api/test/api.test.ts
```

### 3. Servisleri Başlatma

```bash
# 1. API Servisi (Port 4000)
npm run dev:api
# veya: node apps/api/dist/index.js

# 2. Web Sitesi (Port 3000)
npm run dev:web
# veya: npm --workspace=apps/web run start

# 3. Mobil Uygulama
npm run dev:mobile
```

---

## 📱 Sayfalar ve Uç Noktalar

### Web & Mobil Ekranlar:
- `/` — Kurumsal vitrin, 1997'den beri Emine Abla hikayesi, imza lezzetler, şube seçimi
- `/menu` — Şube filtreli tam katalog, arama, ürün detay modalı ve sepete ekleme
- `/ozel-pasta` — Özel gün pastası talep formu (kişi sayısı, lezzet, teslim tarihi, mesaj, usta teklif döngüsü)
- `/sepet` — Sunucu doğrulamalı sepet, paket servis / gel-al seçimi, minimum sepet kontrolü, sipariş tamamlama
- `/siparis-takip/[orderNumber]` — 8 saniyede bir canlı güncellenen durum timeline'ı
- `/subeler` — Doğrulanmış şube çalışma saatleri, telefonları ve harita yol tarifi
- `/hakkimizda` — Yalçın Ailenizin Pastanesi marka hikayesi
- `/iletisim` — Şube iletişim kanalları ve mesaj formu
- `/admin` — Personel canlı sipariş yönetim kanbanı, özel pasta fiyat teklifi verme ve ciro istatistikleri
