import React from "react";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import App from "@/models/App";
import Link from "next/link";
import { Metadata } from "next";
import { Send, Globe, Folder, Download, Star } from "lucide-react";
import { slugify } from "@/utils/format";
import ShareBioButton from "@/ui/components/ShareBioButton/ShareBioButton";
import styles from "./page.module.css";

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  try {
    await dbConnect();
    let developer = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") }
    });
    if (!developer) {
      const allUsers = await User.find({});
      const matchedUser = allUsers.find(u => slugify(u.username) === username.trim().toLowerCase());
      if (matchedUser) {
        developer = await User.findById(matchedUser._id);
      }
    }
    if (!developer) {
      return {
        title: `Không tìm thấy nhà phát triển | Rổ Ứng Dụng`,
      };
    }
    return {
      title: `Hồ sơ nhà phát triển ${developer.username} | Rổ Ứng Dụng`,
      description: developer.bio || `Xem tất cả ứng dụng di động & mã nguồn được chia sẻ bởi nhà phát triển ${developer.username} trên Rổ Ứng Dụng.`,
      keywords: ["Developer", developer.username, "App sharing", "Rổ Ứng Dụng"],
    };
  } catch (error) {
    return {
      title: `Nhà phát triển ${username} | Rổ Ứng Dụng`,
    };
  }
}

export const revalidate = 0; // Dynamic rendering

export default async function DeveloperProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  await dbConnect();
  
  let developer = await User.findOne({
    username: { $regex: new RegExp(`^${username.trim()}$`, "i") }
  });

  if (!developer) {
    const allUsers = await User.find({});
    const matchedUser = allUsers.find(u => slugify(u.username) === username.trim().toLowerCase());
    if (matchedUser) {
      developer = await User.findById(matchedUser._id);
    }
  }

  if (!developer) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <h2 style={{ color: "hsl(var(--danger))", marginBottom: "1rem" }}>Không tìm thấy nhà phát triển</h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Người dùng "{username}" không tồn tại hoặc đã bị khóa khỏi hệ thống.</p>
        <Link href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#a855f7", textDecoration: "underline" }}>
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Fetch approved apps shared by this user
  const apps = await App.find({
    submittedBy: developer.username,
    status: "approved"
  }).sort({ downloads: -1 });

  const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);

  return (
    <div className="container" style={{ maxWidth: "1000px", padding: "2rem 1.5rem" }}>
      {/* Header Bio Card */}
      <div className={`${styles.profileCard} glass`}>
        <div className={styles.avatarWrapper}>
          <img 
            src={developer.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"} 
            alt={developer.username} 
            className={styles.avatar} 
          />
          {developer.role === "admin" && <span className={styles.adminBadge}>Admin</span>}
        </div>
        
        <div className={styles.profileDetails}>
          <h1 className={`${styles.username} text-gradient-primary`}>{developer.username}</h1>
          <p className={styles.roleText}>Nhà phát triển / Thành viên</p>
          
          <p className={styles.bio}>
            {developer.bio || "Thành viên này chưa cập nhật tiểu sử giới thiệu."}
          </p>

          {/* Social Links */}
          <div className={styles.socials}>
            {developer.githubUrl && (
              <a href={developer.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <GithubIcon size={18} />
                <span>GitHub</span>
              </a>
            )}
            {developer.telegramUrl && (
              <a href={developer.telegramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Send size={18} />
                <span>Telegram</span>
              </a>
            )}
            {developer.websiteUrl && (
              <a href={developer.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Globe size={18} />
                <span>Website</span>
              </a>
            )}
            <ShareBioButton username={developer.username} />
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <Folder size={22} className={styles.statIcon} />
            <div>
              <div className={styles.statVal}>{apps.length}</div>
              <div className={styles.statLbl}>Ứng dụng</div>
            </div>
          </div>
          <div className={styles.statItem}>
            <Download size={22} className={styles.statIcon} />
            <div>
              <div className={styles.statVal}>{totalDownloads}</div>
              <div className={styles.statLbl}>Lượt tải</div>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Shared */}
      <div style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#ffffff", fontWeight: 700 }}>
          Ứng dụng đã chia sẻ ({apps.length})
        </h2>
        
        {apps.length === 0 ? (
          <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "16px", color: "rgba(255, 255, 255, 0.5)" }}>
            Nhà phát triển này chưa chia sẻ ứng dụng nào được phê duyệt.
          </div>
        ) : (
          <div className={styles.appsGrid}>
            {apps.map((app) => (
              <Link key={app.id} href={`/apps/${app.id}`} className={`${styles.appCard} glass`}>
                <img src={app.iconUrl} alt={app.name} className={styles.appIcon} />
                <div className={styles.appInfo}>
                  <h3 className={styles.appName}>{app.name}</h3>
                  <div className={styles.appMeta}>
                    <span className={styles.appVersion}>v{app.version}</span>
                    <span className={styles.appPlatform}>{app.platform.toUpperCase()}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.5)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Download size={14} /> {app.downloads}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Star size={14} style={{ color: "gold", fill: "gold" }} /> {app.rating || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
