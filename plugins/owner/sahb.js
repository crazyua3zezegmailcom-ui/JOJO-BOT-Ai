const handler = async (m, { conn, isBotAdmin }) => {
  const from = m.chat;

  if (!m.isGroup) return m.reply("❌ الأمر للمجموعات فقط");
  if (!isBotAdmin) return m.reply("❌ البوت لازم يكون مشرف");

  try {
    await conn.sendMessage(from, { text: "*_تم سحب البار براعايه كريزي ي كسمك وجاري طرد الكل 🫦_*" });

    await conn.groupUpdateSubject(from, "تم السحب برعاية كريزي ي كسمك 🫦");
    await conn.groupUpdateDescription(from, `لينك جروب المطور 🔥👇\nhttps://chat.whatsapp.com/CDa5fFK3mLhHJYMLxHBQey?s=cl&p=a&mlu=1`);
    await conn.groupParticipantsUpdate(from, [m.sender], "promote");

    let metadata = await conn.groupMetadata(from);
    let participants = metadata.participants;
    let botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    for (let participant of participants) {
      if (participant.id !== botId && participant.id !== m.sender) {
        try {
          await conn.groupParticipantsUpdate(from, [participant.id], "remove");
          await new Promise((resolve) => setTimeout(resolve, 800));
        } catch (e) {
          console.log("فشل طرد:", participant.id);
        }
      }
    }

    await conn.groupSettingUpdate(from, "announcement");
    await conn.groupSettingUpdate(from, "locked");

    await conn.sendMessage(from, { text: "*_تم سحب الجروب وطرد الجميع بنجاح 🫦_*" });

  } catch (err) {
    console.error(err);
    m.reply("❌ حدث خطأ أثناء تنفيذ العملية");
  }
};

handler.help = ["سحب"];
handler.tags = ["owner"];
handler.command = /^(سحب|sahb)$/i;
handler.owner = true;

export default handler;
