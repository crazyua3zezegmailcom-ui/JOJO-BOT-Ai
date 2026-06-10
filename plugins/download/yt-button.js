import { fetchWithTimeout, showTyping } from '../../system/perf.js';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply("💙 ~ اكتب نص الفيديو او الاغنيه ~ ❤️");

    await m.react('⏳');
    await showTyping(conn, m.chat);

    let data;
    try {
        const res = await fetchWithTimeout(
            `https://emam-api.web.id/home/sections/Search/api/YouTube/search?q=${encodeURIComponent(text)}`,
            10_000
        );
        const json = await res.json();
        data = json.data;
    } catch {
        await m.react('❌');
        return m.reply('❌ تعذّر البحث — حاول مرة ثانية');
    }

    if (!data?.[0]) {
        await m.react('❌');
        return m.reply('❌ مفيش نتيجة — جرب كلمات تانية');
    }

    const { title, image, timestamp: time, url } = data[0];

    await conn.sendButton(m.chat, {
        imageUrl: image,
        bodyText: `${title} ╎ ${time}`,
        footerText: "🕸️ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 ~ 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 🕸️",
        buttons: [
            { name: "quick_reply", params: { display_text: "🎼 ╎ تـحـمـيـل صـوت", id: `.يوت_اغنيه ${url}` } },
            { name: "quick_reply", params: { display_text: "🎬 ╎ تـحـمـيـل فـيـديـو", id: `.يوتيوب ${url}` } }
        ],
        mentions: [m.sender],
        newsletter: { name: "『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』", jid: "120363428186936884@newsletter" },
        interactiveConfig: { buttons_limits: 10, list_title: "𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 🎀", button_title: "𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 🎀", canonical_url: url }
    }, m);

    await m.react('✅');
};

handler.usage = ["فيديو", "اغنيه", "شغل"];
handler.category = "downloads";
handler.command = ["اغنيه", "فيديو", "اغنية", "play", "video"];

export default handler;
