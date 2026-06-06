// ===== دالة حساب المسافة بين كلمتين (Levenshtein Distance) =====
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// ===== دالة البحث عن أقرب trigger =====
// threshold: نسبة التشابه المطلوبة (0.75 = 75% تشابه)
function findBestMatch(text, triggers, threshold = 0.75) {
  if (!text) return null;
  const input = text.trim().toLowerCase();

  // أولاً: تطابق تام
  if (triggers[input]) return triggers[input];
  if (triggers[text.trim()]) return triggers[text.trim()];

  let bestKey = null;
  let bestScore = 0;

  for (const key of Object.keys(triggers)) {
    const normalizedKey = key.trim().toLowerCase();
    const maxLen = Math.max(input.length, normalizedKey.length);
    if (maxLen === 0) continue;

    const dist = levenshtein(input, normalizedKey);
    const score = 1 - dist / maxLen;

    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestKey = key;
    }
  }

  return bestKey ? triggers[bestKey] : null;
}

export default async function before(m, { conn, bot }) {
  const triggers = {
    "السلام عليكم": ["*وعليكم السلام ورحمة الله وبركاته*", "*❤️ وعليكم السلام منور يغالي *"],
    "تست": ["*_هاي عمو ☺️_*", "*_أمرني أمر 🌚_*"],
    "هلا": ["*_هلا_*", "*_هلا بيك_*", "*_يا هلا_*"],
    "بنت": ["*_مظه🧕_*"],
    "جوجو":["*_معاك ي قلبي 🌝_*", "*_أمرني ي مسكر💕_*"],
    "كريزي": ["*_🔥انتباه_* ‼️‼️‼️ تم اكتشاف اسم مطوري 🤗 رحبو به ي ساده"],
    "صباح الخير": ["*صباح النور*", "*صباح الورد*", "*صباح الفل*"],
    "مساء الخير": ["*مساء النور*", "*مساء الورد*", "*مساء الفل*", "*مساء الجوري*"],
    "مساء النور": ["*مساء الورد*", "*مساء الفل*", "*الله نورك*"]
  };

  const specialTriggers = {
    "201202894540": {
      "تست": ["*_موجود ي چنچونه ☺️_*", "*_أمرني ي قمر 💕_*"],
      "هلا": ["*_هلا بيكي ي روحي 🌹_*", "*_يا هلا بالغالية 💗_*"],
      "السلام عليكم": ["*_وعليكم السلام ي عسولة ❤️_*"],
      "صباح الخير": ["*_صباح الفل ي چنچونه 🌸_*", "*_صباح النور ي قمر 🌷_*"],
      "مساء الخير": ["*_مساء الورد ي حلوة 🌹_*", "*_مساء النور ي چنچونه 💕_*"],
      "بوت": ["*_تحت أمرك ي چنچونه 🥰 عشان تشوفي اوامر البوت ابعتي كلمه اوامر ومتنسيش تحطي قبل الكلمه نقطه زي كدا (.اوامر) ☺️_*"],
      "جوجو":[" *_معاكي ي چنچونه 🌝_*"],
      "هاي": ["*_هاي ي قلب البوت 💗_*"],
      "هاي ي بوت": ["*_هاي ي قلب البوت 💗_*"],
      "انا همشي بق": ["*_هتوحشيني ي قلبي مستني اشوفك تاني 🥺💕_*"],
      "انا هخرج": ["*_هتوحشيني ي قلبي مستني اشوفك تاني 🥺💕_*"],
      "باي": ["*_هتوحشيني ي قلبي مستني اشوفك تاني 🥺💕_*"],
      "باي ي بوت": ["*_هتوحشيني ي قلبي مستني اشوفك تاني 🥺💕_*"],
      "مين كريزي": ["*_آه صحيح أنتي تعرفيش اسمه الحركي، علي العموم قصدي علي عبدالله المطور ي مسكره 💕_*"],
      "كريزي مين": ["*_آه صحيح أنتي تعرفيش اسمه الحركي، علي العموم قصدي علي عبدالله المطور ي مسكره 💕_*"],
      "مين دا": ["*_آه صحيح أنتي تعرفيش اسمه الحركي، علي العموم قصدي علي عبدالله المطور ي مسكره 💕_*"],
      "لا دي عسل": ["*_ربنا يخليكي ليا ي قلبي 💗_*"],
      "عسل": ["*_ربنا يخليكي ليا ي قلبي 💗_*"],
      "لا دي مسكره": ["*_ربنا يخليكي ليا ي قلبي 💗_*"],
      "لا دي حلوه": ["*_ربنا يخليكي ليا ي قلبي 💗_*"],
      "لا دي جميله": ["*_ربنا يخليكي ليا ي قلبي 💗_*"],
      "عرفتيني منين": ["*_كريزي مش بيتكلم غير عليكي ي چنچونه 😂💕_*"],
      "تعرفيني منين": ["*_كريزي مش بيتكلم غير عليكي ي چنچونه 😂💕_*"],
      "مين قالك عليا": ["*_كريزي مش بيتكلم غير عليكي ي چنچونه 😂💕_*"],
      "عرفتيني ازاي": ["*_كريزي مش بيتكلم غير عليكي ي چنچونه 😂💕_*"],
      "كان بيقول عليا اي بق": ["*_قال كل حاجة حلوه في الدنيا عنك ي چنچونه، سامحيني مش هعرف اقولك هو قال اي بس اكيد لو قال حاجة معجبتنيش عنك مكنتش هسكتله 💕_*"],
      "كان بيقول عليا اي": ["*_قال كل حاجة حلوه في الدنيا عنك ي چنچونه، سامحيني مش هعرف اقولك هو قال اي بس اكيد لو قال حاجة معجبتنيش عنك مكنتش هسكتله 💕_*"],
      "قال عليا اي": ["*_قال كل حاجة حلوه في الدنيا عنك ي چنچونه، سامحيني مش هعرف اقولك هو قال اي بس اكيد لو قال حاجة معجبتنيش عنك مكنتش هسكتله 💕_*"],
      "قال اي عليا": ["*_قال كل حاجة حلوه في الدنيا عنك ي چنچونه، سامحيني مش هعرف اقولك هو قال اي بس اكيد لو قال حاجة معجبتنيش عنك مكنتش هسكتله 💕_*"],
      "كان بيتكلم يقول اي": ["*_قال كل حاجة حلوه في الدنيا عنك ي چنچونه، سامحيني مش هعرف اقولك هو قال اي بس اكيد لو قال حاجة معجبتنيش عنك مكنتش هسكتله 💕_*"],
      "كان بيتكلم بيقول اي عليا": ["*_قال كل حاجة حلوه في الدنيا عنك ي چنچونه، سامحيني مش هعرف اقولك هو قال اي بس اكيد لو قال حاجة معجبتنيش عنك مكنتش هسكتله 💕_*"]
    }
  };

  const devNumber = "584261208048";

  const devTriggers = {
    "اقعد ساكت": async () => {
      await m.reply("*_يعم وأنا بشوف الحلو كل يوم 😂_*\n*_ما أنا طول الوقت بشوف العيال النوتي اللي أنتي حاتطني معاهم 🌚_*");
      await new Promise(r => setTimeout(r, 1500));
      await m.reply("*_ي لو كلو يبق حلو زي چنچونه 💕_*");
    },
    "مش كفايه كدا": async () => {
      await m.reply("*_عايز أقعد معاها حبة كمان 🥺💕_*");
    },
    "لا": async () => {
      await m.reply("*_عايز أشوفك تاني ي چنچونه 😔🌹_*");
    },
    "ماشي": async () => {
      await m.reply("*_ميرسي طول عمرك ذوق 💗✨_*");
    },
    "كام جثه النهاردة ي جوجو": async () => {
      await m.reply("*_50 ي عمو ارحم بق شويه 😂🌚_*");
    },
    "مين اكتر حد شوفتيه وحبيتيه": async () => {
      await m.reply("*_بصراحه چنچونه المسكره دي طريقتها تحفه وكلامها معايا لطيف مش زيك 😂💕_*");
      await new Promise(r => setTimeout(r, 1500));
      await m.reply("*_حتا لو مكنتش شوفتها حبيتها برضو من طريقيت كلامك عليها 🥺🌹_*");
    }
  };

  const senderNumber = m.sender?.replace(/@s\.whatsapp\.net.*/, "");

  // ===== تحقق لو المطور بيتكلم =====
  if (senderNumber === devNumber) {
    // جرب تطابق تام أولاً
    if (devTriggers[m.text]) {
      await devTriggers[m.text]();
      return false;
    }
    // جرب fuzzy على مفاتيح devTriggers
    const devKeys = Object.keys(devTriggers);
    let bestDevKey = null;
    let bestDevScore = 0;
    const inputDev = (m.text || "").trim().toLowerCase();
    for (const key of devKeys) {
      const normalizedKey = key.trim().toLowerCase();
      const maxLen = Math.max(inputDev.length, normalizedKey.length);
      if (maxLen === 0) continue;
      const dist = levenshtein(inputDev, normalizedKey);
      const score = 1 - dist / maxLen;
      if (score > bestDevScore && score >= 0.75) {
        bestDevScore = score;
        bestDevKey = key;
      }
    }
    if (bestDevKey) {
      await devTriggers[bestDevKey]();
      return false;
    }
  }

  // ===== تحقق لو رقم چنچونه =====
  if (senderNumber && specialTriggers[senderNumber]) {
    const userTriggers = specialTriggers[senderNumber];
    const replies = findBestMatch(m.text, userTriggers, 0.75);
    if (replies) {
      const ranReply = replies[Math.floor(Math.random() * replies.length)];
      await m.reply(ranReply);
    }
    return false;
  }

  // ===== الردود العادية للباقي =====
  const replies = findBestMatch(m.text, triggers, 0.75);
  if (replies) {
    const ranReply = replies[Math.floor(Math.random() * replies.length)];
    m.reply(ranReply);
  }

  return false;
}
