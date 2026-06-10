let control = async (m, { command, text, conn, bot, participants }) => {
    try {
        const isBotOwner = (userId) => {
            if (!bot.config || !bot.config.owners) return false;
            return bot.config.owners.some(owner => 
                owner.jid === userId || owner.lid === userId
            );
        };

        const getUser = () => {
            if (m.quoted) return m.quoted.sender;
            if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
            if (text) return text + "@s.whatsapp.net";
            return null;
        };

        if (command === "ضيف") {
            let target = null;

            if (m.quoted) {
                target = m.quoted.sender;
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                target = m.mentionedJid[0];
            } else if (text) {
                // نظّف الرقم: اشيل +، مسافات، شرطات
                const cleaned = text.replace(/[^0-9]/g, '');
                if (!cleaned) return m.reply("❌ الرقم غلط — اكتب الأرقام بس بدون رموز");
                target = cleaned + "@s.whatsapp.net";
            }

            if (!target) return m.reply("❌ اكتب الرقم بعد الأمر أو منشن العضو أو ريبلاي");

            try {
                const results = await conn.groupParticipantsUpdate(m.chat, [target], 'add');
                const status  = results?.[0]?.status?.toString() || '';

                if (status === '200') return m.reply("*✅ تمت الإضافة*");
                if (status === '403') return m.reply("❌ الشخص ده ما بيسمحش حد يضيفه — استخدم *.دعوه* بدل كده");
                if (status === '408') return m.reply("❌ الرقم ده مش موجود على واتساب");
                if (status === '409') return m.reply("❌ العضو ده موجود في الجروب بالفعل");
                if (status === '500') return m.reply("❌ فشل — ممكن البوت مش أدمن أو الرقم غلط");
                return m.reply("*✅ تمت الإضافة*");
            } catch (e) {
                return m.reply("❌ فشلت الإضافة — جرب *.دعوه " + (text || '') + "* بدل كده");
            }
        }
        
        if (command === "انطر") {
            let user = getUser();
            if (!user) return m.reply("❌ منشن أو رد على العضو");
            
            if (isBotOwner(user) || user === conn.user.id) {
                m.reply("بتهزر ؟");
                return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }
            
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            return m.reply("*تم نطر العضو 🫦*");
        }
        
        if (command === "رفع") {
            let user = getUser();
            if (!user) return m.reply("❌ منشن أو رد على العضو");
            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
            return m.reply("✅ تم الرفع");
        }
        
        if (command === "خفض") {
            let user = getUser();
            if (!user) return m.reply("❌ منشن أو رد على العضو");
            await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
            return m.reply("✅ تم الخفض");
        }
        
    } catch (error) {
        await m.reply("❌ " + error.message);
    }
};

control.usage = ['ضيف',' انطر','رفع', 'خفض'];
control.command = ['ضيف', 'انطر', 'رفع', 'خفض'];
control.admin = true;
control.botAdmin = true;
control.category = "admin";
export default control;