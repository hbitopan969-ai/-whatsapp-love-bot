const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';
        
        const command = body.toLowerCase().trim();

        if (command === '.rules') {
            const rulesText = `🌸 *『Ｌｏｖｅ　Ｓｔｏｒｙ』 Group Rules* 🌸\n\n` +
                              `💖 1. Respect Everyone\n` +
                              `🌷 2. No Hate • Only Love\n` +
                              `🥺 3. Stay Loyal & Friendly\n` +
                              `✨ 4. Keep Chatting & Enjoy\n` +
                              `🫶 5. No Fighting Allowed\n\n` +
                              `*Spread Positive Vibes!* ✨`;
            await sock.sendMessage(from, { text: rulesText }, { quoted: msg });
        }

        if (command === '.link') {
            const linkText = `💞 *Our Beautiful Group Website Link:* 💞\n\n` +
                             `👉 https://hbitopan969-ai.github.io/lovestory-live/ \n\n` +
                             `Ispar click karke dosto mast background music aur special graphics check karo! 🌸`;
            await sock.sendMessage(from, { text: linkText }, { quoted: msg });
        }

        if (command === '.dare') {
            const dares = [
                "😜 Apne kisi dushman ko text karke bolo 'I miss you' aur screenshot group me bhejo!",
                "🥺 Group ke kisi ek active member ki jhoothi tareef karo 5 lines me.",
                "🎤 Apni aawaz me ek romantic gaana gaa kar group me voice note bhejo!",
                "🤫 Apne kisi sachhe secret ke baare me group me batao.",
                "📱 Apne WhatsApp status par 'I am single' lagao aur 1 ghante tak mat hatana!"
            ];
            const randomDare = dares[Math.floor(Math.random() * dares.length)];
            await sock.sendMessage(from, { text: `🎲 *Your Dare Task:* \n\n${randomDare}` }, { quoted: msg });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting ', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('🔥 WhatsApp Bot Connected Successfully! 🔥');
        }
    });
}

startBot();
