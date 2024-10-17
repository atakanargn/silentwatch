/*
Atakan Argın
Github : https://github.com/atakanargn
LinkedIn : https://www.linkedin.com/in/atakanargn/
*/

// baileys unofficial whatsapp kütüphanesi
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
// whatsapp socketinden gelen hataları ayıklamak için
import { Boom } from '@hapi/boom'
// json okumak için
import * as fs from 'fs'
import * as path from 'path'

// loggerı silent'a almak için
import pino from 'pino'

// working_hours.json dosyasındaki verileri okumak için interface oluşturduk
interface WorkingHours {
    working_hours: {
        start: string,
        end: string
    },
    numbers: string[]
}

// Whatsapp bağlantı kodu
async function connectToWhatsApp() {
    // Auth credentialsı klasörden çekiyoruz
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        // Auth credentialsı atadık
        auth: state,
        // Karekodu terminale basıyoruz
        printQRInTerminal: true,
        // Socket üzerinden gelen logları konsolda gözükmemesi için 'silent'a aldık 
        logger: pino({ level: 'silent' }) as any
    });

    // socketten credentials update isteği gelirse 
    // yani bizim credentiallarımız için bir refresh işlemi olursa
    // yeni credentialları alıp saveCreds metodunu çağırıyoruz
    // mevcut credentialları güncel hale gelmiş oluyor
    sock.ev.on('creds.update', saveCreds)

    // socket üzerinden gelen connection.update isteğin 
    // Bir çok işlemde gelmektedir
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        // bağlantı kapatıldıysa, sunucu geç cevap vermiş olabilir, bizim internetimizde problem olabilir vs.
        if (connection === 'close') {
            // Hataları ayıkla, isBoom değişkenine bak
            const error = lastDisconnect?.error as Boom
            // Eğer timeout hatası alırsak, bağlantıyı tekrar başlat
            const shouldReconnect = error?.output?.statusCode !== DisconnectReason.loggedOut && error?.output?.statusCode !== DisconnectReason.connectionClosed
            if (shouldReconnect) {
                // Ufak bi delay koyalım
                setTimeout(() => {
                    connectToWhatsApp()
                }, 5000);
            }

            // bağlantı başarılıysa
        } else if (connection === 'open') {
            await handleWorkingHours(sock)
            // handleWorkingHours fonksiyonunu dakikada bir çalıştır
            setInterval(async () => {
                await handleWorkingHours(sock)
            }, 60000)
        }
    })
}

// json üzerinden saatleri ve numaralı çekip kontrol ettiğimiz metod
async function handleWorkingHours(sock: any) {
    // json dosyasını okuyoruz
    const filePath = path.join(__dirname, 'working_hours.json')
    const data = fs.readFileSync(filePath, 'utf-8')

    // json dosyasındaki verileri WorkingHours interface'ine atıyoruz
    const workingHours: WorkingHours = JSON.parse(data)

    console.log("########")
    console.log("Güncel mesai saatleri : ", workingHours.working_hours.start, " - ", workingHours.working_hours.end)
    console.log("Engellenecek olan numaralar : ", workingHours.numbers)
    console.log("########")

    // Şu anki zamanı alıyoruz
    const currentTime = new Date()

    // Mesai başlangıç ve bitiş saatlerini Date olarak atıyoruz
    const start = new Date()
    const end = new Date()

    // Mesai saatlerini saat ve dakika olarak ayırıyoruz
    const [startHour, startMinute] = workingHours.working_hours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.working_hours.end.split(':').map(Number)

    // Mesai saatleri için oluşturduğumuz Date tipindeki değişkenlere
    // saat ve dakikaları atıyoruz
    start.setHours(startHour, startMinute, 0)
    end.setHours(endHour, endMinute, 0)

    console.log("Mesai saati denetleniyor.")

    if (currentTime < start || currentTime > end) {
        for (const number of workingHours.numbers) {
            console.log("Engellendi : ", number)
            let _number = number.replace(/[+\s-]/g, '')
            await sock.updateBlockStatus(_number + "@s.whatsapp.net", 'block')
        }
    } else {
        for (const number of workingHours.numbers) {
            console.log("Engel kaldırıldı : ", number)
            let _number = number.replace(/[+\s-]/g, '')
            await sock.updateBlockStatus(_number + "@s.whatsapp.net", 'unblock')
        }
    }
}

// Main metod olan bağlantı metodunu çalıştırıyoruz
connectToWhatsApp()