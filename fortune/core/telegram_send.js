// telegram_send.js - 텔레그램 봇 메시지 발송
//
// 사용:
//   TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=xxx node send.mjs

export async function sendTelegram(message, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN || options.token;
  const chatId = process.env.TELEGRAM_CHAT_ID || options.chatId;

  if (!token || !chatId) {
    console.error("❌ TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 환경변수 필요");
    console.error("   설정 방법:");
    console.error("   1) @BotFather에게 /newbot → 봇 토큰 받기");
    console.error("   2) 봇과 채팅 시작 → @userinfobot에게 'start' → chat_id 받기");
    console.error("   3) export TELEGRAM_BOT_TOKEN=xxx; export TELEGRAM_CHAT_ID=xxx");
    return { ok: false, error: "missing_credentials" };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
