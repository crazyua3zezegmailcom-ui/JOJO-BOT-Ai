import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import axios from 'axios';

const BOT_FOOTER = `✨🌌 ~ 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 ~ 🌌✨`;
const CHANNEL_JID = '120363428186936884@newsletter';
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb82IJr3gvWS72JEDB1e';
const DEFAULT_IMG = 'https://i.postimg.cc/15zdcX21/file-0000000022c072468887852194798d6d.png';

const YT_URL_RE = /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//;
const YT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fastSearch(query) {
  try {
    const r = await axios.get(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      { timeout: 8000, headers: YT_HEADERS }
    );
    const match = r.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match) return `https://www.youtube.com/watch?v=${match[1]}`;
  } catch {}
  return null;
}

async function fastVideoInfo(url) {
  try {
    const videoIdMatch =
      url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
      url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
      url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    const r = await axios.get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { timeout: 6000, headers: YT_HEADERS }
    );

    return {
      title: r.data.title || 'غير معروف',
      channel: r.data.author_name || 'غير معروف',
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : DEFAULT_IMG,
      videoId,
    };
  } catch {
    return { title: 'غير معروف', channel: 'غير معروف', thumbnail: DEFAULT_IMG, videoId: null };
  }
}

async function getAudioBuffer(url) {
  const tmpFile = `/tmp/audio_${Date.now()}.mp3`;
  try {
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '128K',
      output: tmpFile,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
    });
    const buffer = fs.readFileSync(tmpFile);
    fs.unlinkSync(tmpFile);
    return buffer;
  } catch {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return null;
  }
}

const handler = async (m, { conn, text, command }) => {

  // ══════════════════════════════════════
  // ─── أمر التحميل لما يضغط الزر ───
  // ══════════════════════════════════════
  if (command === 'اغنيه_تحميل') {
    const url = text?.trim();
    if (!url) return;

    await conn.sendButton(m.chat, {
      bodyText:
`╔━━━━━━━━━━━━━━━━╗
     🎵  جـاري التحميل  🎵
╚━━━━━━━━━━━━━━━━╝

⏬  يتم الآن تحميل الأغنية
⏳  الرجاء الانتظار لحظة...

━━━━━━━━━━━━━━━━━━
${BOT_FOOTER}`,
      footerText: '📢 تابعنا على القناة',
      buttons: [
        {
          name: 'cta_url',
          params: {
            display_text: '📢 عرض القناة',
            url: CHANNEL_URL,
          },
        },
      ],
      newsletter: {
        name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        jid: CHANNEL_JID,
      },
      interactiveConfig: {
        buttons_limits: 10,
        button_title: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        canonical_url: CHANNEL_URL,
      },
    }, m);

    const [info, audioBuffer] = await Promise.all([
      fastVideoInfo(url),
      getAudioBuffer(url),
    ]);

    if (!audioBuffer) {
      await m.react('❌');
      return m.reply('❌ تعذّر تحميل الأغنية — جرّب لاحقاً');
    }

    try {
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${info.title}.mp3`,
      }, { quoted: m });
      await m.react('✅');
    } catch {
      await m.react('❌');
      await m.reply('❌ تعذّر إرسال الملف — جرّب مرة ثانية');
    }

    return;
  }

  // ══════════════════════════════════════
  // ─── الأمر الرئيسي ───
  // ══════════════════════════════════════
  if (!text) return m.reply('*❲ ❤️ ❳ ~ اكتب اسم الأغنية أو رابط يوتيوب ~ ❲ 💙 ❳*');

  await m.react('⏳');

  let url;
  if (YT_URL_RE.test(text)) {
    url = text.trim();
  } else {
    url = await fastSearch(text);
  }

  if (!url) {
    await m.react('❌');
    return m.reply('❌ تعذّر إيجاد الأغنية — تأكد من الاسم وحاول مرة ثانية');
  }

  const info = await fastVideoInfo(url);

  const thumbnail = info.thumbnail?.startsWith('http')
    ? info.thumbnail
    : DEFAULT_IMG;

  const foundCaption =
`╔━━━━━━━━━━━━━━━━╗
  ✅  تم العثور على الأغنية
╚━━━━━━━━━━━━━━━━╝

🎵  *${info.title}*

👤  *${info.channel}*

━━━━━━━━━━━━━━━━━━
📥  اضغط الزر بالأسفل للتحميل
━━━━━━━━━━━━━━━━━━
${BOT_FOOTER}`;

  await conn.sendButton(m.chat, {
    imageUrl: thumbnail,
    bodyText: foundCaption,
    footerText: '🎵 يوتيوب | YouTube',
    buttons: [
      {
        name: 'quick_reply',
        params: {
          display_text: '🎵  اضغط للصوت',
          id: `.اغنيه_تحميل ${url}`,
        },
      },
      {
        name: 'cta_url',
        params: {
          display_text: '📢  عرض القناة',
          url: CHANNEL_URL,
        },
      },
    ],
    mentions: [m.sender],
    newsletter: {
      name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
      jid: CHANNEL_JID,
    },
    interactiveConfig: {
      buttons_limits: 10,
      button_title: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
      canonical_url: CHANNEL_URL,
    },
  }, m);

  await m.react('✅');
};

handler.usage    = ['اغنيه'];
handler.category = 'downloads';
handler.command  = ['اغنيه', 'اغنية', 'song', 'اغنيه_تحميل'];

export default handler;