import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    const update = await request.json()

    // Handle different types of Telegram updates
    if (update.message) {
      const chatId = update.message.chat.id
      const text = update.message.text

      // Handle bot commands
      if (text === "/start") {
        await sendMessage(
          chatId,
          `🌟 Welcome to Guardian Angel LISA! 🌟\n\n` +
            `Help Lisa save lost souls and earn LISA tokens!\n\n` +
            `🎮 Play Game: ${process.env.TELEGRAM_BOT_URL || "https://t.me/LisaToken_Bot"}/game\n` +
            `💎 Earn LISA tokens through mining and adventures\n` +
            `⚔️ Fight demons and save souls in RPG mode\n\n` +
            `Type /game to start playing!`,
          botToken
        )
      } else if (text === "/game") {
        await sendMessage(chatId, "Launch the Guardian Angel LISA game to start mining LISA tokens!", botToken)
      }
    }

    // Handle callback queries from inline keyboards
    if (update.callback_query) {
      const callbackQuery = update.callback_query
      const chatId = callbackQuery.message.chat.id

      // Answer callback query
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: "Action processed!",
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function sendMessage(chatId: number, text: string, botToken: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    })
  } catch (error) {
    console.error("Failed to send Telegram message:", error)
  }
}
