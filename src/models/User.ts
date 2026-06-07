import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  role: "user" | "admin";
  status: "active" | "banned";
  bio?: string;
  githubUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  uploadedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "banned"], default: "active" },
    bio: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    telegramUrl: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    uploadedCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation of model during hot reload
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
