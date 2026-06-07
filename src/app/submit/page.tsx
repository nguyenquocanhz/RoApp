"use client";

import React from "react";
import Link from "next/link";
import { useSubmitAppController } from "@/controllers/useSubmitApp.controller";
import { Upload, CheckCircle2, ChevronLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/ecosystem/auth.context";
import styles from "./page.module.css";

export default function SubmitAppPage() {
  const { user } = useAuth();
  
  const {
    form,
    errors,
    isSuccess,
    developerType,
    setDeveloperType,
    fileSourceType,
    setFileSourceType,
    driveUrl,
    setDriveUrl,
    githubUrl,
    setGithubUrl,
    uploadedFileName,
    uploading,
    uploadProgress,
    logoUploading,
    logoProgress,
    screenshotsUploading,
    screenshotsProgress,
    startTelegramUpload,
    handleLogoUpload,
    handleScreenshotsUpload,
    handleRemoveScreenshot,
    handleChange,
    handleSubmit,
    resetSuccess,
  } = useSubmitAppController();

  const getCategoryOptions = () => {
    switch (form.platform) {
      case "android":
        return (
          <>
            <option value="Trò chơi">Trò chơi</option>
            <option value="Công cụ">Công cụ</option>
            <option value="Hình ảnh & Nhiếp ảnh">Hình ảnh & Nhiếp ảnh</option>
            <option value="Liên lạc & Trò chuyện">Liên lạc & Trò chuyện</option>
            <option value="Học tập">Học tập</option>
          </>
        );
      case "ios":
        return (
          <>
            <option value="Thiết kế & Đồ họa">Thiết kế & Đồ họa</option>
            <option value="Âm nhạc">Âm nhạc</option>
            <option value="Tiện ích & Bảo mật">Tiện ích & Bảo mật</option>
            <option value="Trò chơi">Trò chơi</option>
            <option value="Tài chính">Tài chính</option>
          </>
        );
      case "web":
        return (
          <>
            <option value="Thương mại điện tử">Thương mại điện tử</option>
            <option value="Giao diện Portfolio">Giao diện Portfolio</option>
            <option value="Hệ thống quản lý">Hệ thống quản lý</option>
            <option value="Trang giới thiệu (Landing Page)">Trang giới thiệu (Landing Page)</option>
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Success View */}
      {isSuccess ? (
        <div className={`${styles.successOverlay} glass`}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={48} />
          </div>
          <h2 className={`${styles.successTitle} text-gradient-primary`}>Đăng tải thành công!</h2>
          <p className={styles.successText}>
            Ứng dụng/Mã nguồn **{form.name}** đã được gửi lên hệ thống và lưu vào cơ sở dữ liệu MongoDB ở trạng thái chờ duyệt. Admin sẽ kiểm duyệt và phê duyệt ứng dụng sớm nhất.
          </p>
          <div className={styles.successButtons}>
            <Link href="/">
              <button className={styles.btnSecondary} onClick={resetSuccess}>
                <ChevronLeft size={16} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} /> Quay lại trang chủ
              </button>
            </Link>
            <button className={`${styles.btnSubmit}`} style={{ width: "auto" }} onClick={resetSuccess}>
              Đăng tải tiếp <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className={`${styles.formCard} glass`}>
          <h1 className={`${styles.title} text-gradient-primary`}>Chia sẻ ứng dụng của bạn</h1>
          <p className={styles.subtitle}>
            Chia sẻ các tập tin APK, IPA bẻ khóa hoặc mã nguồn website của bạn đến cộng đồng. Mọi bài viết sẽ được kiểm duyệt bảo mật.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* Field: App Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên ứng dụng / Mã nguồn *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Flappy Bird Premium, NextJS E-commerce..."
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={styles.input}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              {/* Field: Developer Name Selector */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Nhà phát triển / Tác giả *</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setDeveloperType("display")}
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.8rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: developerType === "display" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
                      color: "#ffffff",
                      fontWeight: 500
                    }}
                  >
                    Tên hiển thị ({user?.username || "Guest"})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeveloperType("custom")}
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.8rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: developerType === "custom" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
                      color: "#ffffff",
                      fontWeight: 500
                    }}
                  >
                    Tự đặt tên
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: Pixel Studio, Nguyen Van A..."
                  value={form.developer}
                  onChange={(e) => handleChange("developer", e.target.value)}
                  disabled={developerType === "display"}
                  className={styles.input}
                />
                {errors.developer && <span className={styles.errorText}>{errors.developer}</span>}
              </div>

              {/* Field: Version */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Phiên bản</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1.0.0, 2.1.0"
                  value={form.version}
                  onChange={(e) => handleChange("version", e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Field: Platform */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Nền tảng ứng dụng *</label>
                <select
                  value={form.platform}
                  onChange={(e) => handleChange("platform", e.target.value as any)}
                  className={styles.select}
                >
                  <option value="android">Android (Tập tin APK)</option>
                  <option value="ios">iOS (Tập tin IPA)</option>
                  <option value="web">Mã nguồn Web (Tập tin ZIP)</option>
                </select>
              </div>

              {/* Field: Category */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Thể loại *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={styles.select}
                >
                  {getCategoryOptions()}
                </select>
              </div>

              {/* Field: Logo App Upload */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Biểu tượng Logo ứng dụng (PNG/JPG) *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className={styles.input}
                  disabled={logoUploading}
                  style={{ display: "none" }}
                  id="logo-upload-input"
                />
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.25rem" }}>
                  <label htmlFor="logo-upload-input" style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    userSelect: "none"
                  }}>
                    {logoUploading ? `Đang tải lên (${logoProgress}%)` : "Chọn ảnh Logo"}
                  </label>
                  {form.iconUrl ? (
                    <img 
                      src={form.iconUrl} 
                      alt="Uploaded Logo" 
                      style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} 
                    />
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Chưa tải logo</span>
                  )}
                </div>
                {errors.iconUrl && <span className={styles.errorText}>{errors.iconUrl}</span>}
              </div>

              {/* Field: Screenshots Previews */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Ảnh minh họa / Screenshots sản phẩm (PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) handleScreenshotsUpload(e.target.files);
                  }}
                  className={styles.input}
                  disabled={screenshotsUploading}
                  style={{ display: "none" }}
                  id="screenshots-upload-input"
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.25rem" }}>
                  <label htmlFor="screenshots-upload-input" style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    width: "fit-content",
                    userSelect: "none"
                  }}>
                    {screenshotsUploading ? `Đang tải lên (${screenshotsProgress}%)` : "Chọn ảnh minh họa..."}
                  </label>
                  
                  {form.screenshots.length > 0 && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "0.75rem",
                      marginTop: "0.25rem"
                    }}>
                      {form.screenshots.map((url, idx) => (
                        <div key={idx} style={{ position: "relative", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <img src={url} alt={`Screenshot ${idx+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(239, 68, 68, 0.8)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              fontSize: "10px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center"
                            }}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Field: File Size MB (Manual override for links, auto for direct uploads) */}
              {fileSourceType !== "upload" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Dung lượng tập tin (MB) *</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 45"
                    value={form.fileSizeMB || ""}
                    onChange={(e) => handleChange("fileSizeMB", Number(e.target.value))}
                    className={styles.input}
                  />
                  {errors.fileSizeMB && <span className={styles.errorText}>{errors.fileSizeMB}</span>}
                </div>
              )}

              {/* Field: File Source Selector */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Nguồn cung cấp tệp tin cài đặt / Mã nguồn *</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setFileSourceType("drive")}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: fileSourceType === "drive" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 500
                    }}
                  >
                    Google Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileSourceType("github")}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: fileSourceType === "github" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 500
                    }}
                  >
                    GitHub Repo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileSourceType("upload")}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: fileSourceType === "upload" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 500
                    }}
                  >
                    Tải lên trực tiếp
                  </button>
                </div>

                {fileSourceType === "drive" && (
                  <div>
                    <input
                      type="url"
                      placeholder="Nhập link Google Drive chia sẻ (ví dụ: https://drive.google.com/...)"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className={styles.input}
                    />
                    {errors.driveUrl && <span className={styles.errorText}>{errors.driveUrl}</span>}
                  </div>
                )}

                {fileSourceType === "github" && (
                  <div>
                    <input
                      type="url"
                      placeholder="Nhập link Repository GitHub (ví dụ: https://github.com/...)"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className={styles.input}
                    />
                    {errors.githubUrl && <span className={styles.errorText}>{errors.githubUrl}</span>}
                  </div>
                )}

                {fileSourceType === "upload" && (
                  <div style={{
                    border: "2px dashed rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "2rem",
                    textAlign: "center",
                    background: "rgba(255,255,255,0.01)"
                  }}>
                    <input
                      type="file"
                      id="submit-file-upload-input"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) startTelegramUpload(file);
                      }}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div>
                        <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
                          Đang tải lên FileCloud: <strong>{uploadedFileName}</strong>
                        </p>
                        <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", maxWidth: "300px", margin: "0 auto 0.5rem" }}>
                          <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(135deg, #a855f7 0%, #60a5fa 100%)", transition: "width 0.1s linear" }}></div>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "#a855f7", fontWeight: 700 }}>{Math.round(uploadProgress)}%</span>
                      </div>
                    ) : uploadedFileName ? (
                      <div>
                        <p style={{ color: "rgb(34, 197, 94)", fontWeight: 600, fontSize: "0.9rem" }}>
                          ✓ Tải lên hoàn tất: <strong>{uploadedFileName}</strong> ({form.fileSizeMB} MB)
                        </p>
                        <label htmlFor="submit-file-upload-input" style={{ display: "inline-block", marginTop: "1rem", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>
                          Chọn tệp khác
                        </label>
                      </div>
                    ) : (
                      <label htmlFor="submit-file-upload-input" style={{ cursor: "pointer", display: "block" }}>
                        <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "rgba(168,85,247,0.08)", color: "#a855f7", marginBottom: "0.75rem" }}>
                          <Upload size={20} />
                        </div>
                        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                          Kéo thả hoặc click để chọn tập tin
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>
                          Dung lượng tối đa 100MB (APK, IPA, ZIP)
                        </p>
                      </label>
                    )}
                    {errors.uploadFile && <div className={styles.errorText} style={{ marginTop: "0.75rem" }}>{errors.uploadFile}</div>}
                  </div>
                )}
              </div>

              {/* Field: Tech Stack CSV (Conditional) */}
              {form.platform === "web" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Công nghệ sử dụng (Cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Next.js 15, TypeScript, Tailwind CSS"
                    value={form.techStackCSV || ""}
                    onChange={(e) => handleChange("techStackCSV", e.target.value)}
                    className={styles.input}
                  />
                </div>
              )}

              {/* Field: Short Description */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Mô tả ngắn gọn *</label>
                <input
                  type="text"
                  placeholder="Tóm tắt tính năng chính trong 1 câu..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={styles.input}
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>

              {/* Field: Detailed Description */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Giới thiệu chi tiết *</label>
                <textarea
                  placeholder="Mô tả chi tiết các tính năng, yêu cầu hệ thống và hướng dẫn cài đặt..."
                  value={form.detailedDescription}
                  onChange={(e) => handleChange("detailedDescription", e.target.value)}
                  className={styles.textarea}
                  rows={5}
                />
                {errors.detailedDescription && <span className={styles.errorText}>{errors.detailedDescription}</span>}
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit}>
              Gửi đăng tải ứng dụng <Upload size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
