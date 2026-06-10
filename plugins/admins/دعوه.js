const handler = async (m, { conn, text }) => {
    const chatId = m.chat;

    if (!chatId.endsWith('@g.us'))
        return m.reply('🚫 هذا الأمر للجروبات فقط!');

    if (!m.isAdmin && !m.isOwner)
        return m.reply('🚫 هذا الأمر للأدمن فقط!');

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
        const groupMeta = await conn.groupMetadata(chatId);

        // ─── أضف الشخص مباشرة ───
        const result = await conn.groupParticipantsUpdate(chatId, [targetJid], 'add');

        const status = result?.[0]?.status;

        if (status === '200' || status === 200) {
            await m.reply(
                `✅ *تم إضافة العضو!*\n\n` +
                `👤 : @${targetJid.split('@')[0]}\n` +
                `📌 اسم الجروب: ${groupMeta.subject}`
            );
        } else if (status === '403') {
            // مش قادر يضيفه مباشرة — ابعت دعوة
            const inviteCode = await conn.groupInviteCode(chatId);
            await conn.sendMessage(targetJid, {
                text:
                    `『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』\n\n` +
                    `📌 *${groupMeta.subject}*\n` +
                    `🔗 https://chat.whatsapp.com/${inviteCode}\n\n` +
                    `⏳ صلاحية الدعوة: 24 ساعة`
            });
            await m.reply(
                `📨 *تم إرسال دعوة للعضو*\n` +
                `👤 : @${targetJid.split('@')[0]}\n` +
                `_(الشخص محتاج يوافق على الإضافة)_`
            );
        } else {
            await m.reply(`❌ فشل الإضافة\nكود الحالة: ${status}`);
        }

    } catch (e) {
        const errMsg = e?.message || '';
        console.error('[invite]', e);
        if (errMsg.includes('not-authorized'))
            return m.reply('❌ البوت مش أدمن — حطه أدمن عشان يقدر يضيف');
        if (errMsg.includes('not found') || errMsg.includes('404'))
            return m.reply('❌ الرقم ده مش موجود على واتساب');
        return m.reply(`❌ فشل\n${errMsg}`);
    }
};

handler.command  = ['دعوه', 'دعوة', 'invite'];
handler.usage    = ['دعوه'];
handler.category = 'admin';
handler.group    = true;
handler.admin    = true;
handler.botAdmin = true;

export default handler;