import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  type: "app" | "post";
  targetId: string; // ID of App or Post
  targetName: string; // App name or Post author/excerpt
  reporter: string; // Username of the reporter
  reason: string;
  status: "pending" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    type: { type: String, enum: ["app", "post"], required: true },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true },
    reporter: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation of model during hot reload
const Report = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
