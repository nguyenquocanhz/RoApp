"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppDetailController } from "@/controllers/useAppDetail.controller";
import DownloadSection from "@/ui/components/DownloadSection/DownloadSection";
import { formatFileSize, getPlatformLabel } from "@/utils/format";
import { ArrowLeft, Calendar, User, HardDrive, Star, AlertTriangle, Edit } from "lucide-react";
import { useAuth } from "@/ecosystem/auth.context";
import { useNotification } from "@/ecosystem/notification.context";
import { ApiService } from "@/services/api.service";
import styles from "./page.module.css";
import { AppItem } from "@/ecosystem/appState.context";

interface AppDetailClientProps {
  initialApp: AppItem;
}

export default function AppDetailClient({ initialApp }: AppDetailClientProps) {
  const { user, isAdmin } = useAuth();
  const { showNotification } = useNotification();
  
  const {
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
  } = useAppDetailController(initialApp.id);

  const displayApp = app || initialApp;

  // App Editing states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDeveloper, setEditDeveloper] = useState("");
  const [editVersion, setEditVersion] = useState("");
  const [editPlatform, setEditPlatform] = useState<"android" | "ios" | "web">("android");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDetailedDescription, setEditDetailedDescription] = useState("");
  const [editDownloadUrl, setEditDownloadUrl] = useState("");
  const [editFileSize, setEditFileSize] = useState<number>(0);
  const [editIconUrl, setEditIconUrl] = useState("");
  const [editTechStack, setEditTechStack] = useState("");

  // Report states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Initialize edit fields when app is fetched
  useEffect(() => {
    if (displayApp) {
      setEditName(displayApp.name);
      setEditDeveloper(displayApp.developer);
      setEditVersion(displayApp.version);
      setEditPlatform(displayApp.platform);
      setEditCategory(displayApp.category);
      setEditDescription(displayApp.description);
      setEditDetailedDescription(displayApp.detailedDescription || "");
      setEditDownloadUrl(displayApp.downloadUrl);
      setEditFileSize(displayApp.fileSize);
      setEditIconUrl(displayApp.iconUrl);
      setEditTechStack(displayApp.techStack?.join(", ") || "");
    }
  }, [displayApp]);

  const handleSaveAppEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        name: editName.trim(),
        developer: editDeveloper.trim(),
        version: editVersion.trim(),
        platform: editPlatform,
        category: editCategory.trim(),
        description: editDescription.trim(),
        detailedDescription: editDetailedDescription.trim(),
        downloadUrl: editDownloadUrl.trim(),
        fileSize: editFileSize,
        iconUrl: editIconUrl.trim(),
        techStack: editTechStack.split(",").map(t => t.trim()).filter(Boolean),
        updaterRole: user?.role
      };

      await ApiService.editApp(displayApp.id, data);
      if (isAdmin) {
        showNotification("Đã cập nhật ứng dụng thành công!", "success");
      } else {
        showNotification("Cập nhật thành công! Trạng thái chuyển về Chờ duyệt để Admin phê duyệt lại.", "success");
      }
      setIsEditOpen(false);
      window.location.reload();
    } catch (err: any) {
      showNotification("Cập nhật ứng dụng thất bại: " + (err.message || err), "error");
    }
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      showNotification("Vui lòng chọn hoặc điền lý do vi phạm.", "warning");
      return;
    }

    try {
      await ApiService.createReport({
        type: "app",
        targetId: displayApp.id,
        targetName: displayApp.name,
        reporter: user ? user.username : "Khách ẩn danh",
        reason: reportReason.trim()
      });
      showNotification("Đã gửi báo cáo vi phạm ứng dụng thành công!", "success");
      setIsReportOpen(false);
    } catch (err: any) {
      showNotification("Gửi báo cáo thất bại: " + (err.message || err), "error");
    }
  };

  const canEdit = user && (displayApp.submittedBy === user.username || isAdmin);

  return (
    <div className="container">
      {/* Back Link */}
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>
 
      <div className={styles.detailGrid}>
        {/* Main Content Column */}
        <div className={`${styles.mainInfo} glass`}>
          {/* Header Row */}
          <div className={styles.header}>
            <img src={displayApp.iconUrl} alt={displayApp.name} className={styles.largeIcon} />
            <div className={styles.titleArea}>
              <h1 className={styles.name}>{displayApp.name}</h1>
              <span className={styles.developer}>
                Nhà phát triển: 
                <Link href={`/u/${encodeURIComponent(displayApp.submittedBy)}`} style={{ color: "#a855f7", textDecoration: "underline", marginLeft: "0.25rem", fontWeight: 600 }}>
                  {displayApp.developer}
                </Link>
              </span>
              <div className={styles.metaRow}>
                <span className={`${styles.badge} ${
                  displayApp.platform === "android" 
                    ? "badgeAndroid" 
                    : displayApp.platform === "ios" 
                      ? "badgeIos" 
                      : "badgeWeb"
                }`} style={{
                  backgroundColor: displayApp.platform === "android" ? "rgba(34,197,94,0.15)" : displayApp.platform === "ios" ? "rgba(14,165,233,0.15)" : "rgba(168,85,247,0.15)",
                  color: displayApp.platform === "android" ? "rgb(34,197,94)" : displayApp.platform === "ios" ? "rgb(14,165,233)" : "rgb(168,85,247)"
                }}>
                  {getPlatformLabel(displayApp.platform)}
                </span>
                <span className={styles.badge} style={{ backgroundColor: "hsla(var(--foreground)/0.05)", color: "hsl(var(--foreground))" }}>
                  Phiên bản: {displayApp.version}
                </span>
              </div>
            </div>
          </div>
 
          {/* Screenshot Slider */}
          {displayApp.screenshots && displayApp.screenshots.length > 0 && (
            <section className={styles.screenshotSection}>
              <h2 className={styles.sectionTitle}>Hình ảnh xem trước</h2>
              <div className={styles.screenshotGallery}>
                {displayApp.screenshots.map((screen, index) => (
                  <img 
                    key={index} 
                    src={screen} 
                    alt={`${displayApp.name} screenshot ${index + 1}`} 
                    className={styles.screenshot} 
                  />
                ))}
              </div>
            </section>
          )}
 
          {/* Detailed Description */}
          <section className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Giới thiệu chi tiết</h2>
            <p className={styles.descContent}>{displayApp.detailedDescription}</p>
          </section>
 
          {/* Tech Stack for Source Codes */}
          {displayApp.platform === "web" && displayApp.techStack && displayApp.techStack.length > 0 && (
            <section className={styles.techSection}>
              <h2 className={styles.sectionTitle}>Công nghệ sử dụng</h2>
              <div className={styles.techTags}>
                {displayApp.techStack.map((tech, idx) => (
                  <span key={idx} className={styles.techTag}>
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}
 
          {/* Interactive Rating Section */}
          <section className={styles.ratingSection}>
            <h2 className={styles.sectionTitle}>Đánh giá ứng dụng</h2>
            <p className={styles.infoText}>Bạn thích ứng dụng này? Hãy để lại bình chọn của bạn:</p>
            <div className={styles.starsContainer}>
              {Array.from({ length: 5 }).map((_, idx) => {
                const starVal = idx + 1;
                const isFilled = hasRated 
                  ? starVal <= (userRating || 0) 
                  : starVal <= Math.round(displayApp.rating);
 
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRate(starVal)}
                    disabled={hasRated}
                    className={styles.starButton}
                    title={`Đánh giá ${starVal} sao`}
                  >
                    <Star
                      size={28}
                      className={`${styles.starIcon} ${isFilled ? styles.starFilled : ""}`}
                    />
                  </button>
                );
              })}
            </div>
            {hasRated && (
              <span className={styles.feedbackText}>
                Cảm ơn bạn đã bình chọn {userRating} sao cho ứng dụng này!
              </span>
            )}
          </section>
        </div>
 
        {/* Sidebar Info Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Metadata Card */}
          <div className={`${styles.sidebarCard} glass`}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1rem" }}>Thông tin tập tin</h3>
            <ul className={styles.metaList}>
              <li className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <HardDrive size={14} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} /> Dung lượng:
                </span>
                <span className={styles.metaValue}>{formatFileSize(displayApp.fileSize)}</span>
              </li>
              <li className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Calendar size={14} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} /> Cập nhật:
                </span>
                <span className={styles.metaValue}>{displayApp.releaseDate}</span>
              </li>
              <li className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <User size={14} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} /> Người chia sẻ:
                </span>
                <span className={styles.metaValue}>
                  <Link href={`/u/${encodeURIComponent(displayApp.submittedBy)}`} style={{ color: "#a855f7", textDecoration: "underline", fontWeight: 600 }}>
                    {displayApp.submittedBy}
                  </Link>
                </span>
              </li>
            </ul>

            {canEdit && (
              <button
                onClick={() => setIsEditOpen(true)}
                className={`${styles.reportBtn} glass`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.6rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  backgroundColor: "rgba(168, 85, 247, 0.05)",
                  color: "#a855f7",
                  cursor: "pointer",
                  fontWeight: 600,
                  width: "100%",
                  marginTop: "1.5rem",
                  transition: "all 0.3s"
                }}
              >
                <Edit size={14} /> Chỉnh sửa phiên bản
              </button>
            )}
          </div>
 
          {/* Secure Download Card */}
          <DownloadSection
            downloadState={downloadState}
            countdown={countdown}
            downloadProgress={downloadProgress}
            downloadSpeed={downloadSpeed}
            onStartDownload={handleStartDownload}
            onReset={resetDownload}
            platform={displayApp.platform}
          />

          {/* Abuse Report Button */}
          <button 
            onClick={() => setIsReportOpen(true)}
            className={`${styles.reportBtn} glass`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: 600,
              width: "100%",
              transition: "all 0.3s"
            }}
          >
            <AlertTriangle size={16} /> Khiếu nại / Báo cáo vi phạm
          </button>
        </div>
      </div>

      {/* Modal: Edit App Details */}
      {isEditOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass" style={{
            maxWidth: "600px",
            width: "100%",
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#ffffff", fontWeight: 700 }}>
              Chỉnh sửa ứng dụng / Cập nhật phiên bản
            </h3>
            <form onSubmit={handleSaveAppEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Tên ứng dụng *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Nhà phát triển / Tác giả *</label>
                <input type="text" value={editDeveloper} onChange={(e) => setEditDeveloper(e.target.value)} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Phiên bản *</label>
                <input type="text" value={editVersion} onChange={(e) => setEditVersion(e.target.value)} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Nền tảng *</label>
                <select value={editPlatform} onChange={(e) => setEditPlatform(e.target.value as any)} className={styles.input} style={{ background: "#1a1625" }}>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="web">Web App</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Danh mục *</label>
                <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Mô tả ngắn *</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Mô tả chi tiết</label>
                <textarea value={editDetailedDescription} onChange={(e) => setEditDetailedDescription(e.target.value)} className={styles.input} style={{ minHeight: "80px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Đường dẫn tải xuống (Drive/Github/Direct) *</label>
                <input type="text" value={editDownloadUrl} onChange={(e) => setEditDownloadUrl(e.target.value)} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Kích thước tệp (Bytes) *</label>
                <input type="number" value={editFileSize} onChange={(e) => setEditFileSize(Number(e.target.value))} className={styles.input} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Đường dẫn biểu tượng (Icon URL)</label>
                <input type="text" value={editIconUrl} onChange={(e) => setEditIconUrl(e.target.value)} className={styles.input} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Công nghệ sử dụng (Cách nhau bởi dấu phẩy)</label>
                <input type="text" value={editTechStack} onChange={(e) => setEditTechStack(e.target.value)} placeholder="React, Next.js, Node.js" className={styles.input} />
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className={styles.btnSave} style={{ marginTop: 0 }}>Lưu thay đổi</button>
                <button type="button" onClick={() => setIsEditOpen(false)} className={styles.btnSave} style={{ marginTop: 0, backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ffffff" }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Abuse */}
      {isReportOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass" style={{
            maxWidth: "450px",
            width: "100%",
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#ffffff", fontWeight: 700 }}>
              Báo cáo vi phạm ứng dụng
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
              Đối tượng báo cáo: <strong>{displayApp.name}</strong>
            </p>
            <form onSubmit={handleSaveReport} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>Lý do vi phạm *</label>
                <select 
                  value={reportReason} 
                  onChange={(e) => setReportReason(e.target.value)} 
                  className={styles.input} 
                  style={{ background: "#1a1625", color: "#ffffff" }}
                  required
                >
                  <option value="">-- Chọn lý do --</option>
                  <option value="Mã độc / Virus">Mã độc / Virus</option>
                  <option value="Vi phạm bản quyền (DMCA)">Vi phạm bản quyền (DMCA)</option>
                  <option value="Nội dung quấy rối / Xúc phạm">Nội dung quấy rối / Xúc phạm</option>
                  <option value="Spam / Lừa đảo">Spam / Lừa đảo</option>
                  <option value="Khác">Lý do khác</option>
                </select>
              </div>

              {reportReason === "Khác" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Chi tiết lý do khác *</label>
                  <textarea 
                    placeholder="Mô tả chi tiết vi phạm..." 
                    className={styles.input} 
                    style={{ minHeight: "80px" }}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className={styles.btnSave} style={{ marginTop: 0, backgroundColor: "#ef4444" }}>Gửi khiếu nại</button>
                <button type="button" onClick={() => setIsReportOpen(false)} className={styles.btnSave} style={{ marginTop: 0, backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ffffff" }}>Đóng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
