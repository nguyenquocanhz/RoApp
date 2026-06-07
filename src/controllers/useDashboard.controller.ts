"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ApiService } from "@/services/api.service";
import { useAppState, AppItem } from "@/ecosystem/appState.context";
import { useNotification } from "@/ecosystem/notification.context";

export function useDashboardController() {
  const { approveApp: globalApproveApp, deleteApp: globalDeleteApp } = useAppState();
  const { showNotification } = useNotification();
  const [adminApps, setAdminApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await ApiService.adminGetApps();
      setAdminApps(list);
    } catch (err: any) {
      console.error("Failed to load admin apps:", err);
      setError(err.message || "Failed to fetch apps for admin panel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminApps();
  }, [fetchAdminApps]);

  const handleApprove = async (id: string) => {
    try {
      await globalApproveApp(id);
      await fetchAdminApps();
      showNotification("Đã phê duyệt và đăng tải ứng dụng lên Trang chủ thành công!", "success");
    } catch (err: any) {
      setError(err.message || "Failed to approve app");
      showNotification("Duyệt thất bại: " + (err.message || err), "error");
    }
  };

  const handleApproveWithoutNotification = async (id: string) => {
    // Keep internal wrapper helper if needed, but not required
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ứng dụng này khỏi hệ thống?")) return;
    try {
      await globalDeleteApp(id);
      await fetchAdminApps();
      showNotification("Đã xóa ứng dụng khỏi cơ sở dữ liệu MongoDB thành công!", "success");
    } catch (err: any) {
      setError(err.message || "Failed to delete app");
      showNotification("Xóa ứng dụng thất bại: " + (err.message || err), "error");
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = adminApps.length;
    const pending = adminApps.filter((a) => a.status === "pending").length;
    const approved = total - pending;
    
    let androidCount = 0;
    let iosCount = 0;
    let webCount = 0;
    let totalDownloads = 0;

    adminApps.forEach((app) => {
      if (app.status === "approved") {
        totalDownloads += app.downloads;
      }
      if (app.platform === "android") androidCount++;
      else if (app.platform === "ios") iosCount++;
      else if (app.platform === "web") webCount++;
    });

    return {
      total,
      pending,
      approved,
      androidCount,
      iosCount,
      webCount,
      totalDownloads,
    };
  }, [adminApps]);

  return {
    adminApps,
    loading,
    error,
    stats,
    handleApprove,
    handleDelete,
    refresh: fetchAdminApps,
  };
}
