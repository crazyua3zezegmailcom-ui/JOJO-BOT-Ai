const HEADER = `*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ╔══「 انضم للجروب 🚪 」══╗ 🌌✨
        ║  🤖 Group Join  ║
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

const handler = async (m, { conn, text, bot }) => {
  if (!m.isOwner) {
    const ownerJid = bot?.config?.owners?.[0]?.jid;
    if (ownerJid) {
      await conn.sendMessage(ownerJid, {
        text: `🔔 *طلب دخول جروب*\nمن: @${m.sender.split('@')[0]}\nالرابط: ${text || 'لم يرسل رابط'}`,
        mentions: [m.sender]
      });
    }
    return m.reply(`${HEADER}\n\n📨 تم إرسال طلبك للمطور\nانتظر الرد قريباً ✅\n\n${FOOTER}`);
  }

  if (!text) return m.reply(`${HEADER}\n\n❌ أرسل رابط جروب واتساب\n\nمثال:\n*.انضم https://chat.whatsapp.com/xxxxx*\n\n${FOOTER}`);

  const match = text.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
  if (!match) return m.reply(`${HEADER}\n\n❌ رابط واتساب غير صحيح\nلازم يكون من نوع:\nhttps://chat.whatsapp.com/...\n\n${FOOTER}`);

  const inviteCode = match[1];
  await m.react('⏳');

  try {
    await conn.groupAcceptInvite(inviteCode);
    await m.react('✅');
    return m.reply(`${HEADER}\n\n✅ *تم الدخول للجروب بنجاح!*\n\nكود: \`${inviteCode}\`\n\n${FOOTER}`);
  } catch (e) {
    await m.react('❌');
    const errMsg = e?.message?.toLowerCase() || '';
    let reason = 'حصل خطأ أثناء الدخول';
    if (errMsg.includes('not-authorized')) reason = 'الرابط انتهت صلاحيته أو تم إلغاؤه';
    else if (errMsg.includes('invite-invalid')) reason = 'كود الدعوة غير صالح';
    else if (errMsg.includes('group-full')) reason = 'الجروب ممتلئ';
    return m.reply(`${HEADER}\n\n❌ *فشل الدخول!*\nالسبب: ${reason}\n\n${FOOTER}`);
  }
};

handler.usage = ['انضم'];
handler.category = 'owner';
handler.command = ['انضم', 'ادخل'];
handler.owner = true;

export default handler;
