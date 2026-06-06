const BANNED_WORDS = [
  'سكس', 'جنس', 'نيك', 'ينيك', 'ناك', 'متناك', 'اتناك',
  'كس', 'كسمك', 'كسم', 'زب', 'زبر', 'طيز', 'بزاز',
  'صدر عاري', 'عاري', 'عارية', 'عري', 'تعري',
  'علاقة جنسية', 'علاقة حميمية', 'علاقات حميمية',
  'ممارسة الجنس', 'ممارسة جنسية',
  'اغتصاب', 'دعارة', 'دعاره', 'مومس', 'زانية', 'زاني',
  'شرموط', 'شرموطة', 'شرموطه', 'قحبة', 'قحب',
  'عاهره', 'عاهرة',
  'اباحي', 'إباحي', 'اباحية', 'اباحيه', 'إباحية',
  'بورن', 'محتوى جنسي', 'محتوى للكبار', 'مقاطع ساخنة', 'مقاطع للكبار',
  'للكبار', 'اغراء', 'إغراء',
  'فرج', 'قضيب', 'مص', 'لحس',
  'عرص', 'معرص', 'خول', 'يا خول', 'يا عرص',
  'ابن المتناكة', 'ابن المتناكه', 'ابن الكلب', 'ابن كلب',
  'ابن الحرام', 'ولد الحرام',
  'fuck', 'fucking', 'motherfucker', 'asshole',
  'son of a bitch', 'shithead', 'dickhead', 'scumbag', 'bastard',
  'sex', 'porn', 'xxx', 'nude', 'naked',
  'dick', 'pussy', 'cock', 'cum', 'whore', 'slut',
  'blowjob', 'handjob', 'anal', 'orgasm', 'horny',
  'boobs', 'hentai', 'onlyfans',
  'xvideos', 'pornhub', 'xnxx', 'xhamster',
  'nsfw', 'bdsm',
];

const WARN_WORDS = [
  'غبي', 'غبية', 'أهبل', 'اهبل', 'متخلف', 'متخلفة',
  'حمار', 'كلب', 'كلبة', 'قرد', 'حيوان',
  'وسخ', 'تافه', 'تافهة', 'فاشل', 'فاشلة',
  'كلوت', 'مجنون', 'مجنونة',
  'idiot', 'stupid', 'dumb', 'loser', 'trash',
  'jerk', 'moron',
];

const warnCount = {};

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/8/g, 'b')
    .replace(/[*_~`|،؟!.,;:'"()[\]{}<>@#$%^&+=\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactText(text) {
  return normalizeText(text).replace(/\s+/g, '');
}

function checkText(text) {
  const norm = normalizeText(text);
  const compact = compactText(text);
  const original = text.toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '');

  for (const word of BANNED_WORDS) {
    const w = word.toLowerCase();
    if (norm.includes(w) || compact.includes(w.replace(/\s/g, '')) || original.includes(w)) {
      return { type: 'banned', word };
    }
  }
  for (const word of WARN_WORDS) {
    const w = word.toLowerCase();
    if (norm.includes(w) || compact.includes(w.replace(/\s/g, ''))) {
      return { type: 'warn', word };
    }
  }
  return null;
}

async function deleteMsg(conn, chatId, m) {
  try { await conn.sendMessage(chatId, { delete: m.key }); } catch {}
}

async function kickMember(conn, chatId, jid) {
  try { await conn.groupParticipantsUpdate(chatId, [jid], 'remove'); return true; } catch { return false; }
}

let handler = async (m, { conn, isAdmin, isBotAdmins, isOwner }) => {
  const chatId = m.chat;
  const senderId = m.sender;

  if (!chatId.endsWith('@g.us')) return;

  if (!global.db?.groups?.[chatId]?.protection) return;

  const botJidClean = (conn.user?.id || '').split(':')[0] + '@s.whatsapp.net';
  if (senderId === botJidClean || senderId === conn.user?.id) return;
  if (isAdmin || isBotAdmins || isOwner) return;

  let groupAdmins = [];
  try {
    const meta = await conn.groupMetadata(chatId);
    groupAdmins = meta.participants.filter(p => p.admin).map(p => p.id);
  } catch {}
  if (groupAdmins.includes(senderId)) return;

  const msg = m.message;
  if (msg) {
    if (msg.stickerMessage) {
      const cats = msg.stickerMessage.categories || [];
      const suspiciousEmojis = ['🔞', '💋', '🍑', '🍆', '👙'];
      for (const cat of cats) {
        if (suspiciousEmojis.includes(cat)) {
          await deleteMsg(conn, chatId, m);
          await kickMember(conn, chatId, senderId);
          await conn.sendMessage(chatId, { text: `🚫 تم طرد @${senderId.split('@')[0]} بسبب ستيكر مشبوه`, mentions: [senderId] });
          return;
        }
      }
    }

    const imgCaption = msg.imageMessage?.caption || '';
    const vidCaption = msg.videoMessage?.caption || '';
    const captionCheck = checkText(imgCaption || vidCaption);
    if (captionCheck?.type === 'banned') {
      await deleteMsg(conn, chatId, m);
      await kickMember(conn, chatId, senderId);
      await conn.sendMessage(chatId, { text: `🚫 تم طرد @${senderId.split('@')[0]} بسبب محتوى مخالف`, mentions: [senderId] });
      return;
    }
  }

  const body = (m.text || m.body || '').trim();
  if (!body) return;

  const result = checkText(body);
  if (!result) return;

  await deleteMsg(conn, chatId, m);

  if (result.type === 'banned') {
    await kickMember(conn, chatId, senderId);
    await conn.sendMessage(chatId, {
      text: `🚫 تم طرد @${senderId.split('@')[0]} بسبب كلمة محظورة`,
      mentions: [senderId]
    });
    if (warnCount[chatId]) delete warnCount[chatId][senderId];
  } else if (result.type === 'warn') {
    if (!warnCount[chatId]) warnCount[chatId] = {};
    if (!warnCount[chatId][senderId]) warnCount[chatId][senderId] = 0;
    warnCount[chatId][senderId]++;

    if (warnCount[chatId][senderId] >= 3) {
      await kickMember(conn, chatId, senderId);
      delete warnCount[chatId][senderId];
      await conn.sendMessage(chatId, {
        text: `⛔ تم طرد @${senderId.split('@')[0]} بعد 3 تحذيرات`,
        mentions: [senderId]
      });
    } else {
      await conn.sendMessage(chatId, {
        text: `⚠️ تحذير ${warnCount[chatId][senderId]}/3 لـ @${senderId.split('@')[0]}\nالكلمة المخالفة: ${result.word}`,
        mentions: [senderId]
      });
    }
  }
};

handler.all = true;
export default handler;
