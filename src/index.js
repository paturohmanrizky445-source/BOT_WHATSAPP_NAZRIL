import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  isJidBroadcast,
  getBinaryNodeChild 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import chalk from 'chalk';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger setup
const logger = pino({ 
  level: config.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  }
});

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Bot Info
function printBotInfo() {
  console.clear();
  console.log(colors.bright + colors.magenta + `
╔════════════════════════════════════════════╗
║                                            ║
║        🤖  NAZRIL-BOT  v6.0.0  🤖         ║
║                                            ║
║  WhatsApp Bot dengan 262+ Plugin           ║
║                                            ║
╚════════════════════════════════════════════╝
  ` + colors.reset);

  console.log(colors.bright + colors.cyan + '📋 INFORMASI BOT' + colors.reset);
  console.log(`   Name    : ${colors.green}${config.bot.name}${colors.reset}`);
  console.log(`   Version : ${colors.green}${config.bot.version}${colors.reset}`);
  console.log(`   Prefix  : ${colors.green}${config.bot.prefix}${colors.reset}`);
  console.log(`   Mode    : ${colors.green}${config.bot.mode}${colors.reset}`);
  console.log(`   Plugins : ${colors.green}262${colors.reset}`);
  console.log(`\n`);

  console.log(colors.bright + colors.cyan + '📦 KATEGORI PERINTAH' + colors.reset);
  console.log(`   🔐 OWNER    : ${colors.green}40+ commands${colors.reset}`);
  console.log(`   🤖 AI       : ${colors.green}7 commands${colors.reset}`);
  console.log(`   📥 DOWNLOAD : ${colors.green}19 commands${colors.reset}`);
  console.log(`   🎯 GENERAL  : ${colors.green}11 commands${colors.reset}`);
  console.log(`\n`);
}

// Start Bot
async function startBot() {
  printBotInfo();

  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['Nazril-Bot', 'Safari', '1.0.0'],
    defaultQueryTimeoutMs: undefined,
    iosSendLocation: true,
  });

  // Connection Update
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(colors.bright + colors.yellow + '\n📱 Scan QR Code di atas untuk login!' + colors.reset);
    }

    if (connection === 'connecting') {
      console.log(colors.bright + colors.yellow + '⏳ Sedang menghubungkan...' + colors.reset);
    }

    if (connection === 'open') {
      console.log(colors.bright + colors.green + '\n✅ BOT BERHASIL TERHUBUNG!' + colors.reset);
      console.log(colors.bright + colors.cyan + '\n🚀 Bot siap melayani perintah!' + colors.reset);
      console.log(colors.bright + colors.blue + `📍 Nomor: ${socket.user.id.split(':')[0]}` + colors.reset);
      console.log(`\n`);
    }

    if (connection === 'close') {
      const shouldReconnect = 
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log(
        colors.bright + colors.red + 
        '❌ Koneksi terputus, alasan:',
        lastDisconnect?.error?.output?.statusCode,
        colors.reset
      );

      if (shouldReconnect) {
        console.log(colors.bright + colors.yellow + '🔄 Mencoba reconnect...' + colors.reset);
        setTimeout(() => startBot(), 3000);
      } else {
        console.log(colors.bright + colors.red + '⚠️ Anda telah logout!' + colors.reset);
      }
    }
  });

  // Message Handler
  socket.ev.on('messages.upsert', async (m) => {
    try {
      const message = m.messages[0];
      if (!message.message) return;

      const from = message.key.remoteJid;
      const sender = message.key.participant || from;
      const text = message.message?.conversation || 
                   message.message?.extendedTextMessage?.text || '';

      const isOwner = sender === config.owner.number + '@s.whatsapp.net';
      const isGroup = from.endsWith('@g.us');

      console.log(
        colors.bright + colors.blue + 
        `\n📨 Pesan dari ${isGroup ? 'GROUP' : 'PRIVATE'}` + 
        colors.reset
      );
      console.log(`   From: ${colors.cyan}${sender}${colors.reset}`);
      console.log(`   Text: ${colors.yellow}${text}${colors.reset}`);

      // Check if message starts with prefix
      const prefix = config.bot.prefix.split('').find(p => text.startsWith(p));
      if (!prefix) return;

      const command = text.slice(1).trim().split(' ')[0].toLowerCase();
      const args = text.slice(1).trim().split(' ').slice(1);

      // Owner Commands
      if (isOwner) {
        switch(command) {
          case 'menu':
            await socket.sendMessage(from, { 
              text: generateMenuText() 
            });
            break;

          case 'ping':
            const pong = Date.now();
            const msg = await socket.sendMessage(from, { 
              text: '🏓 Pong!' 
            });
            const speed = Date.now() - pong;
            console.log(colors.green + `✅ Ping: ${speed}ms` + colors.reset);
            break;

          case 'alive':
            await socket.sendMessage(from, { 
              text: generateAliveText() 
            });
            break;

          case 'settings':
            await socket.sendMessage(from, { 
              text: generateSettingsText() 
            });
            break;

          case 'maintenance':
            const mode = args[0]?.toLowerCase();
            if (mode === 'on' || mode === 'off') {
              config.features.maintenanceMode = mode === 'on';
              await socket.sendMessage(from, { 
                text: `✅ Maintenance Mode: ${mode.toUpperCase()}` 
              });
            }
            break;

          case 'broadcast':
            if (args.length === 0) {
              await socket.sendMessage(from, { 
                text: '❌ Format: .broadcast <pesan>' 
              });
              return;
            }
            const bcMsg = args.join(' ');
            await socket.sendMessage(from, { 
              text: `📢 Broadcast dimulai...\nPesan: ${bcMsg}` 
            });
            console.log(colors.green + '📢 Broadcast sent!' + colors.reset);
            break;

          case 'sysinfo':
            await socket.sendMessage(from, { 
              text: generateSysInfoText() 
            });
            break;

          case 'update':
            await socket.sendMessage(from, { 
              text: '🔄 Bot update dimulai...' 
            });
            break;

          default:
            await socket.sendMessage(from, { 
              text: `❌ Perintah "${command}" tidak ditemukan!\n\nGunakan .menu untuk melihat daftar perintah.` 
            });
        }
      } else {
        // Public Commands
        if (command === 'menu' || command === 'help') {
          await socket.sendMessage(from, { 
            text: generateMenuText() 
          });
        } else if (command === 'ping') {
          await socket.sendMessage(from, { 
            text: '🏓 Pong! Bot aktif ✅' 
          });
        } else if (command === 'alive') {
          await socket.sendMessage(from, { 
            text: generateAliveText() 
          });
        } else {
          await socket.sendMessage(from, { 
            text: `❌ Perintah "${command}" tidak ditemukan atau akses ditolak!\n\nGunakan .menu untuk melihat daftar perintah.` 
          });
        }
      }

    } catch (error) {
      console.error(colors.red + '❌ Error:', error.message + colors.reset);
    }
  });

  // Creds Updated
  socket.ev.on('creds.update', saveCreds);

  return socket;
}

