import React from "react";
import dbConnect from "@/utils/dbConnect";
import App from "@/models/App";
import AppDetailClient from "./AppDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    await dbConnect();
    const app = await App.findOne({ id });
    if (!app) {
      return {
        title: "Không tìm thấy ứng dụng | Rổ Ứng Dụng",
      };
    }
    const platformLabel = app.platform === "android" ? "Android" : app.platform === "ios" ? "iOS" : "Web";
    return {
      title: `Tải ${app.name} v${app.version} (${platformLabel}) - Rổ Ứng Dụng`,
      description: app.description || `Tải xuống ${app.name} phiên bản v${app.version} miễn phí, đã kiểm duyệt an toàn 100% trên Rổ Ứng Dụng.`,
      keywords: [app.name, app.category, platformLabel, "Rổ Ứng Dụng"],
    };
  } catch (error) {
    return {
      title: "Chi tiết ứng dụng | Rổ Ứng Dụng",
    };
  }
}

export const revalidate = 0; // Dynamic server rendering

export default async function AppDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  await dbConnect();
  
  const app = await App.findOne({ id });
  
  if (!app) {
    notFound();
  }

  // Convert mongoose document to a plain object for server-to-client transmission
  const plainApp = JSON.parse(JSON.stringify(app));

  return <AppDetailClient initialApp={plainApp} />;
}
