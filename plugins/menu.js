import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { fetchWithTimeout, showTyping } from '../system/perf.js';

const execAsync = promisify(exec);

const CATEGORIES = [
    [1,  'التـحـمـيـل',            'downloads', '📂'],
    [2,  'الـمـجـمـوعـات',         'group',     '🐞'],
    [3,  'الـمـلـصـقـات',          'sticker',   '🌄'],
    [4,  'الـمـطـوريـن',           'owner',     '👑'],
    [5,  'امـثـلـه',               'example',   '✳️'],
    [6,  'الـادوات',               'tools',     '🚀'],
    [7,  'الـبـحـث',               'search',    '🌐'],
    [8,  'الادمــن',               'admin',     '👨🏻‍⚖️'],
    [9,  'الالــعـاب',             'games',     '🎮'],
    [10, 'الچيف',                  'gif',       '✴️'],
    [11, 'الـبــنـك',              'bank',      '💰'],
    [12, 'الـذكـاء الاصـطـنـاعـي', 'ai',        '🤖'],
    [13, 'الـبـوتـات الـفـرعـي',   'sub',       '♥️'],
    [14, 'مـعـلومـات الـبـوت',     'info',      '🗃️'],
    [15, 'الـالــقــاب',           'nicknames', '🫯'],
    [16, 'الـلـوجـوهــات',         'logos',     '🎡'],
    [17, 'تـغـيـر الاصـوات',       'voices',    '📢'],
    [18, 'أخــرى',                 'other',     '🌹']
];

const NEWSLETTER = {
    newsletterJid: '120363428186936884@newsletter',
    newsletterName: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
    serverMessageId: 0
};

const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb82IJr3gvWS72JEDB1e';
const DEV_NAME    = '𝐶𝑟𝑎𝑧𝑦';
const DEV_NUM1    = '15877004085';
const DEV_NUM2    = '201214057674';
const DEV_IMG     = 'https://i.postimg.cc/2yXd03jy/IMG-20260511-WA0366.jpg';
const VOICE_URL   = 'https://media1.vocaroo.com/mp3/1m9sSiyVOX0B';

const getCatByKey = key => CATEGORIES.find(c => c[2] === key);

const getImg = (bot) => {
    const { images } = bot.config.info;
    return Array.isArray(images) ? images[Math.floor(Math.random() * images.length)] : images;
};

const context = (jid) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: NEWSLETTER
});

async function convertToOggOpus(inputBuffer) {
    const tmpIn  = path.join(tmpdir(), `voice_in_${Date.now()}.mp3`);
    const tmpOut = path.join(tmpdir(), `voice_out_${Date.now()}.ogg`);
    try {
        fs.writeFileSync(tmpIn, inputBuffer);
        await execAsync(`ffmpeg -y -i "${tmpIn}" -c:a libopus -b:a 64k -ar 48000 -ac 1 "${tmpOut}"`);
        return fs.readFileSync(tmpOut);
    } finally {
        if (fs.existsSync(tmpIn))  fs.unlinkSync(tmpIn);
        if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    }
}

