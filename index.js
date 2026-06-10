import { Client } from 'meowsab';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';

/* =========== Client ========== */
const client = new Client({
  phoneNumber: '201116571308', // Bot number
  prefix: [".", "/", "!"],
  fromMe: false, 
  owners: [
    { name: "𝐶𝑟𝑎𝑧𝑦", lid: "247579682029763@lid", jid: "15877004085@s.whatsapp.net" },
    { name: "𝐶𝑟𝑎𝑧𝑦", lid: "221307316789354@lid", jid: "201214057674@s.whatsapp.net" },
  ],
  settings: { noWelcome: false },
  commandsPath: './plugins'
});

client.onGroupEvent(group);
client.onCommandAccess(access);

/* =========== Database ========== */
if (!global.db) {
    global.db = new UltraDB();
}

/* =========== Config ========== */
const { config } = client;
config.info = { 
  nameBot: "『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』", 
  nameChannel: "『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』", 
  idChannel: "120363428186936884@newsletter",
  urls: {
    repo: "https://github.com/de𝐶𝑟𝑎𝑧𝑦0/𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕-AI",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029Vb82IJr3gvWS72JEDB1e",
    support: "https://chat.whatsapp.com/CDa5fFK3mLhHJYMLxHBQey?s=cl&p=a&mlu=1"
  },
  copyright: { 
    pack: '𝐶𝑟𝑎𝑧𝑦', 
    author: '𝐶𝑟𝑎𝑧𝑦'
  },
  images: [
    "https://i.postimg.cc/9fTmLkpk/file-000000006384720aa0a30e66001c1c85.png",
    "https://i.postimg.cc/VLdc7Tsp/IMG-20260511-WA0360.jpg",
    "https://i.postimg.cc/Vv70zh2n/IMG-20260511-WA0362.jpg",
    "https://i.postimg.cc/KjnFN3Dn/IMG-20260511-WA0363.jpg"
  ]
};

/* =========== Start ========== */
client.start();

setTimeout(async () => {
if (client.commandSystem) { 
sub(client)
  }
}, 2000);


/* =========== Catch Errors ========== */
process.on('uncaughtException', (e) => {
    if (e.message.includes('rate-overlimit')) {}
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
});
