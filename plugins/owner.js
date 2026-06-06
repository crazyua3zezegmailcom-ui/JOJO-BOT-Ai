import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

const HEADER = `*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ╔══「 المطور 」══╗ 🌌✨
        ║  👑 Developer Info  ║
✨🌌 ╚══════════════════════╝ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*`;

const FOOTER = `*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ~ 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 ~ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*`;

async function convertToOggOpus(inputBuffer) {
  const tmpIn = path.join(tmpdir(), `voice_in_${Date.now()}.mp3`);
  const tmpOut = path.join(tmpdir(), `voice_out_${Date.now()}.ogg`);
  try {
    fs.writeFileSync(tmpIn, inputBuffer);
    await execAsync(`ffmpeg -y -i "${tmpIn}" -c:a libopus -b:a 64k -ar 48000 -ac 1 "${tmpOut}"`);
    return fs.readFileSync(tmpOut);
  } finally {
    if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  }
}

let handler = async (m, { conn, bot }) => {
  const devName = '𝐶𝑟𝑎𝑧𝑦';
  const num1 = '12088426361';
  const num2 = '584261208048';

  const vcard1 = `BEGIN:VCARD\nVERSION:3.0\nFN:${devName}\nTEL;type=CELL;waid=${num1}:+${num1}\nEND:VCARD`;
  const vcard2 = `BEGIN:VCARD\nVERSION:3.0\nFN:${devName}\nTEL;type=CELL;waid=${num2}:+${num2}\nEND:VCARD`;

  const img = 'https://i.postimg.cc/2yXd03jy/IMG-20260511-WA0366.jpg';
  const voiceUrl = 'https://media1.vocaroo.com/mp3/1m9sSiyVOX0B';

  const caption = `${HEADER}

👑 اسم المطور: ${devName}

📱 رقم 1: +${num1}

📱 رقم 2: +${num2}

🔗 قناة البوت:
https://whatsapp.com/channel/0029Vb82IJr3gvWS72JEDB1e

💬 جروب الدعم:
https://chat.whatsapp.com/CDa5fFK3mLhHJYMLxHBQey?s=cl&p=a&mlu=1

${FOOTER}`;

  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: caption,
    mentions: [`${num1}@s.whatsapp.net`, `${num2}@s.whatsapp.net`]
  }, { quoted: m });

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: devName,
      contacts: [{ vcard: vcard1 }, { vcard: vcard2 }]
    }
  }, { quoted: m });

  try {
    const voiceRes = await axios.get(voiceUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://vocaroo.com/'
      }
    });
    const mp3Buffer = Buffer.from(voiceRes.data);
    const oggBuffer = await convertToOggOpus(mp3Buffer);
    await conn.sendMessage(m.chat, {
      audio: oggBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m });
  } catch (e) {
    console.error('Voice send error:', e.message);
  }
};

handler.command = /^(owner|مطور|المطور)$/i;

export default handler;
