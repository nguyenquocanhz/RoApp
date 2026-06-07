import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import App from "@/models/App";
import SEED_APPS from "../../../../../roapp.json";

// GET /api/apps/admin - Retrieve all apps (approved & pending) for admin management
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Auto-seed if database is empty
    const count = await App.countDocuments();
    if (count === 0) {
      await App.insertMany(SEED_APPS);
    }
    
    // Sort by pending first, then by latest creation date
    const apps = await App.find({}).sort({ status: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: apps });
  } catch (error: any) {
    console.error("API GET /api/apps/admin Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/apps/admin - Approve a pending app
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing app ID" }, { status: 400 });
    }

    if (action === "approve") {
      const updatedApp = await App.findOneAndUpdate(
        { id },
        { status: "approved" },
        { new: true }
      );

      if (!updatedApp) {
        return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: updatedApp });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("API PATCH /api/apps/admin Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/apps/admin - Delete an app from database
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing app ID in query" }, { status: 400 });
    }

    const deletedApp = await App.findOneAndDelete({ id });

    if (!deletedApp) {
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "App deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE /api/apps/admin Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
