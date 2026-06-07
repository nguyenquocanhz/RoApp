import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Setting from "@/models/Setting";

const DEFAULT_SETTINGS = [
  { key: "telegramBotToken", value: "" },
  { key: "telegramChatId", value: "" },
  { key: "maintenanceMode", value: false },
  { key: "eula", value: `## ĐIỀU KHOẢN SỬ DỤNG (EULA)

Chào mừng bạn đến với **Rổ Ứng Dụng**. Bằng cách sử dụng trang web này, bạn đồng ý với các điều khoản dưới đây:

1. **Quyền sở hữu trí tuệ**: Các ứng dụng, tập tin APK, IPA và mã nguồn được chia sẻ trên trang web này thuộc về nhà phát triển ban đầu của chúng. Chúng tôi chỉ chia sẻ với mục đích nghiên cứu và học tập học thuật.
2. **Trách nhiệm người dùng**: Bạn chịu hoàn toàn trách nhiệm đối với thiết bị của mình khi tải xuống và cài đặt các tập tin này. Chúng tôi khuyên bạn nên kiểm tra kỹ tệp tin trước khi mở.
3. **Nghiêm cấm hành vi phá hoại**: Nghiêm cấm tải lên các tập tin chứa mã độc, virus hoặc các nội dung lừa đảo người dùng khác.` },
  { key: "dmca", value: `## CHÍNH SÁCH BẢO VỆ BẢN QUYỀN (DMCA)

**Rổ Ứng Dụng** tôn trọng quyền sở hữu trí tuệ của người khác.

Nếu bạn là chủ sở hữu bản quyền của bất kỳ tài liệu nào được chia sẻ trên trang web này và muốn chúng tôi gỡ bỏ nó, vui lòng làm theo hướng dẫn:

1. Gửi email trực tiếp đến địa chỉ email hỗ trợ: **dmca@roapp.vn**.
2. Cung cấp liên kết (URL) của ứng dụng hoặc bài đăng vi phạm.
3. Cung cấp bằng chứng chứng minh bạn có quyền sở hữu hợp pháp đối với tài sản trí tuệ đó.

Chúng tôi sẽ tiến hành xác thực và gỡ bỏ nội dung vi phạm trong vòng **24 - 48 giờ làm việc**.` },
  { key: "seoTitle", value: "Rổ Ứng Dụng - Chia sẻ APK, IPA & Mã nguồn Website" },
  { key: "seoDescription", value: "Trang web chia sẻ tập tin APK Android, IPA iOS bẻ khóa và mã nguồn website Next.js, React, Laravel chất lượng cao, đã kiểm duyệt an toàn sạch virus 100%." },
  { key: "seoKeywords", value: "APK, IPA, Mã nguồn, Next.js, Source code, Tải game, Bảo mật" }
];

// GET /api/settings - Fetch all website configuration keys
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Check and seed default configuration keys
    const count = await Setting.countDocuments();
    if (count === 0) {
      await Setting.insertMany(DEFAULT_SETTINGS);
    }

    const settingsList = await Setting.find({});
    const config: Record<string, any> = {};
    settingsList.forEach((item) => {
      config[item.key] = item.value;
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error("API GET /api/settings Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/settings - Batch update website configurations
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json(); // Object containing key-value updates
    
    for (const [key, value] of Object.entries(body)) {
      await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: "Đã cập nhật cấu hình hệ thống thành công" });
  } catch (error: any) {
    console.error("API PATCH /api/settings Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
