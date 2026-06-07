"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/ecosystem/theme.context";
import { useAuth } from "@/ecosystem/auth.context";
import { useNotification } from "@/ecosystem/notification.context";
import { ShoppingBag, Sun, Moon, ShieldAlert, Upload, Home, LogOut, User, LayoutDashboard, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, login, logout, isAdmin } = useAuth();
  const { showNotification } = useNotification();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor window size for responsive layouts (breakpoint: 780px)
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 780);
    };
    
    // Set initial size on mount
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLinkActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  const toggleRole = () => {
    if (isAdmin) {
      login("user");
      showNotification("Đã chuyển sang vai trò: User", "info");
    } else {
      login("admin");
      showNotification("Đã chuyển sang vai trò: Admin", "info");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    showNotification("Đã đăng xuất tài khoản thành công!", "info");
    router.push("/");
  };

  return (
    <header className={`${styles.navbar} glass`}>
      <div className={`${styles.container} container`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <ShoppingBag size={26} strokeWidth={2.5} />
          </span>
          <span className={`${styles.logoText} text-gradient-primary`}>
            Rổ Ứng Dụng
          </span>
        </Link>

        {/* 1. DESKTOP VIEW (width > 780px) */}
        {isDesktop ? (
          <>
            {/* Desktop Navigation Links */}
            <nav>
              <ul className={styles.navLinks}>
                <li>
                  <Link 
                    href="/" 
                    className={`${styles.navLink} ${isLinkActive("/") ? styles.activeNavLink : ""}`}
                  >
                    <Home size={16} /> Trang chủ
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link 
                      href="/dashboard" 
                      className={`${styles.navLink} ${isLinkActive("/dashboard") ? styles.activeNavLink : ""}`}
                    >
                      <ShieldAlert size={16} /> Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Desktop Actions */}
            <div className={styles.actions}>
              {/* Light/Dark Toggle */}
              <button 
                onClick={toggleTheme} 
                className={styles.iconButton}
                title={theme === "dark" ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Đăng tải ứng dụng button */}
              <Link 
                href="/submit" 
                className={styles.uploadBtn}
                title="Đăng tải ứng dụng mới"
              >
                <Upload size={16} /> Đăng tải
              </Link>

              {/* Profile Dropdown or Login */}
              {user ? (
                <div className={styles.profileContainer} ref={dropdownRef}>
                  <button 
                    className={styles.profileButton} 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className={styles.avatar}
                    />
                    <span className={`${styles.roleBadge} ${isAdmin ? styles.badgeAdmin : styles.badgeUser}`}>
                      {isAdmin ? "Admin" : "User"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className={`${styles.dropdownMenu} glass`}>
                      <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownName}>{user.username}</span>
                        <span className={styles.dropdownEmail}>{user.email}</span>
                      </div>
                      
                      <div className={styles.dropdownDivider} />
                      
                      <Link href="/profile" className={styles.dropdownItem}>
                        <User size={16} /> Trang cá nhân
                      </Link>
                      
                      <Link href="/submit" className={styles.dropdownItem}>
                        <Upload size={16} /> Đăng tải ứng dụng
                      </Link>

                      {isAdmin && (
                        <Link href="/dashboard" className={styles.dropdownItem}>
                          <LayoutDashboard size={16} /> Trang Admin
                        </Link>
                      )}
                      
                      <div className={styles.dropdownDivider} />
                      
                      <button 
                        onClick={handleLogout} 
                        className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className={styles.loginBtn}>
                  Đăng nhập
                </Link>
              )}
            </div>
          </>
        ) : (
          /* 2. MOBILE VIEW (width <= 780px) */
          <div className={styles.actions}>
            {/* Theme Toggle remains directly accessible next to hamburger toggle */}
            <button 
              onClick={toggleTheme} 
              className={styles.iconButton}
              title={theme === "dark" ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Hamburger Menu Toggle button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={styles.mobileMenuToggle}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Drawer menu overlay */}
            {mobileMenuOpen && (
              <div className={`${styles.mobileDrawer} glass`}>
                {/* User Card inside mobile menu */}
                {user && (
                  <div className={styles.mobileUserCard}>
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className={styles.mobileAvatar}
                    />
                    <div className={styles.mobileUserDetails}>
                      <span className={styles.mobileUsername}>{user.username}</span>
                      <span className={styles.mobileEmail}>{user.email}</span>
                    </div>
                  </div>
                )}

                {/* Mobile Links List */}
                <nav>
                  <ul className={styles.mobileNavLinks}>
                    <li>
                      <Link 
                        href="/" 
                        className={`${styles.mobileNavLink} ${isLinkActive("/") ? styles.mobileNavLinkActive : ""}`}
                      >
                        <Home size={16} /> Trang chủ
                      </Link>
                    </li>
                    {user && (
                      <>
                        <li>
                          <Link 
                            href="/profile" 
                            className={`${styles.mobileNavLink} ${isLinkActive("/profile") ? styles.mobileNavLinkActive : ""}`}
                          >
                            <User size={16} /> Trang cá nhân
                          </Link>
                        </li>
                        <li>
                          <Link 
                            href="/submit" 
                            className={`${styles.mobileNavLink} ${isLinkActive("/submit") ? styles.mobileNavLinkActive : ""}`}
                          >
                            <Upload size={16} /> Đăng tải ứng dụng
                          </Link>
                        </li>
                      </>
                    )}
                    {isAdmin && (
                      <li>
                        <Link 
                          href="/dashboard" 
                          className={`${styles.mobileNavLink} ${isLinkActive("/dashboard") ? styles.mobileNavLinkActive : ""}`}
                        >
                          <ShieldAlert size={16} /> Dashboard
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>



                {/* Mobile Authentication buttons */}
                <div className={styles.mobileButtons}>
                  {user ? (
                    <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  ) : (
                    <Link href="/login" className={styles.mobileLoginBtn} style={{ textDecoration: "none" }}>
                      Đăng nhập
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
