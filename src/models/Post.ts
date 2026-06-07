import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  _id?: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  author: string;
  authorAvatar: string;
  content: string;
  likes: string[]; // List of usernames who liked this post
  comments: IComment[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  author: { type: String, required: true },
  avatar: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema(
  {
    author: { type: String, required: true },
    authorAvatar: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
    shares: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation of model during hot reload
const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
