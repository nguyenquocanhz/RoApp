"use client";

import React from "react";
import { useAppListController } from "@/controllers/useAppList.controller";
import { useAppState } from "@/ecosystem/appState.context";
import FilterSidebar from "@/ui/components/FilterSidebar/FilterSidebar";
import AppCard from "@/ui/components/AppCard/AppCard";
import { AlertCircle, Terminal, HelpCircle } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const { loading } = useAppState();
  const {
    searchQuery,
    setSearchQuery,
    selectedPlatform,
    setSelectedPlatform,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    filteredApps,
  } = useAppListController();

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("all");
    setSelectedCategory("all");
    setSortBy("popular");
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className={`${styles.hero} glass`}>
        <div className={styles.glowBall1} />
        <div className={styles.glowBall2} />
        
        <h1 className={`${styles.heroTitle} text-gradient-primary`}>
          Rổ Ứng Dụng Premium
        </h1>
        <p className={styles.heroSubtitle}>
          Cộng đồng chia sẻ tập tin cài đặt Android (APK), iOS (IPA) đã qua kiểm duyệt bảo mật và các mẫu mã nguồn website Next.js, React, Laravel chất lượng cao hoàn toàn miễn phí.
        </p>
      </section>

      {/* Catalog Grid */}
      <div className={styles.mainLayout}>
        {/* Sidebar Controls */}
        <FilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        {/* Catalog List */}
        <div>
          <div className={styles.catalogHeader}>
            <span className={styles.resultCount}>
              {loading ? "Đang tải dữ liệu..." : `Tìm thấy ${filteredApps.length} kết quả`}
            </span>
          </div>

          {/* Catalog Listing */}
          {loading ? (
            // Skeleton loader grid
            <div className="grid-responsive">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div className={styles.skeletonIcon} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                  <div className={styles.skeletonDesc} />
                </div>
              ))}
            </div>
          ) : filteredApps.length > 0 ? (
            <div className="grid-responsive">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className={`${styles.emptyState} glass`}>
              <AlertCircle size={48} style={{ color: "hsl(var(--accent))" }} />
              <h3 className={styles.emptyTitle}>Không tìm thấy ứng dụng</h3>
              <p className={styles.emptyText}>
                Rổ chưa có ứng dụng nào phù hợp với bộ lọc tìm kiếm của bạn. Hãy thử tìm từ khóa khác hoặc đặt lại bộ lọc.
              </p>
              <button onClick={handleResetFilters} className={styles.btnReset}>
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
