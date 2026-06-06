const CATEGORIES = [
    [1, 'التـحـمـيـل', 'downloads', '📂'],
    [2, 'الـمـجـمـوعـات', 'group', '🐞'],
    [3, 'الـمـلـصـقـات', 'sticker', '🌄'],
    [4, 'الـمـطـوريـن', 'owner', '🇩🇪'],
    [5, 'امـثـلـه', 'example', '✳️'],
    [6, 'الـادوات', 'tools', '🚀'],
    [7, 'الـبـحـث', 'search', '🌐'],
    [8, 'الادمــن', 'admin', '👨🏻‍⚖️'],
    [9, 'الالــعـاب', 'games', '🎮'],
    [10, 'الچيف', 'gif', '✴️'],
    [11, 'الـبــنـك', 'bank', '💰'],
    [12, 'الـذكـاء الاصـطـنـاعـي', 'ai', '🤖'],
    [13, 'الـبـوتـات الـفـرعـي', 'sub', '♥️'],
    [14, 'مـعـلومـات الـبـوت', 'info', '🗃️'],
    [15, 'الـالــقــاب', 'nicknames', '🫯'],
    [16, 'الـلـوجـوهــات', 'logos', '🎡'],
    [17, 'تـغـيـر الاصـوات', 'voices', '📢'],
    [18, 'أخــرى', 'other', '🌹']
];

const getCat = n => CATEGORIES.find(c => c[0] === n);

const getImg = (bot) => {
    const { images } = bot.config.info;
    return Array.isArray(images) ? images[Math.floor(Math.random() * images.length)] : images;
};

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

async function handler(m, { conn, bot, command, args }) {
    const selected = parseInt(args[0]);
    const now = new Date();
    const uptimeSeconds = process.uptime();
const hours = Math.floor(uptimeSeconds / 3600);
const minutes = Math.floor((uptimeSeconds % 3600) / 60);
const seconds = Math.floor(uptimeSeconds % 60);
const uptimeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (!selected && !args[0]) {
        const sections = [{
            title: "🌳 ~ الاقـسـام ~ 🪾",
            rows: CATEGORIES.map(c => ({
                title: `${c[0]} ~ ${c[1]} ${c[3]}`,
                description: `اضغط لعرض أوامر قسم ${c[1]}`,
                id: `.${command} ${c[0]}`
            }))
        }];

        const menuText = `
رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ
وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ
╭─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╮
┃ ⌯🍂︙ اهـلا → *[ @${m.sender.split("@")[0]} ]*
┃ ⌯🚀︙ الـتشـغـيـل → ${uptimeFormatted}
┃ ⌯👾︙ الـتـاريـخ → ${date} - ${time}
╰─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╯
> *_اختار قسم من القائمة عشان يبعتلك اوامر القسم_*`;
        
        await conn.sendButtonNormal(m.chat, {
            media: { url: "https://i.postimg.cc/VLdc7Tsp/IMG-20260511-WA0360.jpg" },
            mediaType: 'image',
            caption: menuText,
            buttons: [{
                name: "single_select",
                params: {
                    title: "🍂✨",
                    sections: sections
                }
            }],
            mentions: [m.sender],
            newsletter: {
                name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
                jid: '120363428186936884@newsletter'
            }
        }, global.reply_status);
        return;
    }

    const cat = getCat(selected);
    if (!cat) {
        await conn.sendMessage(m.chat, { text: '*❌ اختار رقم صحيح من 1 لـ 15*', contextInfo: context(m.sender, getImg(bot)) }, { quoted: m });
        return;
    }

    const cmds = await bot.getAllCommands();
    const categoryCmds = cmds.filter(c => c.category === cat[2]);
    
    if (!categoryCmds.length) {
        await conn.sendMessage(m.chat, { text: '*❌ القسم فاضي*', contextInfo: context(m.sender, getImg(bot)) }, { quoted: m });
        return;
    }

    const cmdsList = categoryCmds.map(c => `${cat[3]} /${c.usage?.join(`\n${cat[3]} /`)}`).join('\n');

    await conn.sendMessage(m.chat, { text: `
╭─┈─┈─┈─⟞${cat[3]}⟝─┈─┈─┈─╮
┃ *⌯︙ قـسـم ${cat[1]} ${cat[3]}*
╰─┈─┈─┈─⟞${cat[3]}⟝─┈─┈─┈─╯

${cmdsList}

╭─┈─┈─┈─⟞${cat[3]}⟝─┈─┈─┈─╮
┃ *⌯︙ ${bot?.config?.info?.nameBot || '𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕'}*
╰─┈─┈─┈─⟞${cat[3]}⟝─┈─┈─┈─╯
> *رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا*`.trim(), contextInfo: context(m.sender, getImg(bot)) }, { quoted: m });
}

handler.command = ['المهام'];
export default handler;