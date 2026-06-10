const handler = async (m, { conn, text }) => {
    const chatId = m.chat;

    if (!chatId.endsWith('@g.us'))
        return m.reply('🚫 هذا الأمر للجروبات فقط!');

    if (!m.isAdmin && !m.isOwner)
        return m.reply('🚫 هذا الأمر للأدمن فقط!');

    // ─── حدد الشخص المستهدف ───
    let targetJid = null;

    if (m.mentionedJid?.length > 0) {
        targetJid = m.mentionedJid[0];
    } else if (m.quoted) {
        targetJid = m.quoted.sender;
    } else if (text) {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (!cleaned) return m.reply('❌ اكتب الرقم بعد الأمر\nمثال: *.دعوه 201234567890*');
        targetJid = cleaned + '@s.whatsapp.net';
    } else {
        return m.reply(
            '❌ اكتب الرقم بعد الأمر أو منشن العضو أو ريبلاي\n\n' +
            'مثال: *.دعوه 201234567890*'
        );
    }

    try {
        // ─── جيب كود الدعوة ───
        const inviteCode = await conn.groupInviteCode(chatId);
        const groupMeta  = await conn.groupMetadata(chatId);

        // ─── ابعت الدعوة للشخص ───
        await conn.sendMessage(targetJid, {
            groupInviteMessage: {
                inviteCode,
                inviteExpiration: Math.floor(Date.now() / 1000) + 86400, // 24 ساعة
                groupJid: chatId,
                groupName: groupMeta.subject,
                jpegThumbnail: null,
                caption: `『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』`
            }
        });

        await m.reply(
            `✅ *تم إرسال الدعوة!*\n\n` +
            `👤 إلى: @${targetJid.split('@')[0]}\n` +
            `📌 اسم الجروب: ${groupMeta.subject}\n` +
            `⏳ صلاحية الدعوة: 24 ساعة`
        );

    } catch (e) {
        const errMsg = e?.message || '';
        if (errMsg.includes('not-authorized'))
            return m.reply('❌ البوت مش أدمن — حطه أدمن عشان يقدر يبعت دعوات');
        if (errMsg.includes('not found') || errMsg.includes('404'))
            return m.reply('❌ الرقم ده مش موجود على واتساب');
        return m.reply(`❌ فشل إرسال الدعوة\n${errMsg}`);
    }
};

handler.command  = ['دعوه', 'دعوة', 'invite'];
handler.usage    = ['دعوه'];
handler.category = 'admin';
handler.group    = true;
handler.admin    = true;
handler.botAdmin = true;

export default handler;
