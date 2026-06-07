import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";

// GET /api/auth/users - Fetch all users for Admin Panel
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // Exclude password hashes
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("API GET /api/auth/users Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/auth/users - Update user details (role user/admin, status active/banned, bio, etc.)
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, role, status, bio, githubUrl, telegramUrl, websiteUrl, avatarUrl, email } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (bio !== undefined) updateData.bio = bio;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (telegramUrl !== undefined) updateData.telegramUrl = telegramUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (email) updateData.email = email;

    const updatedUser = await User.findOneAndUpdate(
      { username },
      updateData,
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error("API PATCH /api/auth/users Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/auth/users - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) {
      return NextResponse.json({ success: false, error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (error: any) {
    console.error("API DELETE /api/auth/users Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
