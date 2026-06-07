import dbConnect from "@/utils/dbConnect";
import Setting from "@/models/Setting";

export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    await dbConnect();
    const tokenSetting = await Setting.findOne({ key: "telegramBotToken" });
    const chatIdSetting = await Setting.findOne({ key: "telegramChatId" });
    const token = tokenSetting?.value;
    const chatId = chatIdSetting?.value;

    if (!token || !chatId) {
      console.warn("Telegram bot token or chat ID is not configured.");
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error("Telegram API Error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("sendTelegramNotification Error:", error);
    return false;
  }
}
