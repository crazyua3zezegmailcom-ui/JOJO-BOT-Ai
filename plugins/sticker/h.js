import { createSticker } from "../../system/utils.js";

const test = async (m, { conn, args }) => {
  if (!m.quoted) return m.reply("❤️ ~ يرجى الرد على ملصق ~ 💙");
  
  let [pack, author] = args.join(" ").split(" | ");
  
  if (!args.length) {
    return m.reply("📝 *الاستخدام الصحيح:*\n\n.حقوق اسم الباك | اسم المؤلف\n\n*مثال:*\n`.حقوق 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 | 2010`");
  }
  
  if (!pack) pack = "VA";
  if (author === undefined) author = null;
  
  const q = await m.quoted;
  
  const buffer = await createSticker(await q.download(), { mime: q.mimetype, pack, author });

  await conn.sendMessage(
    m.chat,
    { sticker: buffer, contextInfo: context(m.sender) },
    { quoted: global.reply_status }
  );
};

test.usage = ["حقوق نص | نص"];
test.command = ["حقوق"];
test.category = "sticker";
export default test;

const context = (jid) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363428186936884@newsletter',
        newsletterName: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        serverMessageId: 0
    }
});