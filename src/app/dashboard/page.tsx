"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDashboardController } from "@/controllers/useDashboard.controller";
import { useAuth } from "@/ecosystem/auth.context";
import { useNotification } from "@/ecosystem/notification.context";
import { ApiService } from "@/services/api.service";
import { getPlatformLabel, formatFileSize } from "@/utils/format";
import { 
  ShieldCheck, ShieldAlert, Trash2, Check, Clock, Download, 
  PackageOpen, Loader2, Users, Flag, Sliders, Save, Lock, Unlock, Settings
} from "lucide-react";
import styles from "./page.module.css";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { showNotification } = useNotification();
  
  const {
    adminApps,
    loading: loadingApps,
    stats,
    handleApprove,
    handleDelete,
    refresh: refreshApps
  } = useDashboardController();

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<"apps" | "users" | "reports" | "settings">("apps");

  // Users Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Reports Management State
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // System Settings State
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [eula, setEula] = useState("");
  const [dmca, setDmca] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Webhook integration states
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState("");
  const [registeringWebhook, setRegisteringWebhook] = useState(false);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const list = await ApiService.getUsers();
      setUsers(list);
    } catch (err: any) {
      showNotification("Không thể tải danh sách thành viên: " + err.message, "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [showNotification]);

  // Fetch Abuse Reports
  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const list = await ApiService.getReports();
      setReports(list);
    } catch (err: any) {
      showNotification("Không thể tải danh sách khiếu nại: " + err.message, "error");
    } finally {
      setLoadingReports(false);
    }
  }, [showNotification]);

  // Fetch System Settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const config = await ApiService.getSettings();
      if (config) {
        setMaintenanceMode(!!config.maintenanceMode);
        setTelegramBotToken(config.telegramBotToken || "");
        setTelegramChatId(config.telegramChatId || "");
        setEula(config.eula || "");
        setDmca(config.dmca || "");
        setSeoTitle(config.seoTitle || "");
        setSeoDescription(config.seoDescription || "");
        setSeoKeywords(config.seoKeywords || "");
      }
    } catch (err: any) {
      showNotification("Không thể tải cấu hình hệ thống: " + err.message, "error");
    } finally {
      setLoadingSettings(false);
    }
  }, [showNotification]);

  // Load correct tab details
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "settings") {
      fetchSettings();
    } else if (activeTab === "apps") {
      refreshApps();
    }
  }, [activeTab, isAdmin, fetchUsers, fetchReports, fetchSettings, refreshApps]);

  // Toggle Member Admin/User role
  const handleToggleRole = async (targetUser: any) => {
    if (targetUser.username === user?.username) {
      showNotification("Bạn không thể tự hạ quyền Admin của chính mình!", "warning");
      return;
    }
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      await ApiService.updateUser({ username: targetUser.username, role: newRole });
      showNotification(`Đã chuyển vai trò của ${targetUser.username} thành ${newRole.toUpperCase()}!`, "success");
      fetchUsers();
    } catch (err: any) {
      showNotification("Đổi vai trò thất bại: " + err.message, "error");
    }
  };

  // Toggle Member status Active/Banned
  const handleToggleBan = async (targetUser: any) => {
    if (targetUser.username === user?.username) {
      showNotification("Bạn không thể tự khóa tài khoản của chính mình!", "warning");
      return;
    }
    const newStatus = targetUser.status === "banned" ? "active" : "banned";
    try {
      await ApiService.updateUser({ username: targetUser.username, status: newStatus });
      showNotification(`Đã ${newStatus === "banned" ? "khóa" : "mở khóa"} tài khoản ${targetUser.username}!`, "success");
      fetchUsers();
    } catch (err: any) {
      showNotification("Cập nhật trạng thái thất bại: " + err.message, "error");
    }
  };

  // Delete user account
  const handleDeleteUser = async (targetUsername: string) => {
    if (targetUsername === user?.username) {
      showNotification("Bạn không thể xóa tài khoản hiện tại của mình!", "warning");
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản ${targetUsername}? Mọi dữ liệu sẽ biến mất.`)) return;
    try {
      await ApiService.deleteUser(targetUsername);
      showNotification(`Đã xóa tài khoản ${targetUsername} thành công!`, "success");
      fetchUsers();
    } catch (err: any) {
      showNotification("Xóa tài khoản thất bại: " + err.message, "error");
    }
  };

  // Mark report as resolved
  const handleResolveReport = async (reportId: string) => {
    try {
      await ApiService.resolveReport(reportId, "resolved");
      showNotification("Đã đánh dấu giải quyết khiếu nại thành công!", "success");
      fetchReports();
    } catch (err: any) {
      showNotification("Không thể giải quyết khiếu nại: " + err.message, "error");
    }
  };

  // Delete target offending item (app or timeline post)
  const handleDeleteTarget = async (report: any) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đối tượng vi phạm này (${report.targetName})?`)) return;
    try {
      if (report.type === "app") {
        await ApiService.adminDeleteApp(report.targetId);
      } else {
        await ApiService.deletePost(report.targetId, user!.username, user!.role);
      }
      await ApiService.resolveReport(report._id, "resolved");
      showNotification("Đã xóa đối tượng vi phạm và giải quyết báo cáo!", "success");
      fetchReports();
    } catch (err: any) {
      showNotification("Lỗi khi xóa đối tượng vi phạm: " + err.message, "error");
    }
  };

  // Save Website Configurations
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingSettings(true);
      await ApiService.updateSettings({
        maintenanceMode,
        telegramBotToken,
        telegramChatId,
        eula,
        dmca,
        seoTitle,
        seoDescription,
        seoKeywords
      });
      showNotification("Cấu hình website đã được cập nhật thành công!", "success");
    } catch (err: any) {
      showNotification("Lưu cấu hình thất bại: " + err.message, "error");
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleRegisterWebhook = async () => {
    if (!telegramWebhookUrl.trim()) {
      showNotification("Vui lòng nhập đường dẫn Webhook URL.", "warning");
      return;
    }
    setRegisteringWebhook(true);
    try {
      const botToken = telegramBotToken.trim() || "8304432515:AAFsYK5T_6TBw38y3V4ye6P7ZL-g14vdlzo";
      const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${telegramWebhookUrl.trim()}`);
      const data = await res.json();
      if (data.ok) {
        showNotification("Đã kích hoạt Webhook cho Telegram Bot thành công!", "success");
      } else {
        showNotification("Kích hoạt Webhook thất bại: " + data.description, "error");
      }
    } catch (err: any) {
      showNotification("Lỗi kết nối API Telegram: " + err.message, "error");
    } finally {
      setRegisteringWebhook(false);
    }
  };

  // Guard: If user is not an Admin, display Access Denied
  if (!isAdmin) {
    return (
      <div className="container">
        <div className={`${styles.accessDenied} glass`}>
          <ShieldAlert size={56} style={{ color: "hsl(var(--accent))" }} />
          <h2 className={`${styles.accessDeniedTitle} text-gradient-primary`}>Yêu cầu quyền Admin</h2>
          <p className={styles.accessDeniedText}>
            Bạn đang truy cập hệ thống quản lý ở chế độ người dùng thông thường. Vui lòng chuyển đổi vai trò ở nút **"Vai trò: User"** trên thanh điều hướng hoặc liên hệ quản trị viên cấp cao.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className={`${styles.title} text-gradient-primary`}>Hệ thống Quản trị & Cấu hình</h1>
      <p className={styles.subtitle}>Phê duyệt ứng dụng, quản lý thành viên, xử lý báo cáo vi phạm và chỉnh sửa cài đặt website.</p>

      {/* Stats Summary Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <PackageOpen size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.total}</span>
            <span className={styles.statLabel}>Tổng bài đăng</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal} style={{ color: "rgb(234, 179, 8)" }}>{stats.pending}</span>
            <span className={styles.statLabel}>Chờ kiểm duyệt</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <ShieldCheck size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal} style={{ color: "rgb(34, 197, 94)" }}>{stats.approved}</span>
            <span className={styles.statLabel}>Đã phê duyệt</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <Download size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.totalDownloads}</span>
            <span className={styles.statLabel}>Lượt tải về</span>
          </div>
        </div>
      </div>

      {/* Tab Switchers */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <button 
          onClick={() => setActiveTab("apps")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "apps" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
            color: "#ffffff"
          }}
        >
          <Sliders size={16} /> Ứng dụng ({adminApps.length})
        </button>

        <button 
          onClick={() => setActiveTab("users")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "users" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
            color: "#ffffff"
          }}
        >
          <Users size={16} /> Thành viên ({users.length})
        </button>

        <button 
          onClick={() => setActiveTab("reports")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "reports" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
            color: "#ffffff"
          }}
        >
          <Flag size={16} /> Khiếu nại ({reports.filter(r=>r.status==='pending').length})
        </button>

        <button 
          onClick={() => setActiveTab("settings")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.08)",
            background: activeTab === "settings" ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
            color: "#ffffff"
          }}
        >
          <Settings size={16} /> Cấu hình website
        </button>
      </div>

      {/* Database Management Panels */}
      <div className={`${styles.panel} glass`}>
        
        {/* Tab 1: Apps Management */}
        {activeTab === "apps" && (
          <>
            <h2 className={styles.panelTitle}>Danh sách Ứng dụng & Mã nguồn</h2>
            {loadingApps ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem", gap: "0.5rem", flexDirection: "column", alignItems: "center" }}>
                <Loader2 size={30} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
                <p style={{ fontSize: "0.9rem", color: "hsl(var(--foreground-muted))" }}>Đang tải danh sách từ MongoDB...</p>
              </div>
            ) : adminApps.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Ứng dụng / Mã nguồn</th>
                    <th className={styles.th}>Nền tảng</th>
                    <th className={styles.th}>Thể loại</th>
                    <th className={styles.th}>Trạng thái</th>
                    <th className={styles.th}>Ngày đăng</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {adminApps.map((app) => (
                    <tr key={app.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.appItem}>
                          <img src={app.iconUrl} alt={app.name} className={styles.appIcon} />
                          <div>
                            <div className={styles.appName}>{app.name}</div>
                            <div className={styles.appDev}>bởi {app.developer} | {formatFileSize(app.fileSize)}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{getPlatformLabel(app.platform)}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.85rem", color: "hsla(var(--foreground)/0.8)" }}>{app.category}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${app.status === "approved" ? styles.badgeApproved : styles.badgePending}`}>
                          {app.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.85rem", color: "hsl(var(--foreground-muted))" }}>{app.releaseDate}</span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                          {app.status === "pending" && (
                            <button onClick={() => handleApprove(app.id)} className={styles.btnApprove} title="Phê duyệt đưa lên Trang chủ">
                              <Check size={14} style={{ display: "inline", marginRight: "0.15rem" }} /> Duyệt
                            </button>
                          )}
                          <button onClick={() => handleDelete(app.id)} className={styles.btnDelete} title="Xóa ứng dụng khỏi hệ thống">
                            <Trash2 size={14} style={{ display: "inline", marginRight: "0.15rem" }} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "hsl(var(--foreground-muted))" }}>
                Không có ứng dụng nào trong cơ sở dữ liệu.
              </div>
            )}
          </>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === "users" && (
          <>
            <h2 className={styles.panelTitle}>Quản lý Thành viên</h2>
            {loadingUsers ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem", gap: "0.5rem", flexDirection: "column", alignItems: "center" }}>
                <Loader2 size={30} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
                <p style={{ fontSize: "0.9rem", color: "hsl(var(--foreground-muted))" }}>Đang tải danh sách thành viên...</p>
              </div>
            ) : users.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Thành viên</th>
                    <th className={styles.th}>Email</th>
                    <th className={styles.th}>Vai trò</th>
                    <th className={styles.th}>Trạng thái</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.username} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.appItem}>
                          <img src={u.avatarUrl} alt={u.username} className={styles.appIcon} style={{ borderRadius: "50%" }} />
                          <div>
                            <div className={styles.appName}>{u.username}</div>
                            <div className={styles.appDev}>Đã đăng {u.uploadedCount || 0} bài</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.85rem" }}>{u.email}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge}`} style={{
                          backgroundColor: u.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)",
                          color: u.role === "admin" ? "#a855f7" : "#ffffff"
                        }}>
                          {u.role === "admin" ? "ADMIN" : "USER"}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge}`} style={{
                          backgroundColor: u.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: u.status === "active" ? "rgb(34,197,94)" : "rgb(239,68,68)"
                        }}>
                          {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                          <button 
                            onClick={() => handleToggleRole(u)} 
                            className={styles.btnApprove} 
                            style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)" }}
                            title="Đổi quyền quản trị"
                          >
                            Đổi vai trò
                          </button>
                          <button 
                            onClick={() => handleToggleBan(u)} 
                            className={styles.btnApprove}
                            style={{ 
                              backgroundColor: u.status === "active" ? "rgba(234, 179, 8, 0.15)" : "rgba(34, 197, 94, 0.15)", 
                              color: u.status === "active" ? "rgb(234, 179, 8)" : "rgb(34, 197, 94)",
                              border: u.status === "active" ? "1px solid rgba(234, 179, 8, 0.2)" : "1px solid rgba(34, 197, 94, 0.2)"
                            }}
                          >
                            {u.status === "active" ? <Lock size={12} style={{ display: "inline", marginRight: "0.15rem" }} /> : <Unlock size={12} style={{ display: "inline", marginRight: "0.15rem" }} />}
                            {u.status === "active" ? "Khóa" : "Kích hoạt"}
                          </button>
                          <button onClick={() => handleDeleteUser(u.username)} className={styles.btnDelete} title="Xóa tài khoản vĩnh viễn">
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "hsl(var(--foreground-muted))" }}>
                Không tìm thấy thành viên nào.
              </div>
            )}
          </>
        )}

        {/* Tab 3: Reports / Abuse Moderation */}
        {activeTab === "reports" && (
          <>
            <h2 className={styles.panelTitle}>Báo cáo vi phạm & Khiếu nại</h2>
            {loadingReports ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem", gap: "0.5rem", flexDirection: "column", alignItems: "center" }}>
                <Loader2 size={30} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
                <p style={{ fontSize: "0.9rem", color: "hsl(var(--foreground-muted))" }}>Đang tải danh sách khiếu nại...</p>
              </div>
            ) : reports.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Loại vi phạm</th>
                    <th className={styles.th}>Đối tượng báo cáo</th>
                    <th className={styles.th}>Người báo cáo</th>
                    <th className={styles.th}>Lý do khiếu nại</th>
                    <th className={styles.th}>Trạng thái</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={`${styles.badge}`} style={{
                          backgroundColor: r.type === "app" ? "rgba(14,165,233,0.15)" : "rgba(168,85,247,0.15)",
                          color: r.type === "app" ? "rgb(14,165,233)" : "rgb(168,85,247)"
                        }}>
                          {r.type === "app" ? "Ứng dụng" : "Bài viết timeline"}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{r.targetName}</span>
                        <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>ID: {r.targetId}</div>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.85rem" }}>{r.reporter}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>{r.reason}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${r.status === "resolved" ? styles.badgeApproved : styles.badgePending}`}>
                          {r.status === "resolved" ? "Đã xử lý" : "Chờ xử lý"}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => handleDeleteTarget(r)} className={styles.btnDelete} title="Xóa vĩnh viễn tệp/bài viết vi phạm">
                                Xóa đối tượng
                              </button>
                              <button onClick={() => handleResolveReport(r._id)} className={styles.btnApprove} title="Bỏ qua khiếu nại và đánh dấu giải quyết">
                                Giải quyết
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "hsl(var(--foreground-muted))" }}>
                Chưa nhận được báo cáo vi phạm nào.
              </div>
            )}
          </>
        )}

        {/* Tab 4: System Settings Configurations */}
        {activeTab === "settings" && (
          <>
            <h2 className={styles.panelTitle}>Cấu hình Website & Hệ thống</h2>
            {loadingSettings ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem", gap: "0.5rem", flexDirection: "column", alignItems: "center" }}>
                <Loader2 size={30} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
                <p style={{ fontSize: "0.9rem", color: "hsl(var(--foreground-muted))" }}>Đang tải cài đặt hệ thống...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px" }}>
                
                {/* Checkbox: Maintenance Mode */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.01)" }}>
                  <input 
                    type="checkbox" 
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="maintenanceMode" style={{ fontWeight: 600, cursor: "pointer" }}>
                    Kích hoạt Chế độ Bảo trì Website (Maintenance Mode)
                  </label>
                  <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", marginLeft: "auto" }}>
                    * Người dùng thường sẽ thấy bảng thông báo bảo trì, chỉ Admin mới truy cập được.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  {/* Field: Telegram Bot Token */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Telegram Bot Token</label>
                    <input 
                      type="password" 
                      placeholder="Nhập Token Telegram Bot"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  {/* Field: Telegram Chat ID */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Telegram Group / Chat ID</label>
                    <input 
                      type="text" 
                      placeholder="Nhập ID kênh nhận thông báo (ví dụ: -100xxx)"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Field: Telegram Webhook setup */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#c084fc" }}>Cấu hình Webhook cho Bot tải File (Telegram File Cloud Helper)</h3>
                  <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", marginBottom: "1rem" }}>
                    Cấu hình để bot Telegram nhận sự kiện khởi chạy (Deep-linking) và gửi trực tiếp tệp cài đặt cho người dùng trong chat riêng tư.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Webhook URL (Đường dẫn NextJS Webhook API)</label>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <input 
                          type="url" 
                          placeholder="Ví dụ: https://ten-mien-cua-ban.vn/api/telegram/webhook"
                          value={telegramWebhookUrl}
                          onChange={(e) => setTelegramWebhookUrl(e.target.value)}
                          className={styles.input}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleRegisterWebhook}
                          disabled={registeringWebhook}
                          style={{
                            padding: "0.5rem 1.2rem",
                            borderRadius: "8px",
                            background: "rgba(168, 85, 247, 0.2)",
                            color: "#c084fc",
                            border: "1px solid rgba(168, 85, 247, 0.4)",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {registeringWebhook ? "Đang xử lý..." : "Kích hoạt Webhook"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#60a5fa" }}>Cấu hình SEO Metadata Toàn trang</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>SEO Title mẫu</label>
                      <input 
                        type="text" 
                        placeholder="Rổ Ứng Dụng - Chia sẻ APK, IPA & Mã nguồn"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Meta Description mẫu</label>
                      <textarea 
                        placeholder="Nhập mô tả toàn trang cho Google Search..."
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className={styles.input}
                        style={{ minHeight: "60px" }}
                        rows={2}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>SEO Keywords (cách nhau bởi dấu phẩy)</label>
                      <input 
                        type="text" 
                        placeholder="APK, IPA, Next.js, code, bẻ khóa"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#a855f7" }}>Điều khoản EULA & DMCA</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Điều khoản sử dụng (EULA - Định dạng Markdown)</label>
                      <textarea 
                        placeholder="Nhập văn bản EULA..."
                        value={eula}
                        onChange={(e) => setEula(e.target.value)}
                        className={styles.input}
                        style={{ minHeight: "150px", fontFamily: "var(--font-geist-mono)" }}
                        rows={6}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Chính sách bản quyền (DMCA - Định dạng Markdown)</label>
                      <textarea 
                        placeholder="Nhập văn bản DMCA..."
                        value={dmca}
                        onChange={(e) => setDmca(e.target.value)}
                        className={styles.input}
                        style={{ minHeight: "150px", fontFamily: "var(--font-geist-mono)" }}
                        rows={6}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className={styles.btnSwitchAdmin} style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", width: "fit-content" }}>
                  <Save size={16} /> Lưu cài đặt hệ thống
                </button>

              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
