const handler = async (m, { conn, args }) => {
  const chat = m.chat;

  // ─── تأكد إن البوت مشرف ───
  const botRaw = conn.user.id.split(':')[0].split('@')[0];
  const groupMeta = await conn.groupMetadata(chat);
  const participants = groupMeta.participants;

  const botParticipant = participants.find(p => p.id.split(':')[0].split('@')[0] === botRaw);
  if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) {
    return m.reply('❌ البوت مش مشرف — خليه مشرف الأول');
  }

  // ─── تأكد إن اللي بعت الأمر أدمن ───
  const senderRaw = m.sender.split(':')[0].split('@')[0];
  const senderParticipant = participants.find(p => p.id.split(':')[0].split('@')[0] === senderRaw);
  if (!senderParticipant || !['admin', 'superadmin'].includes(senderParticipant.admin)) {
    return m.reply('❌ الأمر ده للأدمن بس');
  }

  // ─── جيب العضو عن طريق المنشن أو الريبلاي ───
  let mentioned = null;

  // طريقة 1: منشن
  if (m.mentionedJid?.[0]) {
    mentioned = m.mentionedJid[0];
  }
  // طريقة 2: ريبلاي على رسالة العضو
  else if (m.quoted) {
    mentioned = m.quoted.sender || m.quoted.participant;
  }

  if (!mentioned) {
    return m.reply('❌ عمل منشن على العضو أو ريبلاي على رسالته');
  }

  // ─── تأكد إن العضو موجود في المجموعة ───
  const targetParticipant = participants.find(p => p.id === mentioned);
  if (!targetParticipant) {
    return m.reply('❌ العضو ده مش في المجموعة');
  }

  // ─── منع طرد الأدمن ───
  if (['admin', 'superadmin'].includes(targetParticipant.admin)) {
    return m.reply('❌ مينفعش تطرد أدمن');
  }

  // ─── الرسائل الخمسة ───
  const messages = [
    '*_اعزائي المشاهدين في كل بيت🌝 اعزائي المشاهدين في كل مكان🌚 _*',
    '*_السلام عليكم ورحمة الله وبركاتة وصباحكم لذيذ😊 ومسائكم تعيس🐦_*',
    '*_وقبل ما نبدأ ونقول احب اقولكو صلو علي الرسول💕_*',
    '*_معانا النهارده العضو الشقي الخطير 😇_*',
    '*_الي معانا النهارده هيختفي ويطير 🤡_*',
  ];

  // ─── ابعت الرسائل الخمسة ───
  for (const msg of messages) {
    await conn.sendMessage(chat, {
      text: msg,
      mentions: [mentioned],
    });
    await new Promise(r => setTimeout(r, 300));
  }

  // ─── اطرد العضو ───
  try {
    await conn.groupParticipantsUpdate(chat, [mentioned], 'remove');
  } catch {
    return m.reply('❌ تعذّر طرد العضو — تأكد إن البوت مشرف');
  }

  // ─── رسالة التأكيد ───
  await conn.sendMessage(chat, {
    text: '*_تراراااا ✨_*',
  });
};

handler.command  = ['سحر'];
handler.usage    = ['سحر'];
handler.category = 'admin';
handler.group    = true;

export default handler;
