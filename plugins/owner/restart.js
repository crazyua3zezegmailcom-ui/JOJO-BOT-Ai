const test = async (m, { conn, bot }) => {
  m.react("🟢");

  try {
    await conn.msgUrl(m.chat, "♡゙ 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 is restarting...", {
      title: "𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 ~ 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 𝘣𝘰𝘵",
      body: "𝑇𝒉𝑒 𝑏𝑜𝑡 𝑖𝑠 𝑠𝑖𝑚𝑝𝑙𝑒 𝑡𝑜 𝑚𝑜𝑑𝑖𝑓𝑦",
      img: "https://g.top4top.io/p_3700yob0b1.jpg",
      big: false
    });
  } catch {
    await m.reply("♡゙ 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 is restarting...");
  }

  setTimeout(() => {
    bot.restart();
  }, 1000);
};

test.usage = ["رستارت"];
test.category = "owner";
test.command = ["رستارت", "restart"];
test.owner = true;
export default test;
