const handler = async (m, { conn }) => {
  const start = process.hrtime.bigint();
  await conn.sendMessage(m.chat, { text: "🏓 msg test" });
  const end = process.hrtime.bigint();
  const ping = Number(end - start) / 1e6;
  const txt = `⚡ سرعة البوت: ${ping.toFixed(2)}ms`;

  try {
    await conn.msgUrl(m.chat, txt, {
      img: "https://i.postimg.cc/KjnFN3Dn/IMG-20260511-WA0363.jpg",
      title: "𝐒𝐩𝐞𝐞𝐝 / 𝐓𝐞𝐬𝐭",
      body: "𝐓𝐞𝐬𝐭𝐢𝐧𝐠 𝐭𝐡𝐞 𝐛𝐨𝐭'𝐬 𝐬𝐩𝐞𝐞𝐝: 𝐈𝐬 𝐢𝐭 𝐟𝐚𝐬𝐭 𝐨𝐫 𝐧𝐨𝐭?",
      newsletter: {
        name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        jid: '120363428186936884@newsletter'
      },
      big: false
    }, global.reply_status);
  } catch {
    await m.reply(txt);
  }
};

handler.command = ["بنج", "ping"];
handler.category = "info";
handler.usage = ["بنج"];
export default handler;
