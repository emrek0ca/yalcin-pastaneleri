# AGENTS.md — Yalçın Pastaneleri

> Proje genelindeki AI geliştirme ajanları için bağlayıcı çalışma sözleşmesi.
> Sürüm: 1.0 | Araştırma referans tarihi: 14 Ekim 2026 | Dil: Türkçe (tr-TR)
> Bu dosya `design.md` ve `assets.md` dosyalarından üstündür. Çelişki halinde güvenlik, veri doğruluğu ve bu dosyadaki kurallar önceliklidir.

## 0. Ajanın görevi ve başarı tanımı

Yalçın Pastaneleri için **gerçek işletme verilerine dayanan**, müşterilerin kullanabileceği, sipariş operasyonuyla bütünleşebilen bir **web sitesi** ve **React Native mobil uygulaması** geliştir. İşletme, Osmaniye'de faaliyet gösteren bir pastane/kafe/restoran markasıdır. Bu proje jenerik restoran şablonu, sahte demo, konsept tasarım veya yalnızca vitrin değildir.

Öncelik sırası:
1. Gerçek marka kimliği, doğru ürün/şube verisi ve görsel kaynakların doğruluğu.
2. Güvenli ve tutarlı sipariş, fiyat, stok/erişilebilirlik ve ödeme süreçleri.
3. Hızlı, erişilebilir, profesyonel ve doğal kullanıcı deneyimi.
4. Ortak API üzerinden çalışan web, mobil ve yönetim operasyonları.
5. Sürdürülebilir kod, test, gözlemlenebilirlik ve maliyet kontrolü.

**Çalışan sistemi bozan geniş kapsamlı refaktör yapma.** Önce repoyu oku, mevcut mimariyi ve komutları keşfet, eksik parçayı tamir et. Yeni bağımlılık, servis veya soyutlama eklemeden önce somut gerekçe oluştur. Tasarım aşamasına geçmeden `design.md`; görsel seçmeden `assets.md` oku. Bu dosyalar yoksa gerçek içerik uydurmak yerine ilgili eksikliği kaydet.

## 1. Kaynak doğruluğu — mutlak kural

### 1.1 Öncelikli kaynaklar

- Birinci el marka kaynağı: https://www.instagram.com/yalcinpastaneleri/
- Halihazırda erişilebilir menü: https://qrmenu.yalcinpastaneleri.com/
- İşletmenin sağladığı güncel Excel/CSV, ürün fotoğrafı, logo, menü, fiyat çizelgesi ve yazılı onaylar.
- Şube doğrulama için işletmenin doğrudan verdiği bilgiler ve resmî harita işletme profilleri.

İkincil doğrulama: harita listelemeleri, teslimat platformu katalogları, güvenilir dizinler. İkincil kaynak, işletmenin güncel onayıyla çelişiyorsa işletme teyidi esastır. Sosyal ağ profil kopyaları, yorum siteleri, otomatik SEO dizinleri **tek başına kesin kaynak değildir**. Sosyal medya gönderilerindeki eski promosyonları güncel kampanya sayma.

### 1.2 Doğrulanmış / aday / bilinmeyen ayrımı

Her önemli işletme kaydı `status` alanı taşımalı:
- `verified`: işletme tarafından teyit edilmiş veya doğrulanmış resmî kaynaktan güncel olarak alınmış.
- `provisional`: kamuya açık kaynaktan alınmış fakat işletme tarafından teyit edilmemiş.
- `unknown`: henüz öğrenilmemiş.
- `deprecated`: yanlışlandığı ya da güncelliğini yitirdiği belirlenmiş.

Kayıtla birlikte `source_url`, `retrieved_at`, `verified_at`, `verified_by` (varsa) ve gerekiyorsa `source_note` sakla. Yayına çıkacak fiyat, özel kampanya, stok, teslimat alanı, şube çalışma saati, şirket bilgisi ve görsel kullanım hakkı için `verified` şarttır. `provisional` verileri yönetici panelinde inceleme kuyruğuna al; canlı sipariş akışında kesinmiş gibi kullanma.

### 1.3 Araştırmada bulunan marka bilgileri (yayın öncesi teyit şart)

