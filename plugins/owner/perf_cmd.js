import { getStats } from '../../system/perf.js';

const handler = async (m, { conn }) => {
    const s = getStats();

    const msg = `⚡ *تقرير الأداء*
─────────────────
أوامر شغالة الآن  : ${s.active} / 5
قوائم انتظار      : ${s.queued} مستخدم
Worker نشط        : ${s.workers}
─────────────────
متوسط الاستجابة   : ${s.avg}ms
أسرع استجابة      : ${s.min}ms
أبطأ استجابة      : ${s.max}ms
─────────────────
الذاكرة المستخدمة : ${s.mem}MB
حجم الـ Cache      : ${s.cacheItems} عنصر
حجم الـ Session    : ${s.ses}MB
ملفات /tmp         : ${s.tmp} ملف
─────────────────
> 『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』`;

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

handler.usage    = ['أداء'];
handler.category = 'owner';
handler.command  = ['أداء', 'perf', 'stats'];
handler.ownerOnly = true;

export default handler;
