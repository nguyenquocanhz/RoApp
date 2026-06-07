"use client";

import React from "react";
import { useNotification, NotificationItem } from "@/ecosystem/notification.context";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Notification.module.css";

export default function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {notifications.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={dismissNotification} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: (id: string) => void;
}) {
  const getIcon = () => {
    switch (item.type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
      default:
        return <Info size={20} />;
    }
  };

  const getStyleClass = () => {
    switch (item.type) {
      case "success":
        return styles.success;
      case "error":
        return styles.error;
      case "warning":
        return styles.warning;
      case "info":
      default:
        return styles.info;
    }
  };

  return (
    <div className={`${styles.toastCard} ${getStyleClass()}`}>
      <span className={styles.toastIcon}>{getIcon()}</span>
      <div className={styles.toastContent}>{item.message}</div>
      <button onClick={() => onDismiss(item.id)} className={styles.toastClose} aria-label="Close notification">
        <X size={16} />
      </button>
      {item.duration && item.duration > 0 && (
        <div
          className={styles.progressBar}
          style={{ animationDuration: `${item.duration}ms` }}
        />
      )}
    </div>
  );
}