- Marka adı: **Yalçın Pastaneleri**; Instagram görüntülenen isim: **Yalçın Pastaneleri Emine Yalçın**.
- Profil anlatımı: **“1997’den beri Pastaneci Emine Abla”** ve **“Yalçın Ailenizin Pastanesi”**. Bu ifadeler markanın mevcut sosyal medya tanıtımında geçiyor; kurumun onaylı kurumsal metni olarak yeniden doğrula.
- Şube adayı A: **Raufbey / Atatürk Caddesi**, Raufbey, Atatürk Cd. No:308, Osmaniye Merkez. Yaygın listelenen telefon **+90 544 648 60 40**; üçüncü taraflarda saat **06:30–00:00** görünüyor. Saatleri doğrulanmadan canlıya aktarma.
- Şube adayı B: **Adnan Menderes**, Adnan Menderes Mah. 19524. Sk. No:8, Osmaniye Merkez. Sosyal profil kaynaklarında **+90 501 369 00 80** görünüyor; adres/telefon/saatleri işletmeye doğrulat.
- Mevcut QR menüde adet pasta, sütlü/şerbetli tatlı, çikolata, kahve ve içecekler, bazı kategorilerde Adnan Menderes'e özel restoran yemekleri bulunuyor. **Bir ürünün QR menüde görünmesi onun paket servise açık, stokta veya tüm şubelerde satılır olduğunu kanıtlamaz.**

Kaynaklar (araştırma giriş noktaları):
- https://www.instagram.com/yalcinpastaneleri/
- https://qrmenu.yalcinpastaneleri.com/
- https://jolygram.com/en/profile/yalcinpastaneleri/3694135090 (sadece ikincil görüntüleme)
- https://tr.restaurantguru.com/Yalcin-Pastahanesi-Osmaniye (sadece ikincil kayıt)
- https://restaurantguru.com/Yalcin-Pastanesi-Osmaniye-2 (sadece ikincil kayıt)

**Yasak:** Geliştirme ajanı şirket tarihi, unvan, şube, ödül, takipçi sayısı, yorum, müşteri referansı, fiyat, üretim yöntemi, içerik, alerjen, kampanya veya teslimat vaadi uyduramaz. Boş bilgi alanına pazarlama cümlesi yazamaz.

## 2. Sıfır AI-slop ilkesi

Bu ürünün görünümü gerçek, köklü bir yerel gıda markasına ait olmalı. “AI tarafından üretilmiş restoran sitesi” izlenimi kesinlikle kabul edilmez.

- Görsel olarak **yalnızca işletmenin özgün fotoğraf/video/logo varlıkları** veya gerekli kullanım hakları alınmış, kaynağı belgelenen gerçek çekimler kullanılmalı.
- Yapay zekâ ile pasta, ürün, çalışan, işletme iç mekânı, cephe, kurucu portresi, müşteri ya da marka görseli **üretme veya değiştirme**. AI ile ürün görseli tamamlatma, food render, sahte buhar/ışıltı, sentetik arka plan ve yüz düzeltme yok.
- Unsplash/Pexels stok pastaları gerçek Yalçın ürünüymüş gibi gösterme. Fotoğraf bulunmuyorsa sahte görsel koymak yerine düzgün metin tabanlı kart ve “Görsel hazırlanıyor” gibi dürüst fallback kullan.
- Sahte yorum, derecelendirme, istatistik, “en çok satan”, “ödüllü”, “%100 organik”, “günlük taze” gibi teyitsiz ifadeler yok.
- Hazır şablon hissi veren dev gradient blokları, mor/neon AI renkleri, anlamsız bloblar, aşırı yuvarlak kartlar, otomatik carousel yığınları, sahte 3D dekorasyon, gereksiz ikon kalabalığı ve göz yoran animasyonlar yok.
- Gerçek ürün fotoğrafları kadrajı yönlendirir; fotoğraf yoksa ikonlarla tabak veya pasta resmetme.
- Fotoğraftaki ürünlerin rengi/içeriği yanıltıcı biçimde değiştirilemez. Sadece lisans ve marka onayıyla teknik optimizasyon (boyutlandırma, sıkıştırma, bozulma yaratmayan kırpma) yapılabilir.
- Tipografi, boşluk, grid, kontrast ve mikro etkileşimler bilinçli ve sade olmalı. Görsel tasarımın özel ölçüleri `design.md` dosyasına aittir.

## 3. Kapsam ve sınırlar

