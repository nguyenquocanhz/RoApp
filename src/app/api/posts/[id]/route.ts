import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Post from "@/models/Post";

// PATCH /api/posts/[id] - Update like, comment, or share count on a post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    // Interaction: Like / Unlike toggle
    if (action === "like") {
      const { username } = body;
      if (!username) {
        return NextResponse.json({ success: false, error: "Missing username for like action" }, { status: 400 });
      }

      const likeIndex = post.likes.indexOf(username);
      if (likeIndex > -1) {
        // User already liked -> Unlike (remove from array)
        post.likes.splice(likeIndex, 1);
      } else {
        // User hasn't liked -> Like (add to array)
        post.likes.push(username);
      }

      await post.save();
      return NextResponse.json({ success: true, data: post });
    }

    // Interaction: Add Comment
    if (action === "comment") {
      const { author, avatar, text } = body;
      if (!author || !avatar || !text) {
        return NextResponse.json({ success: false, error: "Missing comment fields" }, { status: 400 });
      }

      post.comments.push({
        author,
        avatar,
        text,
        createdAt: new Date()
      });

      await post.save();
      return NextResponse.json({ success: true, data: post });
    }

    // Interaction: Increment Share count
    if (action === "share") {
      post.shares += 1;
      await post.save();
      return NextResponse.json({ success: true, data: post });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("API PATCH /api/posts/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Edit post content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { content, username, role } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: "Nội dung không được để trống" }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    // Check if the requester is the author or an admin
    if (post.author !== username && role !== "admin") {
      return NextResponse.json({ success: false, error: "Bạn không có quyền chỉnh sửa bài viết này" }, { status: 403 });
    }

    post.content = content;
    await post.save();

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error("API PUT /api/posts/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Read query parameters for authorization
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const role = searchParams.get("role");

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    // Check if the requester is the author or an admin
    if (post.author !== username && role !== "admin") {
      return NextResponse.json({ success: false, error: "Bạn không có quyền xóa bài viết này" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (error: any) {
    console.error("API DELETE /api/posts/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

