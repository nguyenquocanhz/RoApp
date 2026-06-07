import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import App from "@/models/App";

// GET /api/apps/[id] - Fetch detailed information of a specific app
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const app = await App.findOne({ id });
    if (!app) {
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: app });
  } catch (error: any) {
    console.error("API GET /api/apps/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/apps/[id] - Update downloads count or rate the app
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const app = await App.findOne({ id });
    if (!app) {
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    if (action === "download") {
      app.downloads += 1;
      await app.save();
      return NextResponse.json({ success: true, data: app });
    }

    if (action === "rate") {
      const { rating } = body;
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json({ success: false, error: "Invalid rating value" }, { status: 400 });
      }

      // Calculate new weighted rating
      // Simulate that total voters is downloads / 10 + 1
      const totalVoters = app.downloads > 0 ? Math.floor(app.downloads / 10) + 1 : 1;
      const newRating = Number(((app.rating * totalVoters + rating) / (totalVoters + 1)).toFixed(1));
      
      app.rating = newRating;
      await app.save();
      return NextResponse.json({ success: true, data: app });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("API PATCH /api/apps/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/apps/[id] - Edit app details / update version
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
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
      techStack,
      status,
      updaterRole,
      telegramFileId
    } = body;

    const app = await App.findOne({ id });
    if (!app) {
      return NextResponse.json({ success: false, error: "Không tìm thấy ứng dụng" }, { status: 404 });
    }

    if (name) app.name = name;
    if (developer) app.developer = developer;
    if (version) app.version = version;
    if (platform) app.platform = platform;
    if (category) app.category = category;
    if (description) app.description = description;
    if (detailedDescription) app.detailedDescription = detailedDescription;
    if (iconUrl) app.iconUrl = iconUrl;
    if (screenshots) app.screenshots = screenshots;
    if (fileSize !== undefined) app.fileSize = fileSize;
    if (downloadUrl) app.downloadUrl = downloadUrl;
    if (techStack) app.techStack = techStack;
    if (telegramFileId !== undefined) app.telegramFileId = telegramFileId;

    // Standard user updates revert status to pending; admin stays approved
    if (updaterRole === "admin" || status === "approved") {
      app.status = "approved";
    } else {
      app.status = "pending";
    }

    await app.save();
    return NextResponse.json({ success: true, data: app });
  } catch (error: any) {
    console.error("API PUT /api/apps/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
