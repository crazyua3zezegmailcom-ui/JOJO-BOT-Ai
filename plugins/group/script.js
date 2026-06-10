let handler = async (m, {
    conn,
    bot
}) => {
const context = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363428186936884@newsletter',
        newsletterName: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 | Built on meowsab",
        body: "𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚋𝚘𝚝 𝚝𝚑𝚊𝚝 𝚒𝚜 𝚎𝚊𝚜𝚢 𝚝𝚘 𝚖𝚘𝚍𝚒𝚏𝚢 𝚊𝚗𝚍 𝚟𝚎𝚛𝚢 𝚏𝚊𝚜𝚝",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});
const { images } = bot.config.info;
const img = images.random()
await conn.sendMessage(m.chat, { 
  text: `
GitHub: _*https://github.com/de𝐶𝑟𝑎𝑧𝑦0/𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕-AI/tree/main*_

Video: _*https://youtu.be/hA5aCpvesJE?si=pHAEsbDFTVXe2_sq*_

> *لا تنسي وضع نجمة لـ الريبو 🌟*
`,
  contextInfo: context(m.sender, img)
}, { quoted: reply_status });
}
handler.usage = ["سكريبت"];
handler.category = "group";
handler.command = ["سكريبت", "سورس", "sc"];

export default handler;