import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Report from "@/models/Report";
import { sendTelegramNotification } from "@/utils/telegram";

// GET /api/reports - Fetch all abuse reports for Admin panel
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const reports = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    console.error("API GET /api/reports Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/reports - File a new report (triggers Telegram bot notification)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { type, targetId, targetName, reporter, reason } = body;

    if (!type || !targetId || !targetName || !reporter || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newReport = new Report({
      type,
      targetId,
      targetName,
      reporter,
      reason,
      status: "pending"
    });

    await newReport.save();

    // Trigger Telegram notification
    const alertMessage = `⚠️ *KHIẾU NẠI MỚI ĐƯỢC GỬI*\n\n` +
      `- *Loại vi phạm*: ${type === "app" ? "Ứng dụng" : "Bài viết timeline"}\n` +
      `- *Đối tượng*: ${targetName}\n` +
      `- *Người báo cáo*: ${reporter}\n` +
      `- *Lý do khiếu nại*: ${reason}\n\n` +
      `Vui lòng truy cập Dashboard để xem chi tiết và xử lý.`;
    
    await sendTelegramNotification(alertMessage).catch(err => 
      console.error("Telegram notification failed to send:", err)
    );

    return NextResponse.json({ success: true, data: newReport }, { status: 201 });
  } catch (error: any) {
    console.error("API POST /api/reports Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/reports - Update report status (e.g. resolve report)
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID và Trạng thái là bắt buộc" }, { status: 400 });
    }

    const updated = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Không tìm thấy báo cáo vi phạm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("API PATCH /api/reports Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
