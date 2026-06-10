/**
 * ═══════════════════════════════════════════════════════
 *           🚫 نظام منع الاسبام - Gogo Bot
 *      يراقب سرعة الرسائل ويطرد اللي بيسبم تلقائياً
 * ═══════════════════════════════════════════════════════
 *
 *  الإعدادات:
 *    MAX_MSG      = أقصى عدد رسائل مسموح بيها
 *    TIME_WINDOW  = في خلال كام ثانية
 *    WARN_AT      = تحذير بعد كام رسالة
 *
 *  مثال: 5 رسائل في 5 ثواني → تحذير → 8 رسائل في 5 ثواني → طرد
 */

const MAX_MSG     = 8;   // الحد الأقصى قبل الطرد
const WARN_AT     = 5;   // أول تحذير
const TIME_WINDOW = 5000; // نافذة الفحص بالميلي ثانية (5 ثواني)

// ─── حالة الاسبام لكل جروب ───
// { chatId: { enabled: bool, users: { jid: { msgs: [timestamp], warned: bool } } } }
const spamGroups = new Map();

// ─── تنظيف الرسائل القديمة خارج نافذة الفحص ───
function cleanOldMessages(timestamps) {
  const now = Date.now();
  return timestamps.filter(t => now - t < TIME_WINDOW);
}

// ─── طرد العضو ───
async function kickMember(conn, chatId, jid) {
  try {
    await conn.groupParticipantsUpdate(chatId, [jid], 'remove');
    return true;
  } catch { return false; }
}

// ─── حذف رسالة ───
async function deleteMsg(conn, m) {
  try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
}

// ═══════════════════════════════════════════════════════
//         handler.before — يشتغل تلقائي على كل رسالة
// ═══════════════════════════════════════════════════════
const handler = async (m, { conn, command }) => {
  const chatId = m.chat;

  if (!chatId.endsWith('@g.us'))
    return m.reply('🚫 هذا الأمر للجروبات فقط!');

  if (!m.isAdmin && !m.isOwner)
    return m.reply('🚫 هذا الأمر للأدمن فقط!');

  const isActivate = /ضد_/i.test(command);
  const isStop     = /[إا]يقاف_/i.test(command);

  // ─── تفعيل ───
  if (isActivate) {
    if (spamGroups.has(chatId) && spamGroups.get(chatId).enabled)
      return m.reply('✅ منع الاسبام مفعّل بالفعل!\nللإيقاف: *.إيقاف_سبام*');

    spamGroups.set(chatId, { enabled: true, users: {} });
    return m.reply(
      `🚫 *تم تفعيل نظام منع الاسبام!*\n\n` +
      `⚙️ الإعدادات:\n` +
      `▫️ تحذير عند: ${WARN_AT} رسائل / ${TIME_WINDOW / 1000} ثواني\n` +
      `▫️ طرد عند: ${MAX_MSG} رسائل / ${TIME_WINDOW / 1000} ثواني\n\n` +
      `🤖 النظام يعمل تلقائياً\n` +
      `📌 للإيقاف: *.إيقاف_سبام*`
    );
  }

  // ─── إيقاف ───
  if (isStop) {
    if (!spamGroups.has(chatId) || !spamGroups.get(chatId).enabled)
      return m.reply('⚠️ منع الاسبام غير مفعّل أصلاً.\nللتفعيل: *.ضد_سبام*');
    spamGroups.delete(chatId);
    return m.reply('🔓 *تم إيقاف نظام منع الاسبام*');
  }

  // ─── الحالة ───
  const active = spamGroups.has(chatId) && spamGroups.get(chatId).enabled;
  return m.reply(
    `🚫 *حالة منع الاسبام*\n\n` +
    `${active ? '✅ مفعّل' : '❌ موقوف'}\n\n` +
    `📌 الأوامر:\n` +
    `▫️ *.ضد_سبام* أو *.ضد_اسبام* — تفعيل\n` +
    `▫️ *.إيقاف_سبام* أو *.إيقاف_اسبام* — إيقاف`
  );
};

handler.before = async (m, { conn }) => {
  const chatId   = m.chat;
  const senderId = m.sender;

  if (!chatId.endsWith('@g.us')) return;
  if (!spamGroups.has(chatId) || !spamGroups.get(chatId).enabled) return;
  if (m.isOwner || m.isAdmin || m.isBotAdmin) return;

  // ─── تجاهل رسائل النظام (دخول / خروج / إلخ) ───
  if (!m.body && !m.message) return;

  const group = spamGroups.get(chatId);
  if (!group.users[senderId]) {
    group.users[senderId] = { msgs: [], warned: false };
  }

  const user = group.users[senderId];

  // أضف الرسالة الحالية وامسح القديمة
  user.msgs.push(Date.now());
  user.msgs = cleanOldMessages(user.msgs);

  const count = user.msgs.length;

  // ─── طرد ───
  if (count >= MAX_MSG) {
    await deleteMsg(conn, m);
    const kicked = await kickMember(conn, chatId, senderId);

    // امسح سجله
    delete group.users[senderId];

    await conn.sendMessage(chatId, {
      text:
        `🚨 *تم طرد @${senderId.split('@')[0]} بسبب الاسبام!*\n\n` +
        `📊 أرسل ${count} رسائل في ${TIME_WINDOW / 1000} ثواني\n` +
        `${kicked ? '👢 تم الطرد بنجاح' : '⚠️ تعذّر الطرد — تأكد إن البوت أدمن'}`,
      mentions: [senderId]
    });
    return true;
  }

  // ─── تحذير (مرة واحدة بس في النافذة) ───
  if (count >= WARN_AT && !user.warned) {
    user.warned = true;

    await conn.sendMessage(chatId, {
      text:
        `⚠️ *تحذير اسبام!* @${senderId.split('@')[0]}\n\n` +
        `📊 أرسلت ${count} رسائل في ${TIME_WINDOW / 1000} ثواني\n` +
        `❗ لو استمريت سيتم طردك تلقائياً!`,
      mentions: [senderId]
    });

    // أعد التحذير بعد انتهاء النافذة الحالية
    setTimeout(() => {
      if (group.users[senderId]) {
        group.users[senderId].warned = false;
      }
    }, TIME_WINDOW);
  }
};

// يقبل كلا الإملاءين: سبام / اسبام
handler.command  = /^(ضد_[اس]?سبام|إيقاف_[اس]?سبام|ايقاف_[اس]?سبام|حالة_[اس]?سبام)$/i;
handler.usage    = ['ضد_سبام', 'إيقاف_سبام', 'حالة_سبام'];
handler.category = 'admin';
handler.group    = true;

export default handler;
