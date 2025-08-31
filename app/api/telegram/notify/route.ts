import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    const { chatId, message, type } = await request.json()

    let notificationText = ""

    switch (type) {
      case "achievement":
        notificationText = `🏆 Achievement Unlocked!\n\n${message}`
        break
      case "purchase":
        notificationText = `💎 Purchase Successful!\n\n${message}`
        break
      case "mining":
        notificationText = `⛏️ Mining Update!\n\n${message}`
        break
      case "rpg":
        notificationText = `🪽 Guardian Angel Lisa Update!\n\n${message}`
        break
      default:
        notificationText = message
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: notificationText,
        parse_mode: "HTML",
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification sending failed:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
