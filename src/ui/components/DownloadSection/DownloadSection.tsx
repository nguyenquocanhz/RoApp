"use client";

import React from "react";
import { DownloadState } from "@/controllers/useAppDetail.controller";
import { Download, Loader2, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import styles from "./DownloadSection.module.css";

interface DownloadSectionProps {
  downloadState: DownloadState;
  countdown: number;
  downloadProgress: number;
  downloadSpeed: number;
  onStartDownload: () => void;
  onReset: () => void;
  platform: "android" | "ios" | "web";
}

export default function DownloadSection({
  downloadState,
  countdown,
  downloadProgress,
  downloadSpeed,
  onStartDownload,
  onReset,
  platform,
}: DownloadSectionProps) {
  const getButtonText = () => {
    switch (platform) {
      case "android":
        return "Tải xuống APK An Toàn";
      case "ios":
        return "Tải xuống IPA An Toàn";
      case "web":
        return "Tải xuống Mã Nguồn (ZIP)";
      default:
        return "Tải xuống ngay";
    }
  };

  return (
    <div className={`${styles.container} glass glow-pulse`}>
      {/* State: Idle */}
      {downloadState === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", width: "100%" }}>
          <button onClick={onStartDownload} className={styles.btnDownload}>
            <Download size={20} strokeWidth={2.5} />
            {getButtonText()}
          </button>
          <span className={styles.infoText} style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
            <ShieldCheck size={14} style={{ color: "rgb(34, 197, 94)" }} />
            Đã quét virus sạch 100% | Tốc độ cao không giới hạn
          </span>
        </div>
      )}

      {/* State: Counting */}
      {downloadState === "counting" && (
        <div className={styles.countdownWrapper}>
          <div className={styles.countdownNumber}>{countdown}</div>
          <p className={styles.infoText}>Đang tạo liên kết tải xuống bảo mật từ MongoDB...</p>
        </div>
      )}

      {/* State: Downloading */}
      {downloadState === "downloading" && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressHeader}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Loader2 size={14} className="animate-spin" /> Đang tải tập tin...
            </span>
            <span>{downloadProgress}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <div className={styles.speedText}>
            Tốc độ: {downloadSpeed} MB/s
          </div>
        </div>
      )}

      {/* State: Completed */}
      {downloadState === "completed" && (
        <div className={styles.successWrapper}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={36} />
          </div>
          <h4 style={{ fontWeight: 750, fontSize: "1.2rem" }}>Tải xuống thành công!</h4>
          <p className={styles.infoText}>Tập tin đã được lưu về thư mục Download của bạn.</p>
          <button onClick={onReset} className={styles.btnReset}>
            <RefreshCw size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Tải lại
          </button>
        </div>
      )}
    </div>
  );
}
