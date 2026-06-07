import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Post from "@/models/Post";

const INITIAL_POSTS = [
  {
    author: "ChiaSeApp99",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    content: "Chào mừng mọi người đến với Rổ Ứng Dụng! Hệ thống bảng tin mạng xã hội đã được kết nối trực tiếp với database MongoDB rồi nhé. Đăng bài viết chia sẻ cảm nghĩ, like và bình luận mượt mà y chang Facebook luôn! 🎉",
    likes: ["NguoiDungPremium", "AdminRổỨngDụng"],
    comments: [
      { 
        author: "AdminRổỨngDụng", 
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop", 
        text: "Quá chất lượng! Giao diện Glassmorphism mượt mà xịn xò thật.", 
        createdAt: new Date(Date.now() - 3600000)
      }
    ],
    shares: 3
  }
];

// GET /api/posts - Fetch all posts (sorted by newest)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Auto-seed if empty
    const count = await Post.countDocuments();
    if (count === 0) {
      await Post.insertMany(INITIAL_POSTS);
    }

    const posts = await Post.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error("API GET /api/posts Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { author, authorAvatar, content } = body;

    if (!author || !authorAvatar || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newPost = new Post({
      author,
      authorAvatar,
      content,
      likes: [],
      comments: [],
      shares: 0
    });

    await newPost.save();
    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error: any) {
    console.error("API POST /api/posts Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
