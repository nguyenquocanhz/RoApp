import mongoose, { Schema, Document } from "mongoose";

export interface IApp extends Document {
  id: string; // Unique URL slug
  name: string;
  developer: string;
  version: string;
  platform: "android" | "ios" | "web";
  category: string;
  description: string;
  detailedDescription: string;
  iconUrl: string;
  screenshots: string[];
  fileSize: number;
  downloads: number;
  rating: number;
  releaseDate: string;
  downloadUrl: string;
  status: "approved" | "pending";
  submittedBy: string;
  techStack?: string[];
}

const AppSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    developer: { type: String, required: true },
    version: { type: String, required: true },
    platform: { type: String, enum: ["android", "ios", "web"], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    iconUrl: { type: String, required: true },
    screenshots: { type: [String], default: [] },
    fileSize: { type: Number, required: true },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    releaseDate: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    status: { type: String, enum: ["approved", "pending"], default: "approved" },
    submittedBy: { type: String, required: true },
    techStack: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model again if it exists in cache
const App = mongoose.models.App || mongoose.model<IApp>("App", AppSchema);

export default App;
