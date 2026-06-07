"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/ecosystem/auth.context";
import { useNotification } from "@/ecosystem/notification.context";
import { ApiService } from "@/services/api.service";
import { AppItem } from "@/ecosystem/appState.context";
import { getPlatformLabel, formatFileSize, slugify } from "@/utils/format";
import { User, Package, Trash2, Eye, ShieldCheck, Mail, Calendar, Settings, Loader2, RefreshCw, Heart, MessageSquare, Share2, Send, Rss } from "lucide-react";
import { useTimelineController } from "@/controllers/useTimeline.controller";
import styles from "./page.module.css";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop", // default user
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop", // default admin
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop", // alternative male
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", // female pink
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"  // female blue
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, login, isAuthenticated, isAdmin, updateUserContext } = useAuth();
  const { showNotification } = useNotification();
  const timeline = useTimelineController();

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<"profile" | "uploads" | "timeline">("profile");

  // Profile Form States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Uploaded Apps States
  const [userApps, setUserApps] = useState<AppItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  // Authentication Guard: Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Initialize form fields when user loads
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setSelectedAvatar(user.avatarUrl);
      setBio(user.bio || "");
      setGithubUrl(user.githubUrl || "");
      setTelegramUrl(user.telegramUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
    }
  }, [user]);


  // Fetch only apps uploaded by this user from MongoDB
  const fetchUserApps = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingApps(true);
      setAppsError(null);
      
      // Load all apps (both approved and pending) from database
      const allApps = await ApiService.adminGetApps();
      // Filter by current username
      const filtered = allApps.filter((app) => app.submittedBy === user.username);
      setUserApps(filtered);
    } catch (err: any) {
      console.error("Failed to load user apps:", err);
      setAppsError(err.message || "Failed to load uploads");
    } finally {
      setLoadingApps(false);
    }
  }, [user]);

  // Load apps when entering uploads tab
  useEffect(() => {
    if (activeTab === "uploads" && user) {
      fetchUserApps();
    }
  }, [activeTab, user, fetchUserApps]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveMessage(null);

    if (!username.trim() || !email.trim()) {
      const msg = "Tên và Email không được để trống.";
      setSaveMessage(msg);
      showNotification(msg, "warning");
      return;
    }

    try {
      const updatedUser = await ApiService.updateUser({
        username: user.username,
        email: email.trim(),
        avatarUrl: selectedAvatar,
        bio: bio.trim(),
        githubUrl: githubUrl.trim(),
        telegramUrl: telegramUrl.trim(),
        websiteUrl: websiteUrl.trim()
      });

      updateUserContext(updatedUser);
      
      const msg = "Hồ sơ đã được cập nhật thành công!";
      setSaveMessage(msg);
      showNotification(msg, "success");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      const errMsg = err.message || "Cập nhật hồ sơ thất bại.";
      setSaveMessage(errMsg);
      showNotification(errMsg, "error");
    }
  };


  // Delete pending upload
  const handleDeletePending = async (appId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn rút lại và xóa bài đăng chờ duyệt này?")) return;
    try {
      await ApiService.adminDeleteApp(appId);
      // Refresh user apps list
      await fetchUserApps();
      showNotification("Đã rút lại và xóa bài đăng chờ kiểm duyệt thành công!", "success");
    } catch (err: any) {
      showNotification("Xóa bài đăng thất bại: " + (err.message || err), "error");
    }
  };

  const handleSyncMongoDB = async () => {
    try {
      await fetchUserApps();
      showNotification("Đồng bộ dữ liệu từ MongoDB thành công!", "success");
    } catch (err: any) {
      showNotification("Đồng bộ thất bại: " + (err.message || err), "error");
    }
  };

  const handleShareBioLink = async () => {
    if (!user) return;
    const publicUrl = `${window.location.origin}/u/${slugify(user.username)}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showNotification("Đã sao chép liên kết hồ sơ công khai của bạn!", "success");
    } catch (err) {
      console.error("Failed to copy link:", err);
      showNotification("Sao chép liên kết thất bại.", "error");
    }
  };

  // App Editing form states
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
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

  const handleStartEditApp = (app: AppItem) => {
    setEditingApp(app);
    setEditName(app.name);
    setEditDeveloper(app.developer);
    setEditVersion(app.version);
    setEditPlatform(app.platform);
    setEditCategory(app.category);
    setEditDescription(app.description);
    setEditDetailedDescription(app.detailedDescription);
    setEditDownloadUrl(app.downloadUrl);
    setEditFileSize(app.fileSize);
    setEditIconUrl(app.iconUrl);
    setEditTechStack(app.techStack?.join(", ") || "");
  };

  const handleSaveAppEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !user) return;

    if (!editName.trim() || !editDeveloper.trim() || !editVersion.trim() || !editCategory.trim() || !editDescription.trim() || !editDownloadUrl.trim()) {
      showNotification("Vui lòng điền đầy đủ các thông tin bắt buộc.", "warning");
      return;
    }

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
        updaterRole: user.role
      };

      await ApiService.editApp(editingApp.id, data);
      
      if (isAdmin) {
        showNotification("Đã cập nhật ứng dụng thành công!", "success");
      } else {
        showNotification("Cập nhật thành công! Trạng thái chuyển về Chờ duyệt để Admin xác minh.", "success");
      }
      
      setEditingApp(null);
      fetchUserApps();
    } catch (err: any) {
      showNotification("Cập nhật ứng dụng thất bại: " + (err.message || err), "error");
    }
  };

  // Timeline Post Editing states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");

  const handleStartEditPost = (post: any) => {
    setEditingPostId(post._id);
    setEditingPostContent(post.content);
  };

  const handleSavePostEdit = async (postId: string) => {
    if (!editingPostContent.trim() || !user) return;
    try {
      await timeline.handleEditPost(postId, editingPostContent.trim(), user.username, user.role);
      setEditingPostId(null);
    } catch (err) {
      // Notification is handled in the controller
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    await timeline.handleDeletePost(postId, user.username, user.role);
  };

  // Reporting states
  const [reportingType, setReportingType] = useState<"app" | "post" | null>(null);
  const [reportingTargetId, setReportingTargetId] = useState("");
  const [reportingTargetName, setReportingTargetName] = useState("");
  const [reportReason, setReportReason] = useState("");

  const handleStartReport = (type: "app" | "post", targetId: string, targetName: string) => {
    setReportingType(type);
    setReportingTargetId(targetId);
    setReportingTargetName(targetName);
    setReportReason("");
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!reportReason.trim()) {
      showNotification("Vui lòng nhập lý do báo cáo.", "warning");
      return;
    }

    try {
      await ApiService.createReport({
        type: reportingType!,
        targetId: reportingTargetId,
        targetName: reportingTargetName,
        reporter: user.username,
        reason: reportReason.trim()
      });
      showNotification("Đã gửi báo cáo vi phạm thành công! Quản trị viên sẽ sớm xem xét.", "success");
      setReportingType(null);
    } catch (err: any) {
      showNotification("Gửi báo cáo thất bại: " + (err.message || err), "error");
    }
  };



  // Summary stats calculations
  const totalDownloads = userApps
    .filter((a) => a.status === "approved")
    .reduce((sum, current) => sum + current.downloads, 0);

  const pendingCount = userApps.filter((a) => a.status === "pending").length;

  if (!user) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <div className={styles.loadingSpinner}>
          <Loader2 size={36} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
          <p>Đang kiểm tra bảo mật...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} container`}>
      {/* Profile Header section */}
      <section className={`${styles.profileHeader} glass`}>
        <div className={styles.avatarWrapper}>
          <img src={user.avatarUrl} alt={user.username} className={styles.largeAvatar} />
        </div>
        
        <div className={styles.userInfo}>
          <h1 className={styles.username}>{user.username}</h1>
          <span className={styles.email}>{user.email}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <span className={`${styles.badge} ${isAdmin ? styles.badgeAdmin : styles.badgePremium}`}>
              {isAdmin ? "Admin Hệ Thống" : "Thành Viên Premium"}
            </span>
            <Link 
              href={`/u/${slugify(user.username)}`} 
              className={styles.bioLinkBtn}
              title="Xem trang hồ sơ công khai của bạn"
            >
              Hồ sơ công khai
            </Link>
            <button 
              onClick={handleShareBioLink} 
              className={styles.bioLinkBtn}
              style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}
              title="Sao chép liên kết hồ sơ công khai"
            >
              Chia sẻ bio link
            </button>
          </div>
        </div>

        {/* Short Stats view */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{userApps.length}</span>
            <span className={styles.statLabel}>Bài chia sẻ</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{pendingCount}</span>
            <span className={styles.statLabel}>Đang chờ duyệt</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{totalDownloads}</span>
            <span className={styles.statLabel}>Lượt tải về</span>
          </div>
        </div>
      </section>

      {/* Tabs Layout Switcher */}
      <div className={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab("profile")}
          className={`${styles.tabBtn} ${activeTab === "profile" ? styles.tabBtnActive : ""}`}
        >
          <Settings size={16} /> Thông tin cá nhân
        </button>
        <button 
          onClick={() => setActiveTab("uploads")}
          className={`${styles.tabBtn} ${activeTab === "uploads" ? styles.tabBtnActive : ""}`}
        >
          <Package size={16} /> Bài đăng của tôi ({userApps.length})
        </button>
        <button 
          onClick={() => setActiveTab("timeline")}
          className={`${styles.tabBtn} ${activeTab === "timeline" ? styles.tabBtnActive : ""}`}
        >
          <Rss size={16} /> Bảng tin hoạt động
        </button>
      </div>

      {/* Tab Contents */}
      <div className={styles.tabContent}>
        {/* Tab 1: Profile Settings */}
        {activeTab === "profile" && (
          <div className={`${styles.profileCard} glass fade-in`}>
            <h2 className={styles.sectionTitle}>Hồ sơ thành viên</h2>
            
            {saveMessage && (
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: saveMessage.includes("thành công") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                color: saveMessage.includes("thành công") ? "rgb(34,197,94)" : "rgb(239,68,68)",
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                {saveMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className={styles.formGrid}>
              {/* Field: Username */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên hiển thị</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className={styles.input} 
                />
              </div>

              {/* Field: Email */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Địa chỉ Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={styles.input} 
                />
              </div>

              {/* Field: Bio */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Tiểu sử cá nhân (Bio)</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Giới thiệu một chút về bản thân bạn..." 
                  className={styles.input}
                  style={{ minHeight: "80px", resize: "vertical" }}
                  rows={3}
                />
              </div>

              {/* Field: GitHub Link */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Tài khoản GitHub</label>
                <input 
                  type="url" 
                  value={githubUrl} 
                  onChange={(e) => setGithubUrl(e.target.value)} 
                  placeholder="https://github.com/..." 
                  className={styles.input} 
                />
              </div>

              {/* Field: Telegram Link */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Liên kết Telegram</label>
                <input 
                  type="url" 
                  value={telegramUrl} 
                  onChange={(e) => setTelegramUrl(e.target.value)} 
                  placeholder="https://t.me/..." 
                  className={styles.input} 
                />
              </div>

              {/* Field: Website Link */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Trang web cá nhân</label>
                <input 
                  type="url" 
                  value={websiteUrl} 
                  onChange={(e) => setWebsiteUrl(e.target.value)} 
                  placeholder="https://..." 
                  className={styles.input} 
                />
              </div>

              {/* Avatar Selector */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Chọn ảnh đại diện</label>
                <div className={styles.avatarSelection}>
                  {AVATAR_OPTIONS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      onClick={() => setSelectedAvatar(url)}
                      className={`${styles.avatarOption} ${selectedAvatar === url ? styles.avatarOptionActive : ""}`}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.fullWidth}>
                <button type="submit" className={styles.btnSave}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Uploads Management */}
        {activeTab === "uploads" && (
          <div className={`${styles.profileCard} glass fade-in`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Quản lý bài đăng chia sẻ</h2>
              <button 
                onClick={handleSyncMongoDB} 
                className={styles.btnSave} 
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", marginTop: 0 }}
                title="Làm mới danh sách từ MongoDB"
              >
                <RefreshCw size={12} style={{ display: "inline-block", marginRight: "0.25rem" }} /> Đồng bộ MongoDB
              </button>
            </div>

            {loadingApps ? (
              <div className={styles.loadingSpinner}>
                <Loader2 size={24} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
                <p style={{ fontSize: "0.85rem", color: "hsl(var(--foreground-muted))" }}>Đang tải bài đăng từ MongoDB...</p>
              </div>
            ) : appsError ? (
              <div style={{ color: "hsl(var(--accent))", textAlign: "center", padding: "1.5rem" }}>
                {appsError}
              </div>
            ) : userApps.length > 0 ? (
              <div className={styles.appList}>
                {userApps.map((app) => (
                  <div key={app.id} className={`${styles.appItem} glass`}>
                    <div className={styles.appItemLeft}>
                      <img src={app.iconUrl} alt={app.name} className={styles.appIcon} />
                      <div className={styles.appInfo}>
                        <h4 className={styles.appName}>{app.name}</h4>
                        <div className={styles.appMeta}>
                          <span>{getPlatformLabel(app.platform)}</span>
                          <span>• {app.category}</span>
                          <span>• {formatFileSize(app.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {/* Approval Status badge */}
                      <span className={`${styles.appStatusBadge} ${
                        app.status === "approved" ? styles.statusApproved : styles.statusPending
                      }`}>
                        {app.status === "approved" ? "Đã phê duyệt" : "Chờ kiểm duyệt"}
                      </span>

                      {/* Actions */}
                      <button 
                        onClick={() => handleStartEditApp(app)}
                        className={styles.btnAction}
                        title="Chỉnh sửa hoặc cập nhật phiên bản mới"
                        style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "1px solid rgba(168, 85, 247, 0.3)" }}
                      >
                        Chỉnh sửa
                      </button>
                      {app.status === "pending" ? (
                        <button 
                          onClick={() => handleDeletePending(app.id)}
                          className={`${styles.btnAction} ${styles.btnDeleteApp}`}
                          title="Hủy đăng bài và xóa khỏi MongoDB"
                        >
                          <Trash2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.25rem" }} /> Xóa bài
                        </button>
                      ) : (
                        <a 
                          href={`/apps/${app.id}`} 
                          className={`${styles.btnAction} ${styles.btnViewApp}`}
                          title="Xem trang chi tiết ứng dụng"
                        >
                          Xem chi tiết <Eye size={14} />
                        </a>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyUploads}>
                Bạn chưa chia sẻ ứng dụng nào. Hãy vào mục ảnh đại diện chọn Đăng tải ứng dụng để chia sẻ ngay nhé!
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Timeline (Bảng tin hoạt động) */}
        {activeTab === "timeline" && (
          <div className={styles.timelineContainer}>
            {/* Post Creator */}
            <div className={`${styles.postCreator} glass`}>
              <div className={styles.creatorHeader}>
                <img src={user.avatarUrl} alt={user.username} className={styles.creatorAvatar} />
                <textarea
                  placeholder={`${user.username} ơi, bạn đang nghĩ gì thế?`}
                  value={timeline.newPostContent}
                  onChange={(e) => timeline.setNewPostContent(e.target.value)}
                  className={styles.creatorInput}
                  rows={2}
                />
              </div>
              <div className={styles.creatorActions}>
                <button
                  onClick={() => timeline.handleCreatePost(user.username, user.avatarUrl)}
                  disabled={!timeline.newPostContent.trim()}
                  className={styles.btnPost}
                >
                  Đăng bài
                </button>
              </div>
            </div>

            {/* Posts List */}
            {timeline.loading ? (
              <div className={styles.loadingSpinner}>
                <Loader2 size={24} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
                <p style={{ fontSize: "0.85rem", color: "hsl(var(--foreground-muted))" }}>Đang tải bài viết từ MongoDB...</p>
              </div>
            ) : timeline.posts.length > 0 ? (
              <div className={styles.postsList}>
                {timeline.posts.map((post) => {
                  const isLiked = post.likes.includes(user.username);
                  const isCommentsOpen = !!timeline.openComments[post._id];
                  const commentText = timeline.commentInputs[post._id] || "";

                  return (
                    <div key={post._id} className={`${styles.postCard} glass`}>
                      {/* Post Header */}
                      <div className={styles.postHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          <img src={post.authorAvatar} alt={post.author} className={styles.postAuthorAvatar} />
                          <div>
                            <div className={styles.postAuthorName}>{post.author}</div>
                            <div className={styles.postTime}>
                              {new Date(post.createdAt).toLocaleString("vi-VN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Edit / Delete / Report controls */}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {(post.author === user.username || isAdmin) ? (
                            <>
                              <button 
                                onClick={() => handleStartEditPost(post)}
                                style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.8rem", padding: "0.25rem", fontWeight: 600 }}
                                title="Chỉnh sửa bài viết"
                              >
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post._id)}
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", padding: "0.25rem", fontWeight: 600 }}
                                title="Xóa bài viết"
                              >
                                Xóa
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleStartReport("post", post._id, post.content.substring(0, 30))}
                              style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontSize: "0.8rem", padding: "0.25rem", fontWeight: 600 }}
                              title="Báo cáo vi phạm"
                            >
                              Báo cáo
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      {editingPostId === post._id ? (
                        <div style={{ padding: "0.5rem 0", marginBottom: "1rem" }}>
                          <textarea
                            value={editingPostContent}
                            onChange={(e) => setEditingPostContent(e.target.value)}
                            className={styles.input}
                            style={{ minHeight: "60px", marginBottom: "0.5rem", width: "100%" }}
                          />
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button 
                              onClick={() => handleSavePostEdit(post._id)}
                              className={styles.btnSave}
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", width: "auto", marginTop: 0 }}
                            >
                              Lưu
                            </button>
                            <button 
                              onClick={() => setEditingPostId(null)}
                              className={styles.btnSave}
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", width: "auto", marginTop: 0, backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ffffff" }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.postContent}>{post.content}</div>
                      )}


                      {/* Post Stats */}
                      <div className={styles.postStats}>
                        <span>{post.likes.length} lượt thích</span>
                        <span>{post.comments.length} bình luận • {post.shares} lượt chia sẻ</span>
                      </div>

                      {/* Post Actions */}
                      <div className={styles.postActions}>
                        <button
                          onClick={() => timeline.handleLike(post._id, user.username)}
                          className={`${styles.actionBtn} ${isLiked ? styles.actionBtnActive : ""}`}
                        >
                          <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> Thích
                        </button>
                        <button
                          onClick={() => timeline.toggleCommentPanel(post._id)}
                          className={styles.actionBtn}
                        >
                          <MessageSquare size={16} /> Bình luận
                        </button>
                        <button
                          onClick={() => timeline.handleShare(post._id)}
                          className={styles.actionBtn}
                        >
                          <Share2 size={16} /> Chia sẻ
                        </button>
                      </div>

                      {/* Comments Section */}
                      {isCommentsOpen && (
                        <div className={styles.commentsSection}>
                          {post.comments.length > 0 && (
                            <div className={styles.commentsList}>
                              {post.comments.map((comment, index) => (
                                <div key={comment._id || index} className={styles.commentItem}>
                                  <img src={comment.avatar} alt={comment.author} className={styles.commentAvatar} />
                                  <div className={styles.commentBubble}>
                                    <div className={styles.commentAuthor}>{comment.author}</div>
                                    <div className={styles.commentText}>{comment.text}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Write Comment */}
                          <div className={styles.commentInputRow}>
                            <img src={user.avatarUrl} alt={user.username} className={styles.commentAvatar} />
                            <input
                              type="text"
                              placeholder="Viết bình luận..."
                              value={commentText}
                              onChange={(e) => timeline.handleCommentInputChange(post._id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  timeline.handleComment(post._id, user.username, user.avatarUrl);
                                }
                              }}
                              className={styles.commentInput}
                            />
                            <button
                              onClick={() => timeline.handleComment(post._id, user.username, user.avatarUrl)}
                              disabled={!commentText.trim()}
                              className={styles.btnSendComment}
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyUploads}>
                Chưa có bài viết nào trên bảng tin. Hãy là người đầu tiên đăng bài nhé!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Edit App Details */}
      {editingApp && (
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
                <button type="button" onClick={() => setEditingApp(null)} className={styles.btnSave} style={{ marginTop: 0, backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ffffff" }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Abuse */}
      {reportingType && (
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
              Báo cáo vi phạm / Khiếu nại
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
              Đối tượng báo cáo: <strong>{reportingTargetName}</strong>
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
                <button type="submit" className={styles.btnSave} style={{ marginTop: 0, backgroundColor: "#f59e0b" }}>Gửi khiếu nại</button>
                <button type="button" onClick={() => setReportingType(null)} className={styles.btnSave} style={{ marginTop: 0, backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ffffff" }}>Đóng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