### 3.1 Web

- Kurumsal ana sayfa: marka, ürün kategorileri, özgün içerik, şube keşfi, net aksiyonlar.
- Menü/katalog: gerçek kategori ve varyantlar, şube seçimi, arama, filtreleme, detay ve alerjen alanı (bilgi varsa).
- Satışa açılması onaylanan ürünler için sepet, teslimat veya mağazadan teslim, sipariş takibi.
- Özel gün pastası için başvuru/teklif akışı: tarih, kişi sayısı, içerik tercihi, mesaj, referans görseli, notlar. Fiyat işletme onayı olmadan kesinleştirilmez.
- Hakkımızda, şubeler, iletişim, yasal sayfalar, erişilebilirlik, SEO, sosyal paylaşım meta verileri.
- İçeriğin ve operasyonun yönetilebildiği yetki kontrollü yönetim arayüzü.

### 3.2 React Native (iOS/Android)

- Web ile **aynı backend verisi**: şubeler, katalog, fiyat, sepet, siparişler, hesap.
- Ana sayfa, ürün listeleme/detay, sepet, checkout, sipariş durumu, hesap, adresler, favoriler ve sipariş geçmişi.
- İşlemsel push: sipariş alındı, onaylandı, hazırlanıyor, teslimata hazır/yola çıktı, tamamlandı/iptal edildi gibi **gerçek durum değişiklikleri**.
- Kampanya push bildirimleri sadece uygun izin ve tercih varsa.
- Web veya mobilde farklı fiyat ve ürün kopyası tutma.

### 3.3 MVP dışı (işletme onayına bağlı)

- Kuryenin canlı GPS takibi, otomatik kurye optimizasyonu, masa rezervasyonu, QR masadan sipariş, puan/ödül sistemi, kupon motoru, çok şubeli gelişmiş stok yönetimi, POS entegrasyonu, çoklu dil.
- Bunları “olması güzel” diye ekleme. Operasyon onayı ve somut kullanım senaryosu olmadan kapsamı büyütme.

## 4. Mimari ve teknoloji kararları

