"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNotification } from "@/ecosystem/notification.context";
import { Mail, CheckCircle2, ChevronLeft, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      const msg = "Vui lòng nhập địa chỉ email.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }
    if (!email.includes("@")) {
      const msg = "Địa chỉ email không hợp lệ.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }

    setSubmitted(true);
    showNotification("Đã gửi mã khôi phục mật khẩu thành công!", "success");
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass`}>
        {submitted ? (
          /* Success View */
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={40} />
            </div>
            <h2 className={`${styles.title} text-gradient-primary`}>Đã gửi mã khôi phục!</h2>
            <p className={styles.subtitle} style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
              Một liên kết khôi phục mật khẩu giả lập đã được gửi đến email **{email}**. Vui lòng kiểm tra hộp thư của bạn.
            </p>
            <Link href="/login" className={styles.btnSubmit} style={{ width: "100%", textDecoration: "none" }}>
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          /* Form View */
          <>
            <div className={styles.header}>
              <h1 className={`${styles.title} text-gradient-primary`}>Quên mật khẩu</h1>
              <p className={styles.subtitle}>Điền email của bạn để bắt đầu khôi phục mật khẩu</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.errorText}>{error}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label}>Địa chỉ Email</label>
                <input
                  type="email"
                  placeholder="ten@viethoadong.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.btnSubmit}>
                Gửi mã xác nhận <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.25rem" }} />
              </button>
            </form>

            <div className={styles.footer}>
              <Link href="/login" className={styles.switchLink} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <ChevronLeft size={16} /> Quay lại Đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
