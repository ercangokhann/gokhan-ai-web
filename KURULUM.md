# Gokhan AI — Web Sürümü Kurulumu (Ücretsiz)

Bu sürüm Manus'a bağımlı değildir. Yapay zeka motoru olarak Google'ın
**ücretsiz** Gemini API'sini kullanır. Windows, Mac ve iPhone'dan tarayıcı
üzerinden erişilir; "Ana Ekrana Ekle" ile uygulama gibi kurulabilir.

## 1. Ücretsiz Gemini API Anahtarı Alma

1. https://aistudio.google.com/apikey adresine gidin.
2. Google hesabınızla giriş yapın.
3. **"Create API key"** butonuna tıklayın.
4. Oluşan anahtarı kopyalayın (bu, `.env` dosyasındaki `GEMINI_API_KEY` değeri olacak).

Ücretsiz kotanın güncel sınırlarını https://ai.google.dev/gemini-api/docs/rate-limits
adresinden kontrol edebilirsiniz; günlük ve dakikalık istek sınırı vardır,
kişisel kullanım için genellikle yeterlidir.

## 2. Yerelde Deneme (bilgisayarınızda)

```bash
npm install
cp .env.example .env
# .env dosyasını açıp GEMINI_API_KEY ve APP_PASSWORD alanlarını doldurun
npm start
```

Tarayıcıda `http://localhost:3000` adresini açın, belirlediğiniz şifreyle giriş yapın.

## 3. Ücretsiz Buluta Yükleme (Render.com örneği)

1. Bu proje klasörünü bir GitHub reposuna yükleyin.
2. https://render.com adresinde ücretsiz hesap açın.
3. **New +** → **Web Service** → GitHub reponuzu seçin.
4. Ayarlar:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. **Environment** sekmesinden şu değişkenleri ekleyin:
   - `APP_PASSWORD` → kendi belirlediğiniz şifre
   - `GEMINI_API_KEY` → aldığınız anahtar
   - `SESSION_SECRET` → rastgele uzun bir metin
6. **Deploy** deyin. Birkaç dakika sonra size `https://xxxx.onrender.com`
   şeklinde bir adres verecek.

> Not: Render'ın ücretsiz katmanı, 15 dakika kullanılmazsa uygulamayı
> uyutur; bir sonraki istekte ~30-50 saniye içinde tekrar uyanır. Bu,
> tamamen ücretsiz kalmanın küçük bir bedelidir. Sürekli aktif kalmasını
> istersen ücretli bir plana geçmek gerekir.

## 4. Windows, Mac, iPhone'da Uygulama Gibi Kurma

Render'ın verdiği adresi:

- **iPhone:** Safari'de açın → Paylaş → **Ana Ekrana Ekle**
- **Mac:** Safari'de açın → Paylaş → **Dock'a Ekle** (veya Chrome'da adres
  çubuğundaki yükleme simgesi)
- **Windows:** Edge veya Chrome'da açın → sağ üstteki yükleme simgesi →
  **Yükle**

Her cihazda bağımsız bir uygulama penceresi/simgesi olarak açılır.

## 5. Veriler Nerede Tutuluyor?

Sohbet geçmişi sunucudaki `data.db` adlı tek bir SQLite dosyasında tutulur.
Render'ın ücretsiz katmanında disk kalıcı değildir; yeniden dağıtım
yaptığınızda geçmiş silinebilir. Kalıcı geçmiş istiyorsanız ileride
ücretsiz bir bulut veritabanına (ör. Turso, Neon) geçmemiz gerekir —
istersen bunu da ayarlarım.

## 6. Şifreyi Değiştirme

Herkesin aynı şifreyi kullanmasını istemiyorsan, birden fazla kullanıcı
girişi eklemem gerekir (şu an tek ortak şifre var, basitlik için). Bunu da
istersen bir sonraki adımda ekleyebilirim.

## 7. Masaüstü (Ollama) Sürümü

Bu web sürümü, `Gokhan AI.exe` / `gokhan_ai.py` içindeki tamamen yerel ve
Ollama tabanlı masaüstü uygulamanın **yerini almaz** — o hâlâ Excel
birleştirme ve yerel kod üretimi için ayrı, tamamen ücretsiz bir araç
olarak kullanılmaya devam edebilir. Bu web sürümü sadece "her yerden
sohbet" ihtiyacını Manus'suz ve ücretsiz karşılamak için var.
