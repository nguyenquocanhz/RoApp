"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/ecosystem/auth.context";
import { Wrench, ShieldAlert } from "lucide-react";
import styles from "./MaintenanceGuard.module.css";

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { user, isAdmin } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setMaintenanceMode(!!json.data.maintenanceMode);
        }
      } catch (err) {
        console.error("Failed to fetch maintenance mode setting:", err);
      } finally {
        setLoading(false);
      }
    }
    checkMaintenance();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // If maintenance mode is active and user is not an admin, show maintenance screen
  if (maintenanceMode && !isAdmin) {
    return (
      <div className={styles.maintenanceWrapper}>
        <div className={`${styles.maintenanceCard} glass`}>
          <div className={styles.iconWrapper}>
            <Wrench className={styles.icon} size={48} />
          </div>
          <h1 className={styles.title}>Hệ thống đang bảo trì</h1>
          <p className={styles.description}>
            Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt nhất cho bạn.
            Vui lòng quay lại sau ít phút.
          </p>
          <div className={styles.footer}>
            <p>© 2026 Rổ Ứng Dụng - Premium App Store</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
