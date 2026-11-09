# Gokhan AI Web

Windows, Mac ve iPhone'dan tarayıcıyla kullanılan, ana ekrana uygulama gibi eklenebilen hafif yapay zekâ sohbet uygulaması. Tek sunucu dosyasıyla çalışır ve Google Gemini'nin ücretsiz kotasını kullanır.

## Özellikler

- Şifreyle giriş ve imzalı (HMAC-SHA256) oturum çerezi
- Sohbet geçmişinin SQLite veritabanında saklanması
- Google Gemini entegrasyonu, model ortam değişkeniyle seçilebilir
- PWA desteği: manifest, service worker ve ana ekrana ekleme

## Teknolojiler

Node.js, Express, better-sqlite3, Google Gemini API, Render.

## Çalıştırma

Proje klasöründe `.env` dosyası oluşturun:

```env
APP_PASSWORD=kendi-sifreniz
GEMINI_API_KEY=anahtariniz
SESSION_SECRET=uzun-rastgele-bir-deger
```

```bash
npm install
npm start
```

Uygulama `http://localhost:3000` adresinde açılır. Buluta kurulum adımları [KURULUM.md](KURULUM.md) dosyasındadır.

## Geliştirme

İhtiyaç analizi, test ve yayına alma Ercan Gökhan tarafından yapıldı. Kodlamada yapay zekâ desteği alındı.
