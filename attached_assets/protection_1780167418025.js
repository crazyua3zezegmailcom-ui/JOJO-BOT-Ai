/**
 * ═══════════════════════════════════════════════════════
 *              🛡️ نظام الحماية - WhatsApp Bot
 *         فلترة الكلمات + فحص الصور والستيكرات
 * ═══════════════════════════════════════════════════════
 */

// ─── حالة الحماية لكل جروب ───
const protectedGroups = new Map();
// { chatId: { enabled: true, warnCount: { jid: number }, log: [] } }

// ═══════════════════════════════════════════════════════
//                  📋 قائمة الكلمات المحظورة
// ═══════════════════════════════════════════════════════
const BANNED_WORDS = [
  // ─── ألفاظ جنسية وإباحية عربية ───
  'سكس', 'جنس', 'نيك', 'ينيك', 'ناك', 'متناك', 'اتناك',
  'كس', 'كسمك', 'كسم', 'زب', 'زبر', 'طيز', 'بزاز',
  'صدر عاري', 'عاري', 'عارية', 'عري', 'تعري',
  'علاقة جنسية', 'علاقة حميمية', 'علاقات حميمية',
  'ممارسة الجنس', 'ممارسة جنسية', 'ممارسة',
  'اغتصاب', 'دعارة', 'دعاره', 'مومس', 'زانية', 'زاني',
  'شرموط', 'شرموطة', 'شرموطه', 'قحبة', 'قحب',
  'عاهره', 'عاهرة',
  'اباحي', 'إباحي', 'اباحية', 'اباحيه', 'إباحية',
  'بورن', 'محتوى جنسي', 'محتوى للكبار', 'مقاطع ساخنة', 'مقاطع للكبار',
  'للكبار', 'مثير', 'مثيرة', 'اغراء', 'إغراء', 'مغري', 'مغرية',
  'ملابس داخلية', 'لانجري', 'جسم عاري',
  'فرج', 'قضيب', 'مص', 'لحس',

  // ─── شتائم قوية عربية ───
  'عرص', 'معرص', 'خول', 'يا خول', 'يا عرص',
  'ابن المتناكة', 'ابن المتناكه', 'ابن الكلب', 'ابن كلب',
  'ابن الحرام', 'ولد الحرام',
  'خنزير', 'خنزيرة', 'يا حيوان', 'يا وسخ', 'يا نجس',
  'زبالة', 'زباله', 'قذر', 'قذرة',
  'نجس', 'حقير', 'حقيرة', 'نذل', 'نذلة',
  'واطي', 'سافل', 'سافلة', 'منحط', 'معفن', 'مقرف',
  'عديم الادب', 'عديم التربيه', 'قليل الادب', 'قليل التربيه',

  // ─── شتائم إنجليزية قوية ───
  'fuck', 'fucking', 'motherfucker', 'asshole',
  'son of a bitch', 'shit', 'shithead', 'dickhead',
  'scumbag', 'bastard',
  'sex', 'porn', 'xxx', 'nude', 'naked',
  'dick', 'pussy', 'cock', 'cum', 'whore', 'slut',
  'blowjob', 'handjob', 'anal', 'orgasm', 'horny',
  'boobs', 'bitch',
  'adult content', 'nsfw', 'erotic', 'escort', 'escorts',
  'camgirl', 'camgirls', 'webcam sex', 'sexual', 'fetish',
  'hentai', 'onlyfans', 'only fans',
  'hardcore', 'softcore', 'strip', 'stripper',
  'lingerie', 'bdsm', 'sexy',

  // ─── روابط إباحية ───
  'xvideos', 'pornhub', 'xnxx', 'xhamster', 'redtube',
  'onlyfans.com', 'chaturbate', 'livejasmin',

  // ─── leetspeak / تهرب بالأرقام ───
  's3x', 's@x', '5nz1r', 'pr0n', 'p0rn',
];

// ─── كلمات تستوجب تحذير (3 تحذيرات ثم طرد) ───
const WARN_WORDS = [
  // عربي
  'غبي', 'غبية', 'أهبل', 'اهبل', 'متخلف', 'متخلفة',
  'حمار', 'كلب', 'كلبة', 'قرد', 'حيوان',
  'وسخ', 'تافه', 'تافهة', 'فاشل', 'فاشلة',
  'كلوت', 'مجنون', 'مجنونة',
  // إنجليزي
  'idiot', 'stupid', 'dumb', 'loser', 'trash',
  'jerk', 'moron',
];

