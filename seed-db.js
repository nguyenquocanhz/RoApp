const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = "mongodb+srv://roApp_root:roApp@roapp.rkgukte.mongodb.net/roapp?retryWrites=true&w=majority";

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  // Load SEED_APPS
  const seedAppsPath = path.join(__dirname, "roapp.json");
  const seedAppsData = JSON.parse(fs.readFileSync(seedAppsPath, "utf8"));
  console.log(`Loaded ${seedAppsData.length} apps from roapp.json`);

  // Define Schema locally in JS
  const AppSchema = new mongoose.Schema(
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

  const App = mongoose.models.App || mongoose.model("App", AppSchema);

  // Clear existing apps
  console.log("Clearing existing apps in collection...");
  await App.deleteMany({});
  console.log("Cleared!");

  // Insert seed apps
  console.log("Inserting seed apps into MongoDB Atlas...");
  await App.insertMany(seedAppsData);
  console.log("Seeding completed successfully!");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
