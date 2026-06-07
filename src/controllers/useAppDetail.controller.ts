"use client";

import { useState, useEffect } from "react";
import { useAppState, AppItem } from "@/ecosystem/appState.context";
import { DownloadService } from "@/services/download.service";
import { useNotification } from "@/ecosystem/notification.context";

export type DownloadState = "idle" | "counting" | "downloading" | "completed";

export function useAppDetailController(appId: string) {
  const { apps, incrementDownloads, rateApp } = useAppState();
  const { showNotification } = useNotification();
  const [app, setApp] = useState<AppItem | null>(null);
  
  // Download states
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [countdown, setCountdown] = useState(5);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);

  // User feedback states
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Find app on mount or database update
  useEffect(() => {
    const foundApp = apps.find((a) => a.id === appId);
    if (foundApp) {
      setApp(foundApp);
    }
  }, [apps, appId]);

  // Handle rating action
  const handleRate = (ratingValue: number) => {
    if (hasRated || !app) return;
    setUserRating(ratingValue);
    rateApp(app.id, ratingValue);
    setHasRated(true);
    showNotification(`Cảm ơn bạn đã bình chọn ${ratingValue} sao cho ứng dụng!`, "success");
  };

  // Start secure download flow
  const handleStartDownload = async () => {
    if (!app || downloadState !== "idle") return;

    // Phase 1: Countdown
    setDownloadState("counting");
    setCountdown(5);
    showNotification("Đang chuẩn bị đường truyền tải tệp tin an toàn...", "info");
    
    try {
      await DownloadService.startCountdown(5, (remaining) => {
        setCountdown(remaining);
      });

      // Phase 2: Progress Simulation
      setDownloadState("downloading");
      setDownloadProgress(0);
      showNotification("Đang tải dữ liệu từ máy chủ...", "info");
      
      await DownloadService.simulateDownload(app.fileSize, (percent, speed) => {
        setDownloadProgress(percent);
        setDownloadSpeed(speed);
      });

      // Phase 3: Trigger real simulated file and update DB
      setDownloadState("completed");
      DownloadService.triggerFileDownload(app.downloadUrl);
      incrementDownloads(app.id);
      showNotification("Tải ứng dụng thành công! Tệp tin đã được lưu.", "success");

    } catch (error: any) {
      console.error("Download failed:", error);
      setDownloadState("idle");
      showNotification("Tải tệp tin thất bại: " + (error.message || error), "error");
    }
  };

  const resetDownload = () => {
    setDownloadState("idle");
    setDownloadProgress(0);
    setDownloadSpeed(0);
  };

  return {
    app,
    downloadState,
    countdown,
    downloadProgress,
    downloadSpeed,
    userRating,
    hasRated,
    handleRate,
    handleStartDownload,
    resetDownload,
  };
}
