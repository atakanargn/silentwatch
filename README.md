# Baileys ile WhatsApp Otomasyonu

Bu proje, bir JSON dosyasında tanımlanan mesai saatlerine göre belirli WhatsApp numaralarının engellenmesini ve engelin kaldırılmasını otomatikleştirir.

Proje, unofficial WhatsApp API'si olan [Baileys](https://github.com/adiwajshing/Baileys) kütüphanesi kullanılarak geliştirildi.

## Özellikler
- **Otomatik Engelleme/Kaldırma**: `working_hours.json` dosyasındaki mesai saatlerine göre belirtilen numaraları mesai dışı saatlerde otomatik olarak engeller ve mesai saatleri içinde engeli kaldırır.
- **Kalıcı Kimlik Doğrulama**: `MultiFileAuthState` kullanarak kimlik doğrulamayı kalıcı hale getirir. Böylece sadece bir kez WhatsApp QR kodunu taramanız yeterlidir.
- **Verimli Zamanlama**: Mesai saatleri her dakika kontrol edilerek doğruluk sağlanır.

## Kurulum Talimatları

### Gereksinimler
- Node.js (>=14.x)
- npm veya yarn
- Whatsapp hesabınız

![Proje Ekran Görüntüsü](https://github.com/atakanargn/silentwatch/blob/main/screenshot.png)

### Kurulum
1. Depoyu klonlayın:
    ```bash
    git clone https://github.com/atakanargn/silentwatch
    ```
2. Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3. `working_hours.json` dosyasına mesai saatlerinizi ve telefon numaralarınızı ekleyin:
    ```json
    {
      "working_hours": {
        "start": "09:00",
        "end": "18:00"
      },
      "numbers": [
        "+90 555 123 45 67",
        "+905551234568"
      ]
    }
    ```
4. Projeyi çalıştırın:
    ```bash
    npm start
    ```

### working_hours.json Örneği
```json
{
  "working_hours": {
    "start": "09:00",
    "end": "18:00"
  },
  "numbers": [
    "+90 555-123 4567",
    "+905551234568"
  ]
}
