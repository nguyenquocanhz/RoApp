import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import App from "@/models/App";
import SEED_APPS from "../../../../roapp.json";
import { sendTelegramNotification } from "@/utils/telegram";


// GET /api/apps - Fetch approved apps with filters & sorting
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Auto-seed if database is empty
    const count = await App.countDocuments();
    if (count === 0) {
      await App.insertMany(SEED_APPS);
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "popular";

    // Base query: only show approved apps to the public
    const query: any = { status: "approved" };

    if (platform && platform !== "all") {
      query.platform = platform;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { developer: searchRegex },
        { description: searchRegex },
        { techStack: searchRegex }
      ];
    }

    // Determine sorting
    let sortQuery: any = { downloads: -1 }; // default: popular
    if (sort === "newest") {
      sortQuery = { releaseDate: -1, createdAt: -1 };
    } else if (sort === "rating") {
      sortQuery = { rating: -1 };
    }

    const apps = await App.find(query).sort(sortQuery);
    return NextResponse.json({ success: true, data: apps });
  } catch (error: any) {
    console.error("API GET /api/apps Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/apps - Submit a new app (default status: pending)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      name,
      developer,
      version,
      platform,
      category,
      description,
      detailedDescription,
      iconUrl,
      screenshots,
      fileSize,
      downloadUrl,
      submittedBy,
      techStack
    } = body;

    // Validation
    if (!name || !developer || !platform || !category || !description || !detailedDescription || !fileSize || !downloadUrl || !submittedBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create unique slug ID
    let slugId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Ensure uniqueness of ID
    let existingApp = await App.findOne({ id: slugId });
    let counter = 1;
    let finalSlugId = slugId;
    while (existingApp) {
      finalSlugId = `${slugId}-${counter}`;
      existingApp = await App.findOne({ id: finalSlugId });
      counter++;
    }

    const releaseDate = new Date().toISOString().split("T")[0];

    const newApp = new App({
      id: finalSlugId,
      name,
      developer,
      version: version || "1.0.0",
      platform,
      category,
      description,
      detailedDescription,
      iconUrl,
      screenshots: screenshots || [],
      fileSize,
      downloadUrl,
      status: "pending", // Always pending when submitted by users
      submittedBy,
      releaseDate,
      techStack: techStack || []
    });

    await newApp.save();

    // Trigger Telegram notification
    const platformName = platform === "android" ? "Android (APK)" : platform === "ios" ? "iOS (IPA)" : "Web App";
    const alertMessage = `🚀 *ỨNG DỤNG MỚI ĐƯỢC ĐĂNG TẢI*\n\n` +
      `- *Tên ứng dụng*: ${name}\n` +
      `- *Nhà phát triển*: ${developer}\n` +
      `- *Nền tảng*: ${platformName}\n` +
      `- *Phiên bản*: ${version || "1.0.0"}\n` +
      `- *Người chia sẻ*: ${submittedBy}\n\n` +
      `Vui lòng truy cập Admin Dashboard để duyệt ứng dụng này.`;

    await sendTelegramNotification(alertMessage).catch(err =>
      console.error("Telegram notification failed to send:", err)
    );

    return NextResponse.json({ success: true, data: newApp }, { status: 201 });

  } catch (error: any) {
    console.error("API POST /api/apps Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
