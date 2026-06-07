import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import App from "@/models/App";

const TELEGRAM_BOT_TOKEN = "8304432515:AAFsYK5T_6TBw38y3V4ye6P7ZL-g14vdlzo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Telegram Webhook received update:", JSON.stringify(body, null, 2));

    const message = body.message;
    if (!message || !message.text || !message.chat) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const chatId = message.chat.id;

    if (text.startsWith("/start dl_")) {
      const appSlug = text.substring(10).trim();
      await dbConnect();

      // Find the app in database
      const app = await App.findOne({ id: appSlug });

      if (app && app.telegramFileId) {
        // Send the document directly using the saved file_id
        const sendDocRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            document: app.telegramFileId,
            caption: `📦 *Tệp cài đặt của ứng dụng ${app.name} (v${app.version})*\n\n👤 Tác giả/Nhà phát triển: *${app.developer}*\n🖥️ Nền tảng: *${app.platform.toUpperCase()}*\n📁 Danh mục: *${app.category}*\n⚡ Tải từ: Rổ Ứng Dụng`,
            parse_mode: "Markdown",
          }),
        });

        const resData = await sendDocRes.json();
        console.log("Send document Telegram API response:", resData);
      } else {
        // App not found or missing file ID
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: `❌ Không tìm thấy tệp tin cài đặt cho mã ứng dụng "${appSlug}" trên Rổ Ứng Dụng. Vui lòng kiểm tra lại liên kết hoặc liên hệ admin.`,
          }),
        });
      }
    } else if (text.startsWith("/start") || text.toLowerCase() === "/help") {
      // Welcome message
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `👋 *Xin chào! Tôi là Trợ lý Tải file của Rổ Ứng Dụng.*\n\nTôi giúp phân phối các tệp tin ứng dụng có dung lượng lớn an toàn và bảo mật thông qua chat riêng tư.\n\n👉 Vui lòng truy cập website và chọn **Tải xuống** để nhận file cài đặt tương ứng tại đây nhé!`,
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
