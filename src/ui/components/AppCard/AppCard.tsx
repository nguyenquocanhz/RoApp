"use client";

import React from "react";
import Link from "next/link";
import { AppItem } from "@/ecosystem/appState.context";
import { formatDownloads } from "@/utils/format";
import { Smartphone, Apple, Code, Star, Download, Eye } from "lucide-react";
import styles from "./AppCard.module.css";

interface AppCardProps {
  app: AppItem;
}

export default function AppCard({ app }: AppCardProps) {
  const getPlatformBadge = () => {
    switch (app.platform) {
      case "android":
        return (
          <span className={`${styles.badge} ${styles.badgeAndroid}`}>
            <Smartphone size={12} /> APK
          </span>
        );
      case "ios":
        return (
          <span className={`${styles.badge} ${styles.badgeIos}`}>
            <Apple size={12} /> IPA
          </span>
        );
      case "web":
        return (
          <span className={`${styles.badge} ${styles.badgeWeb}`}>
            <Code size={12} /> Source
          </span>
        );
    }
  };

  return (
    <div className={`${styles.card} glass-interactive fade-in`}>
      {getPlatformBadge()}

      <div className={styles.header}>
        <img src={app.iconUrl} alt={app.name} className={styles.icon} />
        <div className={styles.titleArea}>
          <h3 className={styles.name}>{app.name}</h3>
          <span className={styles.developer}>{app.developer}</span>
          <span className={styles.category}>{app.category}</span>
        </div>
      </div>

      <p className={styles.description}>{app.description}</p>

      {/* Tech Stack Tags if Source Code */}
      {app.platform === "web" && app.techStack && app.techStack.length > 0 && (
        <div className={styles.techTags}>
          {app.techStack.slice(0, 3).map((tech, idx) => (
            <span key={idx} className={styles.techTag}>
              {tech}
            </span>
          ))}
          {app.techStack.length > 3 && (
            <span className={styles.techTag}>+{app.techStack.length - 3}</span>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.statItem} title="Đánh giá trung bình">
            <Star size={14} className={styles.starIcon} />
            <span>{app.rating > 0 ? app.rating : "Chưa có"}</span>
          </div>
          <div className={styles.statItem} title="Lượt tải về">
            <Download size={14} />
            <span>{formatDownloads(app.downloads)}</span>
          </div>
        </div>

        <Link href={`/apps/${app.id}`}>
          <button className={styles.btnDetails}>
            Chi tiết <Eye size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
