import { createSticker } from "../../system/utils.js";
import { runConcurrent, showTyping } from "../../system/perf.js";

const test = async (m, { conn, bot }) => {
  if (!m.quoted) return m.reply("❤️ ~ يرجى الرد على صورة أو فيديو لتحويله إلى ملصق ~ 💙");

  // رد فوري
  await m.react('⏳');
  await showTyping(conn, m.chat);

  runConcurrent(m.sender, m.chat, async () => {
    try {
      const { pack, author } = bot.config.info.copyright;
      const q = await m.quoted;
      let buffer = await createSticker(await q.download(), { mime: q.mimetype, pack, author });

      await conn.sendMessage(
        m.chat,
        { sticker: buffer },
        { quoted: reply_status }
      );

      buffer = null;
      await m.react('✅');
    } catch {
      await m.react('❌');
      await m.reply('❌ تعذّر إنشاء الملصق — جرّب مرة ثانية');
    }
  }, conn);
};

test.usage = ["ملصق"];
test.command = ["ملصق", "s"];
test.category = "sticker";
export default test;
