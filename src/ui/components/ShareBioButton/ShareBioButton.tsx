"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import styles from "./ShareBioButton.module.css";

interface ShareBioButtonProps {
  username: string;
}

export default function ShareBioButton({ username }: ShareBioButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ nhà phát triển ${username} - Rổ Ứng Dụng`,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button onClick={handleShare} className={styles.shareButton} title="Chia sẻ trang cá nhân">
      {copied ? <Check size={16} style={{ color: "#22c55e" }} /> : <Share2 size={16} />}
      <span>{copied ? "Đã sao chép!" : "Chia sẻ trang"}</span>
    </button>
  );
}
