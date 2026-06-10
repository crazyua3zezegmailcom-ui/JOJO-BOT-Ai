const test = async (m, { conn, bot }) => {
  m.react("🟢");

  try {
    await conn.msgUrl(m.chat, "♡゙ Stop the bot...", {
      title: "𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 ~ 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 𝘣𝘰𝘵",
      body: "𝑇𝒉𝑒 𝑏𝑜𝑡 𝑖𝑠 𝑠𝑖𝑚𝑝𝑙𝑒 𝑡𝑜 𝑚𝑜𝑑𝑖𝑓𝑦",
      img: "https://g.top4top.io/p_3700yob0b1.jpg",
      big: false
    });
  } catch {
    await m.reply("♡゙ Stop the bot...");
  }

  setTimeout(() => {
    bot.stop();
  }, 1000);
};

test.category = "owner";
test.command = ["ايقاف", "stop"];
test.owner = true;
export default test;
