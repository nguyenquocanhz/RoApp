import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Tên đăng nhập/Email và Mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username.trim()}$`, "i") } },
        { email: { $regex: new RegExp(`^${username.trim()}$`, "i") } }
      ]
    });

    if (!user || user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    if (user.status === "banned") {
      return NextResponse.json(
        { success: false, error: "Tài khoản của bạn đã bị khóa bởi quản trị viên" },
        { status: 403 }
      );
    }

    const userResponse = {
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      bio: user.bio || "",
      githubUrl: user.githubUrl || "",
      telegramUrl: user.telegramUrl || "",
      websiteUrl: user.websiteUrl || "",
      uploadedCount: user.uploadedCount,
    };

    return NextResponse.json({ success: true, data: userResponse });
  } catch (error: any) {
    console.error("API Login Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
