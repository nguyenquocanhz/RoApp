import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, email, password, avatarUrl } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin đăng ký bắt buộc" },
        { status: 400 }
      );
    }

    // Check if username or email already exists (case insensitive for username)
    const existingUser = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username.trim()}$`, "i") } },
        { email: { $regex: new RegExp(`^${email.trim()}$`, "i") } }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Tên đăng nhập hoặc Email đã tồn tại trên hệ thống" },
        { status: 400 }
      );
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const defaultAvatar = avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

    // Grant Admin role if first user or if username contains 'admin'
    const userCount = await User.countDocuments();
    const role = (userCount === 0 || username.toLowerCase().includes("admin")) ? "admin" : "user";

    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      passwordHash,
      avatarUrl: defaultAvatar,
      role,
      status: "active",
      bio: "",
      githubUrl: "",
      telegramUrl: "",
      websiteUrl: "",
      uploadedCount: 0,
    });

    await newUser.save();

    const userResponse = {
      username: newUser.username,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      role: newUser.role,
      status: newUser.status,
      bio: newUser.bio,
      githubUrl: newUser.githubUrl,
      telegramUrl: newUser.telegramUrl,
      websiteUrl: newUser.websiteUrl,
      uploadedCount: newUser.uploadedCount,
    };

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error: any) {
    console.error("API Register Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
