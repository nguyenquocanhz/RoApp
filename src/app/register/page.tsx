"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/ecosystem/auth.context";
import { useNotification } from "@/ecosystem/notification.context";
import { UserPlus, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showNotification } = useNotification();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      const msg = "Vui lòng nhập đầy đủ các trường.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }
    if (username.length < 3) {
      const msg = "Tên đăng nhập phải dài ít nhất 3 ký tự.";
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
    if (password.length < 6) {
      const msg = "Mật khẩu phải dài ít nhất 6 ký tự.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }
    if (password !== confirmPassword) {
      const msg = "Mật khẩu nhập lại không trùng khớp.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }

    try {
      await register(username, email, password);
      showNotification("Đăng ký tài khoản mới thành công!", "success");
      router.push("/profile");
    } catch (err: any) {
      const errMsg = err.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errMsg);
      showNotification(errMsg, "error");
    }
  };


  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass`}>
        <div className={styles.header}>
          <h1 className={`${styles.title} text-gradient-primary`}>Đăng ký</h1>
          <p className={styles.subtitle}>Tạo tài khoản thành viên Rổ Ứng Dụng</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorText}>{error}</div>}

          {/* Username field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên đăng nhập *</label>
            <input
              type="text"
              placeholder="nhapten / admin_test"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Email field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Địa chỉ Email *</label>
            <input
              type="email"
              placeholder="ten@viethoadong.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Password field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Confirm Password field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Nhập lại mật khẩu *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Tạo tài khoản <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.25rem" }} />
          </button>
        </form>

        <div className={styles.footer}>
          Đã có tài khoản?{" "}
          <Link href="/login" className={styles.switchLink}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