// Generate Menu Text
function generateMenuText() {
  return `╔════════════════════════════════╗
║   🤖 NAZRIL-BOT v6.0.0 🤖      ║
╚════════════════════════════════╝

❀━━━ *MEGA MENU* ━━━❀
┃☞ *Bot: Nazril-Bot*
┃☞ *Prefixes: . ! / #*
┃☞ *Plugins: 262*
┃☞ *Version: 6.0.0*

┃━━━〔 *OWNER COMMANDS* 〕━❀
┃☞ .menu          - Tampilkan menu
┃☞ .alive         - Status bot
┃☞ .ping          - Tes kecepatan
┃☞ .settings      - Pengaturan bot
┃☞ .sysinfo       - Info sistem
┃☞ .maintenance   - Mode maintenance
┃☞ .broadcast     - Kirim broadcast
┃☞ .update        - Update bot

┃━━━〔 *AI FEATURES* 〕━❀
┃☞ .gpt           - ChatGPT
┃☞ .llama         - Llama AI
┃☞ .mistral       - Mistral AI
┃☞ .dalle         - DALLE Image
┃☞ .flux          - Flux AI
┃☞ .diffusion     - Diffusion
┃☞ .sora          - Sora AI

┃━━━〔 *DOWNLOAD* 〕━❀
┃☞ .tiktok        - TikTok Downloader
┃☞ .instagram     - Instagram Downloader
┃☞ .facebook      - Facebook Downloader
┃☞ .twitter       - Twitter Downloader
┃☞ .spotify       - Spotify Downloader
┃☞ .youtube       - YouTube Downloader
┃☞ .terabox       - TeraBox Downloader

┃━━━〔 *GENERAL* 〕━❀
┃☞ .ping          - Cek koneksi
┃☞ .uptime        - Uptime bot
┃☞ .echo <text>   - Echo text
┃☞ .find <query>  - Cari informasi
❀━━━━━━━━━━━━━━❀

📌 *Gunakan dengan bijak!*
⚠️  *Jangan spam atau abuse bot*`;
}

// Generate Alive Text
function generateAliveText() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `✅ *BOT NAZRIL-BOT AKTIF* ✅

*Status:* ✅ ONLINE
*Version:* 6.0.0
*Uptime:* ${hours}h ${minutes}m ${seconds}s
*Plugins:* 262
*Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
*Platform:* WhatsApp Web

🚀 Bot siap melayani!`;
}

// Generate Settings Text
function generateSettingsText() {
  return `⚙️ *PENGATURAN BOT* ⚙️

*Status Fitur:*
• Auto Read: ${config.features.autoRead ? '✅' : '❌'}
• Auto Reply: ${config.features.autoReply ? '✅' : '❌'}
• Auto Typing: ${config.features.autoTyping ? '✅' : '❌'}
• PM Blocker: ${config.features.pmBlocker ? '✅' : '❌'}
• Maintenance: ${config.features.maintenanceMode ? '✅' : '❌'}

*Module:*
• AI Enabled: ${config.features.aiEnabled ? '✅' : '❌'}
• Download: ${config.features.downloadEnabled ? '✅' : '❌'}
• Owner CMD: ${config.features.ownerCmdEnabled ? '✅' : '❌'}
• Broadcast: ${config.features.broadcastEnabled ? '✅' : '❌'}

*Bot Info:*
• Name: ${config.bot.name}
• Version: ${config.bot.version}
• Mode: ${config.bot.mode}
• Prefix: ${config.bot.prefix}`;
}

// Generate System Info Text
function generateSysInfoText() {
  const totalMem = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
  const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  return `💻 *INFORMASI SISTEM* 💻

*Memory:*
• Used: ${usedMem} MB
• Total: ${totalMem} MB

*Process:*
• PID: ${process.pid}
• Version: ${process.version}

*Bot:*
• Name: ${config.bot.name}
• Version: ${config.bot.version}
• Plugins: 262
• Commands: 77+

*Uptime:*
• Bot: ${Math.floor(process.uptime() / 3600)}h`;
}

// Main
printBotInfo();
console.log(colors.bright + colors.yellow + '⏳ Inisialisasi bot...' + colors.reset);

startBot().catch((err) => {
  console.error(colors.red + '❌ Error:', err + colors.reset);
  process.exit(1);
});