const menu = async (m, { conn, bot, args }) => {
    const cmds   = await bot.getAllCommands();
    const sub    = args[0];

    /* ─── زر قناة البوت ─── */
    if (sub === 'قناه') {
        await conn.sendMessage(m.chat, {
            text: `╭─┈─┈─┈─⟞📢⟝─┈─┈─┈─╮\n┃ *قـنـاة البـوت الرسمية*\n╰─┈─┈─┈─⟞📢⟝─┈─┈─┈─╯\n\n${CHANNEL_URL}\n\n> *اضغط الرابط للانضمام للقناة* 👆`
        }, { quoted: m });
        return;
    }

    /* ─── زر المطور ─── */
    if (sub === 'مطور') {
        const vcard1 = `BEGIN:VCARD\nVERSION:3.0\nFN:${DEV_NAME}\nTEL;type=CELL;waid=${DEV_NUM1}:+${DEV_NUM1}\nEND:VCARD`;
        const vcard2 = `BEGIN:VCARD\nVERSION:3.0\nFN:${DEV_NAME}\nTEL;type=CELL;waid=${DEV_NUM2}:+${DEV_NUM2}\nEND:VCARD`;

        const caption = `
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ╔══「 المطور 」══╗ 🌌✨
        ║  👑 Developer Info  ║
✨🌌 ╚══════════════════════╝ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*

👑 اسم المطور: ${DEV_NAME}

📱 رقم 1: +${DEV_NUM1} 
📱 2: +${DEV_NUM2}

🔗 قناة البوت:
${CHANNEL_URL}

💬 جروب الدعم:
https://chat.whatsapp.com/CDa5fFK3mLhHJYMLxHBQey?s=cl&p=a&mlu=1

*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ~ 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 ~ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*`.trim();

        await showTyping(conn, m.chat);

        // إرسال الصورة والكروت بالتوازي
        await Promise.all([
            conn.sendMessage(m.chat, {
                image: { url: DEV_IMG },
                caption,
                mentions: [`${DEV_NUM1}@s.whatsapp.net`, `${DEV_NUM2}@s.whatsapp.net`]
            }, { quoted: m }),
            conn.sendMessage(m.chat, {
                contacts: {
                    displayName: DEV_NAME,
                    contacts: [{ vcard: vcard1 }, { vcard: vcard2 }]
                }
            }, { quoted: m })
        ]);

        try {
            const voiceRes = await fetchWithTimeout(VOICE_URL, 20_000, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://vocaroo.com/'
                }
            });
            let mp3Buffer = Buffer.from(await voiceRes.arrayBuffer());
            let oggBuffer = await convertToOggOpus(mp3Buffer);
            mp3Buffer = null;

            await conn.sendMessage(m.chat, {
                audio: oggBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: m });

            oggBuffer = null;
        } catch (e) {
            console.error('Voice send error:', e.message);
        }
        return;
    }

    /* ─── زر الأقسام: يعرض الـ 18 قسم كأزرار ─── */
    if (sub === 'اقسام') {
        const now           = new Date();
        const uptimeSeconds = process.uptime();
        const uptime = [
            Math.floor(uptimeSeconds / 3600),
            Math.floor((uptimeSeconds % 3600) / 60),
            Math.floor(uptimeSeconds % 60)
        ].map(n => String(n).padStart(2, '0')).join(':');
        const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const bodyText = `
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ╔══「 قـائـمـة الأقـسـام 📂 」══╗ 🌌✨
        ║  🔐 · 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 · 🔐  ║
✨🌌 ╚══════════════════════╝ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*

╭─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╮
┃ ⌯🚀︙ التشغيل → ${uptime}
┃ ⌯👾︙ التاريخ → ${date}
┃ ⌯🕐︙ الوقت  → ${time}
╰─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╯

> *اضغط على القسم الذي تريده 👇*`.trim();

        await conn.sendButton(m.chat, {
            bodyText,
            footerText: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
            buttons: CATEGORIES.map(c => ({
                name: 'quick_reply',
                params: { display_text: `${c[3]} ${c[1]}`, id: `.اوامر ${c[2]}` }
            })),
            mentions: [m.sender],
            newsletter: { name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』', jid: '120363428186936884@newsletter' },
            interactiveConfig: {
                buttons_limits: 1,
                list_title: 'الأقسام',
                button_title: 'اختار قسم',
                canonical_url: 'https://example.com'
            }
        }, m);
        return;
    }

    /* ─── اختيار قسم معين بالـ key ─── */
    if (sub) {
        const cat = getCatByKey(sub);
        if (!cat) return m.reply('*❌ القسم مش موجود*');

        const catCmds = cmds.filter(c => (c.category || 'other') === cat[2] && c.usage?.length);
        if (!catCmds.length) return m.reply('*❌ القسم فاضي*');

        const cmdsList = catCmds.map(c => `${cat[3]}  .${c.usage.join(`\n${cat[3]}  .`)}`).join('\n');

        const catCaption = `
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ╔══「 قـسـم ${cat[1]} ${cat[3]} 」══╗ 🌌✨
        ║  🔐 · 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 · 🔐  ║
✨🌌 ╚══════════════════════╝ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*

${cmdsList}

*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ~ 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 ~ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*

> *رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا*`.trim();

        const img = getImg(bot);
        try {
            await conn.sendMessage(m.chat, {
                image: { url: img },
                caption: catCaption,
                contextInfo: context(m.sender)
            }, { quoted: m });
        } catch (_) {
            await conn.sendMessage(m.chat, {
                text: catCaption,
                contextInfo: context(m.sender)
            }, { quoted: m });
        }
        return;
    }

    /* ─── الرسالة الرئيسية: 3 أزرار ─── */
    const now           = new Date();
    const uptimeSeconds = process.uptime();
    const uptime = [
        Math.floor(uptimeSeconds / 3600),
        Math.floor((uptimeSeconds % 3600) / 60),
        Math.floor(uptimeSeconds % 60)
    ].map(n => String(n).padStart(2, '0')).join(':');
    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const bodyText = `
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
✨🌌 ╔══「 قـائـمـة الأوامـر 🎪 」══╗ 🌌✨
        ║  🔐 · 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』 · 🔐  ║
✨🌌 ╚══════════════════════╝ 🌌✨
꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫•°•❁•°•꙰۪۫
·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙
*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*

﴿ الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ
أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾

╭─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╮
┃ ⌯🚀︙ التشغيل → ${uptime}
┃ ⌯👾︙ التاريخ → ${date}
┃ ⌯🕐︙ الوقت  → ${time}
╰─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╯

*•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•**•.¸♡¸.•*

> *اختار من الأزرار أدناه 👇*`.trim();

    await conn.sendButton(m.chat, {
        bodyText,
        footerText: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
        buttons: [
            {
                name: 'quick_reply',
                params: { display_text: '📂 الأوامر والأقسام', id: '.اوامر اقسام' }
            },
            {
                name: 'quick_reply',
                params: { display_text: '📢 قناة البوت', id: '.اوامر قناه' }
            },
            {
                name: 'quick_reply',
                params: { display_text: '👑 المطور', id: '.اوامر مطور' }
            }
        ],
        mentions: [m.sender],
        newsletter: { name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』', jid: '120363428186936884@newsletter' },
        interactiveConfig: {
            buttons_limits: 3,
            list_title: 'القائمة',
            button_title: 'اختار',
            canonical_url: CHANNEL_URL
        }
    }, m);
};

menu.command = ['الاوامر', 'القائمة', 'menu', 'اوامر'];
export default menu;
