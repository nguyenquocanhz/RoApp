"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/ecosystem/auth.context";
import { useNotification } from "@/ecosystem/notification.context";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      const msg = "Vui lòng nhập tên đăng nhập hoặc email.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }
    if (password.length < 6) {
      const msg = "Mật khẩu phải chứa ít nhất 6 ký tự.";
      setError(msg);
      showNotification(msg, "warning");
      return;
    }

    try {
      await login(username, password);
      showNotification("Đăng nhập thành công! Chào mừng quay trở lại.", "success");
      router.push("/profile");
    } catch (err: any) {
      const errMsg = err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setError(errMsg);
      showNotification(errMsg, "error");
    }
  };


  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass`}>
        <div className={styles.header}>
          <h1 className={`${styles.title} text-gradient-primary`}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn quay lại với Rổ Ứng Dụng</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorText}>{error}</div>}

          {/* Username / Email field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên đăng nhập hoặc Email</label>
            <input
              type="text"
              placeholder="nhapten / admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Password field */}
          <div className={styles.formGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label}>Mật khẩu</label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Tips for Testing */}
          <div style={{
            fontSize: "0.75rem",
            color: "hsl(var(--secondary))",
            backgroundColor: "hsl(var(--secondary-glow))",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid hsl(var(--secondary) / 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            <ShieldCheck size={14} />
            <span>Mẹo: Nhập tên có chữ <strong>"admin"</strong> để tự động cấp quyền Admin!</span>
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Đăng nhập ngay <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.25rem" }} />
          </button>
        </form>

        <div className={styles.footer}>
          Chưa có tài khoản?{" "}
          <Link href="/register" className={styles.switchLink}>
            Đăng ký thành viên
          </Link>
        </div>
      </div>
    </div>
  );
}