**Varsayılan öneri, mevcut repoda başka sağlam mimari yoksa:**
- Web: Next.js + TypeScript.
- Mobil: React Native + TypeScript (mevcut proje Expo ise Expo uyumunu koru; yoksa Expo'ya zorunlu taşıma yapma).
- API: Node.js + TypeScript, mevcut güvenilir framework tercih edilir.
- Veritabanı: PostgreSQL, ilişkisel ve transaction-safe.
- Bildirimler: Firebase Cloud Messaging (FCM); iOS APNs yapılandırmalı.
- Analitik/hata: kullanım ve mevzuat incelemesi sonrası Firebase Analytics / Crashlytics.
- Medya: onaylı varlıklar için CDN/nesne depolama; sağlayıcıyı maliyet ve haklara göre belirle.

**Tek doğruluk kaynağı backend/veritabanıdır.** İstemci; sipariş tutarı, indirim, teslimat ücreti, şube yetkisi, stok veya ödeme başarısı konusunda otorite değildir. Firestore'u veya Firebase Auth'u sırf Google ürünü olduğu için zorunlu kılma. FCM ücretsiz olabilir; dosya depolama, SMS, barındırma ve yoğun kullanım ücretsiz varsayılmaz.

Kod kalitesi:
- Modüler ama aşırı soyutlanmamış yapı. Mevcut repo klasörlerine saygı.
- Paylaşılan, sürümlenmiş API sözleşmesi; mümkünse OpenAPI ve üretilen istemci tipleri.
- Şube bazlı ürün/variant/fiyat/erişilebilirlik tasarımı.
- Tüm fiyatlar TRY olarak **tam sayı kuruş**; float parasal hesap yok.
- Sunucu tarafı doğrulama, veritabanı constraintleri, transaction, idempotency.
- UTC timestamp sakla, kullanıcıya `Europe/Istanbul` göster.
- Yayında placeholder API, hardcoded sahte fiyat veya mock ödeme sonucu bulunamaz.

## 5. Temel alan modeli

Var olan şema varsa geliştir; isimleri zorla değiştirme. Asgari kavramlar:

- `branches`: şube, adres, koordinat, telefon, çalışma saatleri, sipariş saatleri, durum.
- `categories`: katalog grupları, görünürlük, sıralama.
- `products`: kanonik ürün adı, açıklama, içerik, alerjen alanları, gerçek görseller.
- `product_variants`: porsiyon/dilim/gramaj/adet/kişi sayısı gibi satılabilir varyantlar.
- `branch_offerings`: şube bazında varyantın satılıp satılmadığı, fiyatı, kanalı, erişilebilirliği.
- `customers`, `addresses`, `consents`, `devices`: kimlik, adres, izinler, FCM tokenları.
- `carts`, `cart_items`: sunucuda yeniden fiyatlanabilen sepet.
- `orders`, `order_items`, `order_status_history`: değişmez sipariş kalem anlık görüntüsü ve izlenebilir durum geçişi.
- `payments`, `payment_events`, `refunds`: işlem durumu, sağlayıcı referansı, webhook tekrarlarına tolerans.
- `custom_cake_requests`, `custom_cake_quotes`, `attachments`: özel pasta talebi, teklif, medya ve onay.
- `media_assets`, `source_records`, `audit_logs`: haklar, kaynak ve personel hareketleri.

Gerekmedikçe müşteri PII'sını event loglarına, analitiğe veya push payload'ına koyma.

## 6. Sipariş ve ödeme bütünlüğü

- Sepete ürün eklerken ve checkout başlatırken **sunucudaki güncel** şube, menü, stok/erişilebilirlik, varyant, fiyat ve saatleri doğrula.
- Sipariş her zaman belirli şubeye ve sipariş kanalına bağlıdır. Şube değiştirilince sepeti yeniden doğrula; uygunsuz ürünleri açıkça göster.
- Teslimat için hizmet alanı, ücret, minimum sepet, hazırlanma süresi ve uygun saat işletme onayıyla tanımlanır. Bilinmeyen durumda teslimat sözü verme.
- Sipariş ve ödeme durumları deterministik state machine'dir. Geçersiz geçişleri reddet, değişiklikleri audit et.
- Ödeme sağlayıcısı kararı netleşmeden canlı ödeme butonu/başarılı ödeme simulasyonu oluşturma.
- Ödeme başarısını **yalnızca doğrulanmış sunucu webhook'u veya sağlayıcı teyidi** ile kesinleştir. İstemcinin success redirect'ini kanıt sayma.
- Her checkout denemesi için idempotency key; duplicate callback/çift tıklama aynı siparişin tekrar oluşturulmasına neden olmamalı.
- İade, iptal, zamanaşımı ve hazırlanmaya başlanmış özel sipariş kuralları işletme tarafından onaylanmadan kesin tüketici vaadi yapılmaz.
- Özel pasta teklifinde müşteri isteği -> personel değerlendirme -> fiyat/termin teklifi -> müşteri kabulü -> ödeme/onay -> üretim -> teslim süreçlerini birbirinden ayır.

## 7. Bildirim ve gerçek zamanlı güncellemeler

- FCM, **iletim kanalıdır; siparişin gerçek durumu değildir**. Gerçek durum her zaman API'den okunur.
- Durum değişikliği DB transaction ile kalıcılaştırılır; tercihen outbox/queue ile gönderim yönetilir. Bildirim gönderilemedi diye sipariş durumunu geri alma.
- Aynı event için tekrar bildirim engelle; tokenları kullanıcı/cihaz bazında yönet; geçersiz tokenları temizle.
- iOS için APNs kimlik bilgileri güvenle yapılandırılır; bildirim iznini anlamlı anda iste.
- İşlemsel bildirimler ve pazarlama bildirimleri ayrıdır. Pazarlama rızasını kayıt altına al; kullanıcının tercih değiştirmesini sağla.
- Kişisel not, açık adres, telefon, ödeme bilgisi gibi hassas verileri bildirim metnine koyma.

## 8. Kimlik, güvenlik ve mevzuat

- Göz atma için misafir erişimi; ödeme ve teslimatın gerektirdiği bilgiler minimum düzeyde talep edilir. Misafir checkout desteklenebiliyorsa zorunlu üyelik dayatma.
- Müşteri/admin/personel rollerini sunucu tarafında zorunlu kıl. Branch-scoped RBAC ile personel yalnızca yetkili şubesinin siparişlerini yönetir.
- Şifre, API key, ödeme anahtarı, Firebase service-account ve APNs anahtarını koda/repo'ya yazma. Gizliler environment/secret manager'da bulunmalı.
- Girdi doğrulama, oran sınırlama, CSRF (gereken yerde), CORS, güvenli upload, MIME/uzantı kontrolü, boyut limiti, güvenli dosya URL'leri.
- Özel pasta referans fotoğraflarında malware/uygunsuz dosya kontrolleri ve kişisel veri saklama süresi.
- KVKK aydınlatması, çerez/SDK tercihleri, ticari elektronik ileti izinleri, tüketici/mesafeli satış, iade/iptal ve gerekiyorsa ETBİS yükümlülükleri hukuk/işletme incelemesinden geçmeden “tam uyumlu” iddiası yazma.
- PCI kapsamını dar tut: kart bilgileri uygulama sunucusunda depolanmaz; ödeme kuruluşunun uygun barındırılan/güvenli çözümü kullanılır.

## 9. İçerik ve medya alım süreci

1. İşletmeden görsellerin orijinal dosyalarını ve kullanım onayını al.
2. Her medya varlığına `asset_id`, `source`, `owner`, `license_or_permission`, `approved_by`, `captured_at` (varsa), `product_id/branch_id`, `alt_text`, `status` ekle.
3. Kaynak görseli değiştirmeden sakla; ayrı optimizasyon çıktıları üret (WebP/AVIF/JPEG, uygun boyutlarda).
4. Görselin belirli ürünü gerçekten gösterdiğini doğrula. Sosyal medya görsellerini yalnızca Instagram'da erişilebilir diye otomatik kopyalama/yayınlama.
5. Onaysız materyali `pending_approval` durumunda tut. Onaylanmadıysa arayüzü onaysız içeriğe bağlama.
6. `assets.md` içindeki kaynak, klasör, adlandırma ve görsel kalite kurallarını uygula.

Kritik: Doğrulanmamış ürün görseli yerine **yanlış eşleştirilmiş görsel** kullanmak daha kötüdür.

## 10. Performans ve erişilebilirlik

- Mobil öncelikli, responsive web; iOS ve Android için platforma uygun native davranışlar.
- Web'de Core Web Vitals hedefle; görseller responsive, lazy-loaded (LCP hero hariç), uygun cache policy ile sunulur.
- Mobilde liste sanallaştırma, görsel önbellekleme, kademeli yükleme; gereksiz re-render, megabyte'lık JSON ve chatty API istekleri engellenir.
- Ağ kesintisi, yavaş internet, sunucu hatası ve kısmi yüklemeler için gerçek durumlar göster. Offline ortamda sipariş alındı yalanı söyleme.
- WCAG 2.2 AA erişilebilirlik hedefi: kontrast, klavye, ekran okuyucu, focus, label, hit target, azaltılmış hareket.
- Türkçe karakterleri ve ₺/TRY gösterimini doğru kullan; arama için Türkçe case folding test et.
- Arama motorları için doğru canonical, sitemap, schema.org (yalnızca gerçek doğrulanmış bilgi), ürün sayfaları ve Open Graph meta verisi.

## 11. Test ve çıkış kapıları

Her uygulama dalgası için gerçek komutlarla çalıştır ve sonucunu raporla:
- Lint, typecheck, unit test, entegrasyon testleri.
- İş kuralları: farklı şube fiyatı, satışa kapalı ürün, eski sepet, varyant, teslimat saatleri, kupon varsa tutar matematiği.
- Sipariş: iki kez tıklama, idempotency, eşzamanlı stok değişimi, failed webhook, tekrar gelen webhook, iptal/iade state machine.
- Mobil: iOS ve Android açılış, deep link, push token yenileme, denied permission, geçersiz token.
- Görsel: gerçek ürün fotoğrafı eşleşmesi, responsive layout, kırık görsel URL, alt metin.
- Güvenlik: IDOR/branch authorization, dosya upload, secret scanning, admin access, rate limiting.
- Gerçek cihaz / tarayıcı denemeleri; yalnızca screenshot üzerinden 'çalışıyor' deme.

Canlıya çıkış için **bloklayıcı koşullar**: şube teyidi, canlı ürün-fiyat doğruluğu, görsel kullanım hakkı, ödeme sağlayıcısı ve webhook testi, yasal metinlerin onayı, müşteri verisi güvenliği, geri yüklenebilir yedek, hata izleme.

## 12. Ajan iş akışı ve raporlama biçimi

Her geliştirme oturumunda:

1. **İncele:** repo, mevcut README, package dosyaları, env örnekleri, ilgili dosyalar, `AGENTS.md`, `design.md`, `assets.md`.
2. **Gerçeği kontrol et:** gereksinimle ilişkili kaynak kayıtları ve hangi bilgiler teyitsiz.
3. **Dar plan kur:** hedef, etkilenen dosyalar, veri göçü ihtiyacı, testler ve riskler.
4. **Uygula:** mevcut mimariye uygun en küçük sağlam değişiklik; bağlantısız bileşenlere müdahale etme.
5. **Doğrula:** çalıştırabildiğin testleri gerçekten çalıştır; başarısızlıkları gizleme.
6. **Raporla:** yapılan değişiklik, doğrulanan sonuç, eksik/veri onayı gerektiren konular ve sonraki tek mantıklı adım.

Her çıktı şu kısa formatta olmalı:

```
Sorun / hedef:
Kök neden veya mevcut durum:
Değiştirilen dosyalar:
Uygulanan çözüm:
Çalıştırılan doğrulamalar:
Blokajlar / doğrulanmamış işletme verileri:
```

**Asla** test çalıştırmadan “tamamlandı”, mock veriyi gerçek ürünmüş gibi, ödeme entegrasyonu olmadan “ödeme aktif”, statik durum etiketini canlı sipariş takibiymiş gibi veya üretilmiş görseli işletmenin fotoğrafıymış gibi sunma.

## 13. Geliştirmeye başlamadan önce bilgi toplama listesi

- [ ] İşletme sahibi tarafından proje kapsamı ve görsel kullanım izni teyit edildi.
- [ ] İki şubenin varlığı, adresi, telefonları, gün/saat bazında çalışma ve sipariş kabul saatleri teyit edildi.
- [ ] Marka logo/font/renk kaynakları ve orijinal üretim fotoğrafları sağlandı.
- [ ] Güncel menü ürün listesi, varyantlar, fiyatlar, gramaj, açıklama ve alerjenler şube bazında onaylandı.
- [ ] Web ve mobilde hangilerinin satılacağı (sadece katalog mu, sipariş mi?) kararlaştırıldı.
- [ ] Paket servis bölgesi, teslimat yöntemi/ücreti, minimum sepet, teslimat SLA ve iptal kuralları kararlaştırıldı.
- [ ] Özel pasta hazırlık, teklif ve rezervasyon kuralları netleşti.
- [ ] Siparişi hangi çalışanların, hangi cihazlarda yöneteceği ve mevcut kasa/POS iş akışı öğrenildi.
- [ ] Ödeme kuruluşu, komisyon, iade, muhasebe ve şirket bilgileri doğrulandı.
- [ ] KVKK, ticari ileti, çerez, ödeme ve tüketici metinleri yetkililerce onaylandı.
- [ ] Canlı ortam, domain, DNS, Apple/Google geliştirici hesapları ve push kimlik bilgileri planlandı.

Eksik bilgi = gizlice varsayım yapma sebebi değil. Çözüm: doğrulama kuyruğu ve güvenli davranış. Başlangıçta doğrulanmış ürünler yalnızca **görüntüleme modunda** sunulabilir; satış uygunluğu teyit edilmeden ödeme açılmaz.

## 14. Gelecekteki dosyalarla ilişki

- `design.md`: görsel sistem, responsive ölçüler, sayfa kompozisyonları, tipografi, renkler, hareket ve platform davranışları. İşletmenin mevcut logosundan/gerçek fotoğrafından türetilir.
- `assets.md`: doğrulanmış fotoğrafların, logo dosyalarının, video karelerinin ve bütün telif/kaynak kayıtlarının manifestosu. İzin ve varlık yoksa “eksik” kaydedilir.
- Bu dosyalar **gerçek veri uydurma, güvenlik atlama veya gereksiz özellik ekleme** izni veremez.

**En son ilke:** Yalçın Pastaneleri için sade, özgün, hızlı ve güvenilir bir satış deneyimi üret. Gerçek içerik yoksa tasarımı gerçek dışı içerikle doldurma; doğrula veya dürüstçe boş bırak.
