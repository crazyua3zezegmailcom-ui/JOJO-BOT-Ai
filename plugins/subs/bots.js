const run = async (m, { conn, bot }) => {
  const sub = global.subBots;
  if (!sub) return m.reply("❌ نـظـام الـبـوتـات الـفـرعـيـه غير متاح");

  const bots = sub.list();
  if (bots.length === 0) return m.reply("📭 لا يوجد بوتات فرعية مثبتة");

  let text = `🤖⤿ الـبـوتـات الـفـرعـيـه 
*╮┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ـ*\n`;
  
  const mentions = [];
  
  bots.forEach((b, i) => {
    const jid = b.phone ? `${b.phone}@s.whatsapp.net` : null;
    if (jid) mentions.push(jid);
    
    text += `🫒 *#${i+1}* \n`;
    text += `📱 — الرقم: ${jid ? `@${b.phone}` : b.phone || 'غير معروف'}\n`;
    text += `📍 — الحالة: ${b.connected ? '🟢 متصل' : '🔴 غير متصل'}\n`;
    text += `📨 — الرسائل: ${b.messages || 0}\n`;
    text += `🆔 — الايدي: ${b.id}\n`;
    text += `╯┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ـ\n`;
  });
  
  text += `\n> *_✓ الـمـجـمـوع: ${bots.length}_*`;

  const { images } = bot.config.info;
  const img = images?.[Math.floor(Math.random() * images.length)] || "https://i.postimg.cc/9fTmLkpk/file-000000006384720aa0a30e66001c1c85.png";

  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: text,
    mentions: mentions,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363428186936884@newsletter',
        newsletterName: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        serverMessageId: 0
      }
    }
  }, { quoted: m });
};

run.command = ["البوتات", "bots"];
run.noSub = true;
run.usage =  ["تنصيب"];
run.category = "البوتات";
run.owner = true;
export default run;