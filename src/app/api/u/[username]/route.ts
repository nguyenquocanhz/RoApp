import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import App from "@/models/App";
import { slugify } from "@/utils/format";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { username } = await params;

    // Find user document by username
    let developer = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") }
    }).select("-passwordHash");

    if (!developer) {
      // Fallback: search all users by slugified username
      const allUsers = await User.find({});
      const matchedUser = allUsers.find(u => slugify(u.username) === username.trim().toLowerCase());
      if (matchedUser) {
        developer = await User.findById(matchedUser._id).select("-passwordHash");
      }
    }

    if (!developer) {
      return NextResponse.json({ success: false, error: "Không tìm thấy nhà phát triển" }, { status: 404 });
    }

    // Fetch approved apps shared by this user
    const apps = await App.find({
      submittedBy: developer.username,
      status: "approved"
    }).sort({ downloads: -1 });

    return NextResponse.json({
      success: true,
      data: {
        developer,
        apps
      }
    });
  } catch (error: any) {
    console.error("API GET /api/u/[username] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
