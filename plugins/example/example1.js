/* 
by: VA ~ 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕
*/

const example = async (m, { conn }) => {

conn.msgUrl(m.chat,
  '*🔥 Special Offer*',
  {
    img: 'https://example.com/promo.jpg',
    title: '50% OFF',
    body: 'Limited time',
    big: true,
    mentions: ['2011270847590@s.whatsapp.net', '201111111111@s.whatsapp.net'],
    newsletter: {
      name: '『 𝑮𝒐𝒈𝒐 𖠌 𝑩𝒐𝒕 』',
      jid: '120363428186936884@newsletter'
    }
  },
  m
)

};

example.usage = ["تست1"]


/* ↓ قسم الأمر ↓ */
example.category = "example"


/* ↓ استخدم الأوامر ↓ */
example.command = ["تست1"] 


/* ↓ بتعمل ايقاف ل الأمر ↓ */
example.disabled = false // لو عملتها true بيشتغل ب بدايه لو خليتها false بيشتغل بدون بدايه 

/* ↓ استخدام الأمر بعد ثانيه من الاستخدام لمنع الاسبام ↓ */
example.cooldown = 1000; // تقدر تزود الثواني 


/* ↓ استخدام الأمر ب بدايه أو لا ↓ */
example.usePrefix = false; // لو عملتها true الأمر هيبقي من غير بدايه 

export default example;