// ═══════════════════════════════════════════════════════
//              🔍 دوال الفحص
// ═══════════════════════════════════════════════════════

// ─── تطبيع النص — إزالة الرموز والتشكيل ───
function normalizeText(text) {
  return text
    .toLowerCase()
    // إزالة التشكيل العربي
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // تقليص الحروف المكررة: زززب → زب
    .replace(/(.)\1{2,}/g, '$1$1')
    // استبدال أرقام بحروف مشابهة (leetspeak)
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/8/g, 'b')
    // إزالة الرموز مع الإبقاء على المسافات
    .replace(/[*_~`|،؟!.,;:'"()[\]{}<>@#$%^&+=\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── نسخة مضغوطة بدون مسافات (للكشف عن الكلمات الملصوقة) ───
function compactText(text) {
  return normalizeText(text).replace(/\s+/g, '');
}

// ─── فحص النص — يكشف الكلمة لوحدها أو جوه جملة أو ملصوقة ───
function checkText(text) {
  const norm     = normalizeText(text);   // "انت شرموطه يا عم"
  const compact  = compactText(text);     // "انتشرموطهياعم"
  const original = text.toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '');

  for (const word of BANNED_WORDS) {
    const w = word.toLowerCase();
    // 1) الكلمة جوه الجملة (مع مسافات)
    if (norm.includes(w))                          return { type: 'banned', word };
    // 2) الكلمة ملصوقة بكلمات بدون مسافة
    if (compact.includes(w.replace(/\s/g, '')))    return { type: 'banned', word };
    // 3) النص الأصلي بعد إزالة التشكيل بس
    if (original.includes(w))                      return { type: 'banned', word };
  }

  for (const word of WARN_WORDS) {
    const w = word.toLowerCase();
    if (norm.includes(w))                          return { type: 'warn', word };
    if (compact.includes(w.replace(/\s/g, '')))    return { type: 'warn', word };
  }

  return null;
}

// ─── فحص الصورة/الستيكر (هاش + حجم + ميتاداتا) ───
async function checkMedia(m) {
  try {
    const msg = m.message;
    if (!msg) return null;

    // ─── ستيكر ───
    if (msg.stickerMessage) {
      const sticker = msg.stickerMessage;
      // الستيكرات المتحركة أو ذات الفئات المشبوهة
      if (sticker.isAnimated) {
        // نفحص الـ mimetype
        const mime = sticker.mimetype || '';
        if (mime.includes('webp')) {
          // ستيكر عادي — نفحص حجمه فقط (الصور الإباحية عادة أحجامها كبيرة)
          const fileSize = sticker.fileLength || 0;
          if (fileSize > 500 * 1024) { // أكبر من 500KB مشبوه
            return { suspicious: true, reason: 'ستيكر بحجم غير طبيعي' };
          }
        }
      }
      // فحص الـ categories إذا موجودة
      const cats = sticker.categories || [];
      const suspiciousEmojis = ['🔞', '💋', '🍑', '🍆', '👙'];
      for (const cat of cats) {
        if (suspiciousEmojis.includes(cat)) {
          return { suspicious: true, reason: 'ستيكر يحتوي محتوى مشبوه' };
        }
      }
    }

    // ─── صورة ───
    if (msg.imageMessage) {
      const img = msg.imageMessage;
      const caption = img.caption || '';

      // فحص الكابشن
      const captionCheck = checkText(caption);
      if (captionCheck?.type === 'banned') {
        return { suspicious: true, reason: `كابشن يحتوي كلمة محظورة: ${captionCheck.word}` };
      }

      // فحص الـ URL إذا موجود
      const url = img.url || '';
      for (const site of ['xvideos', 'pornhub', 'xnxx', 'xhamster']) {
        if (url.includes(site)) {
          return { suspicious: true, reason: 'صورة من موقع إباحي' };
        }
      }
    }

    // ─── فيديو ───
    if (msg.videoMessage) {
      const vid = msg.videoMessage;
      const caption = vid.caption || '';
      const captionCheck = checkText(caption);
      if (captionCheck?.type === 'banned') {
        return { suspicious: true, reason: `كابشن فيديو محظور: ${captionCheck.word}` };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ─── التحقق إن البوت أدمن ───
async function isBotAdmin(conn, chatId) {
  try {
    const groupMeta   = await conn.groupMetadata(chatId);
    const botJid      = conn.user?.id || conn.user?.jid || '';
    const botJidClean = botJid.split(':')[0] + '@s.whatsapp.net';
    const participant = groupMeta.participants.find(p =>
      p.id === botJidClean || p.id === botJid
    );
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
  } catch {
    return false;
  }
}

// ─── حذف الرسالة ───
async function deleteMessage(conn, chatId, m) {
  try {
    await conn.sendMessage(chatId, { delete: m.key });
  } catch {}
}

// ─── طرد عضو ───
async function kickMember(conn, chatId, jid) {
  try {
    await conn.groupParticipantsUpdate(chatId, [jid], 'remove');
    return true;
  } catch {
    return false;
  }
}

// ─── سجل الحدث ───
function logEvent(game, jid, type, detail) {
  game.log.push({
    jid,
    type,
    detail,
    time: new Date().toLocaleString('ar-EG')
  });
  // احتفظ بآخر 50 حدث فقط
  if (game.log.length > 50) game.log.shift();
}

// ═══════════════════════════════════════════════════════
//                    الهاندلر الرئيسي
// ═══════════════════════════════════════════════════════
let handler = async (m, { conn, isAdmin, isBotAdmins, isOwner }) => {
  const chatId   = m.chat;
  const senderId = m.sender;
  const body     = (m.body || '').trim();

  if (!chatId.endsWith('@g.us')) return;

  const senderName = senderId.split('@')[0];

  // ════════════════════════════════════════
  //         أوامر التحكم في الحماية
  // ════════════════════════════════════════

  // ─── تفعيل الحماية ───
  if (/^\.حماية تشغيل$/i.test(body)) {
    if (!isAdmin && !isBotAdmins && !isOwner) {
      return conn.sendMessage(chatId, {
        text: '🚫 *هذا الأمر للأدمن فقط!*',
        mentions: [senderId]
      });
    }

    if (protectedGroups.has(chatId)) {
      return conn.sendMessage(chatId, { text: '✅ الحماية مفعّلة بالفعل!' });
    }

    protectedGroups.set(chatId, {
      enabled: true,
      warnCount: {},
      log: []
    });

    return conn.sendMessage(chatId, {
      text:
        `🛡️ *تم تفعيل نظام الحماية!*\n\n` +
        `✅ فلترة الكلمات: مفعّل\n` +
        `✅ فحص الصور: مفعّل\n` +
        `✅ فحص الستيكرات: مفعّل\n\n` +
        `⚠️ أي محتوى مخالف سيتم:\n` +
        `   🗑️ حذف الرسالة\n` +
        `   👢 طرد العضو فوراً\n\n` +
        `📌 لإيقاف الحماية: *.حماية إيقاف*`
    });
  }

  // ─── إيقاف الحماية ───
  if (/^\.حماية إيقاف$/i.test(body)) {
    if (!isAdmin && !isBotAdmins && !isOwner) {
      return conn.sendMessage(chatId, { text: '🚫 *هذا الأمر للأدمن فقط!*' });
    }

    if (!protectedGroups.has(chatId)) {
      return conn.sendMessage(chatId, { text: '⚠️ الحماية غير مفعّلة أصلاً.' });
    }

    protectedGroups.delete(chatId);
    return conn.sendMessage(chatId, { text: '🔓 *تم إيقاف نظام الحماية*' });
  }

  // ─── عرض السجل ───
  if (/^\.حماية سجل$/i.test(body)) {
    if (!isAdmin && !isBotAdmins && !isOwner) {
      return conn.sendMessage(chatId, { text: '🚫 *هذا الأمر للأدمن فقط!*' });
    }

    if (!protectedGroups.has(chatId)) {
      return conn.sendMessage(chatId, { text: '⚠️ الحماية غير مفعّلة.' });
    }

    const prot = protectedGroups.get(chatId);
    if (prot.log.length === 0) {
      return conn.sendMessage(chatId, { text: '📋 السجل فارغ حتى الآن.' });
    }

    let logMsg = `📋 *سجل الحماية (آخر ${prot.log.length} حدث)*\n\n`;
    for (const entry of prot.log.slice(-10).reverse()) {
      const icon = entry.type === 'kick' ? '👢' : entry.type === 'media' ? '🖼️' : '⚠️';
      logMsg += `${icon} @${entry.jid.split('@')[0]}\n`;
      logMsg += `   📌 ${entry.detail}\n`;
      logMsg += `   🕐 ${entry.time}\n\n`;
    }

    return conn.sendMessage(chatId, { text: logMsg });
  }

  // ─── حالة الحماية ───
  if (/^\.حماية$|^\.حماية حالة$/i.test(body)) {
    const status = protectedGroups.has(chatId);
    return conn.sendMessage(chatId, {
      text:
        `🛡️ *حالة الحماية*\n\n` +
        `${status ? '✅ مفعّلة' : '❌ موقوفة'}\n\n` +
        `📌 الأوامر المتاحة:\n` +
        `▫️ *.حماية تشغيل* — تفعيل\n` +
        `▫️ *.حماية إيقاف* — تعطيل\n` +
        `▫️ *.حماية سجل* — عرض السجل`
    });
  }

  // ════════════════════════════════════════
  //         فحص الرسائل (إذا الحماية مفعّلة)
  // ════════════════════════════════════════
  if (!protectedGroups.has(chatId)) return;
  const prot = protectedGroups.get(chatId);

  // ─── لا تراقب الأدمن ───
  if (isAdmin || isBotAdmins || isOwner) return;

  // ─── تأكد إن البوت أدمن ───
  const botIsAdmin = await isBotAdmin(conn, chatId);
  if (!botIsAdmin) return;

  // ─── فحص النص ───
  if (body) {
    const textResult = checkText(body);

    if (textResult?.type === 'banned') {
      // حذف الرسالة وطرد العضو
      await deleteMessage(conn, chatId, m);

      const kicked = await kickMember(conn, chatId, senderId);
      logEvent(prot, senderId, 'kick', `كلمة محظورة: "${textResult.word}"`);

      await conn.sendMessage(chatId, {
        text:
          `🚨 *تم اكتشاف محتوى مخالف!*\n\n` +
          `👤 العضو: @${senderName}\n` +
          `🚫 السبب: كلمة محظورة\n` +
          `🗑️ الرسالة: تم حذفها\n` +
          `${kicked ? '👢 الإجراء: تم الطرد' : '⚠️ تعذّر الطرد (تأكد إن البوت أدمن)'}`,
        mentions: [senderId]
      });
      return;
    }

    if (textResult?.type === 'warn') {
      // تحذير فقط
      prot.warnCount[senderId] = (prot.warnCount[senderId] || 0) + 1;
      const warns = prot.warnCount[senderId];
      logEvent(prot, senderId, 'warn', `كلمة تحذيرية: "${textResult.word}" (${warns}/3)`);

      if (warns >= 3) {
        // 3 تحذيرات = طرد
        await deleteMessage(conn, chatId, m);
        const kicked = await kickMember(conn, chatId, senderId);
        prot.warnCount[senderId] = 0;
        logEvent(prot, senderId, 'kick', `تجاوز 3 تحذيرات`);

        await conn.sendMessage(chatId, {
          text:
            `🚨 *تم طرد العضو بعد 3 تحذيرات!*\n\n` +
            `👤 @${senderName}\n` +
            `${kicked ? '👢 تم الطرد' : '⚠️ تعذّر الطرد'}`,
          mentions: [senderId]
        });
      } else {
        await conn.sendMessage(chatId, {
          text:
            `⚠️ *تحذير!* @${senderName}\n\n` +
            `🚫 رسالتك تحتوي على لغة غير لائقة\n` +
            `📊 تحذيراتك: ${warns}/3\n` +
            `❗ عند الوصول لـ 3 تحذيرات سيتم طردك`,
          mentions: [senderId]
        });
      }
      return;
    }
  }

  // ─── فحص الوسائط (صور / ستيكرات / فيديو) ───
  const msg = m.message;
  if (msg?.imageMessage || msg?.stickerMessage || msg?.videoMessage) {
    const mediaResult = await checkMedia(m);

    if (mediaResult?.suspicious) {
      await deleteMessage(conn, chatId, m);
      const kicked = await kickMember(conn, chatId, senderId);
      logEvent(prot, senderId, 'media', mediaResult.reason);

      const mediaType = msg.stickerMessage ? 'ستيكر' : msg.videoMessage ? 'فيديو' : 'صورة';

      await conn.sendMessage(chatId, {
        text:
          `🚨 *تم اكتشاف ${mediaType} مخالف!*\n\n` +
          `👤 العضو: @${senderName}\n` +
          `🚫 السبب: ${mediaResult.reason}\n` +
          `🗑️ المحتوى: تم حذفه\n` +
          `${kicked ? '👢 الإجراء: تم الطرد' : '⚠️ تعذّر الطرد (تأكد إن البوت أدمن)'}`,
        mentions: [senderId]
      });
    }
  }
};

// ─── الاستماع لكل الرسائل ───
handler.all = async (m, { conn, isAdmin, isBotAdmins, isOwner }) => {
  const chatId   = m.chat;
  const senderId = m.sender;

  if (!chatId.endsWith('@g.us')) return;
  if (!protectedGroups.has(chatId)) return;
  if (isAdmin || isBotAdmins || isOwner) return;

  const prot     = protectedGroups.get(chatId);
  const body     = (m.body || '').trim();
  const msg      = m.message;
  const senderName = senderId.split('@')[0];

  const botIsAdmin = await isBotAdmin(conn, chatId);
  if (!botIsAdmin) return;

  // ─── فحص النص ───
  if (body) {
    const textResult = checkText(body);

    if (textResult?.type === 'banned') {
      await deleteMessage(conn, chatId, m);
      const kicked = await kickMember(conn, chatId, senderId);
      logEvent(prot, senderId, 'kick', `كلمة محظورة: "${textResult.word}"`);

      await conn.sendMessage(chatId, {
        text:
          `🚨 *محتوى مخالف!*\n\n` +
          `👤 @${senderName}\n` +
          `🚫 كلمة محظورة\n` +
          `🗑️ تم حذف الرسالة\n` +
          `${kicked ? '👢 تم الطرد' : '⚠️ تعذّر الطرد'}`,
        mentions: [senderId]
      });
      return;
    }

    if (textResult?.type === 'warn') {
      prot.warnCount[senderId] = (prot.warnCount[senderId] || 0) + 1;
      const warns = prot.warnCount[senderId];
      logEvent(prot, senderId, 'warn', `"${textResult.word}" (${warns}/3)`);

      if (warns >= 3) {
        await deleteMessage(conn, chatId, m);
        const kicked = await kickMember(conn, chatId, senderId);
        prot.warnCount[senderId] = 0;
        logEvent(prot, senderId, 'kick', 'تجاوز 3 تحذيرات');

        await conn.sendMessage(chatId, {
          text:
            `🚨 @${senderName} تم طرده بعد 3 تحذيرات!`,
          mentions: [senderId]
        });
      } else {
        await conn.sendMessage(chatId, {
          text: `⚠️ تحذير @${senderName} (${warns}/3) — لغة غير لائقة`,
          mentions: [senderId]
        });
      }
      return;
    }
  }

  // ─── فحص الوسائط ───
  if (msg?.imageMessage || msg?.stickerMessage || msg?.videoMessage) {
    const mediaResult = await checkMedia(m);
    if (mediaResult?.suspicious) {
      await deleteMessage(conn, chatId, m);
      const kicked = await kickMember(conn, chatId, senderId);
      logEvent(prot, senderId, 'media', mediaResult.reason);

      const mediaType = msg.stickerMessage ? 'ستيكر' : msg.videoMessage ? 'فيديو' : 'صورة';
      await conn.sendMessage(chatId, {
        text:
          `🚨 *${mediaType} مخالف!*\n` +
          `👤 @${senderName} — تم الحذف ${kicked ? '+ الطرد 👢' : ''}`,
        mentions: [senderId]
      });
    }
  }
};

handler.command = /^\.حماية/i;

export default handler;
