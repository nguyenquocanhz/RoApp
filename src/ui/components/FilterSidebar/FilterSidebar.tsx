"use client";

import React from "react";
import { SortOption } from "@/controllers/useAppList.controller";
import { Search, Grid, Smartphone, Apple, Laptop, SlidersHorizontal, Layers } from "lucide-react";
import styles from "./FilterSidebar.module.css";

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPlatform: "all" | "android" | "ios" | "web";
  setSelectedPlatform: (platform: "all" | "android" | "ios" | "web") => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  categories: string[];
}

export default function FilterSidebar({
  searchQuery,
  setSearchQuery,
  selectedPlatform,
  setSelectedPlatform,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
}: FilterSidebarProps) {
  return (
    <aside className={`${styles.sidebar} glass`}>
      {/* Search Bar */}
      <div>
        <h3 className={styles.sectionTitle}>
          <Search size={16} /> Tìm kiếm
        </h3>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm tên, nhà phát triển..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Platform Filter */}
      <div>
        <h3 className={styles.sectionTitle}>
          <Grid size={16} /> Nền tảng
        </h3>
        <div className={styles.platformGroup}>
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`${styles.filterBtn} ${selectedPlatform === "all" ? styles.filterBtnActive : ""}`}
          >
            <Grid size={16} /> Tất cả nền tảng
          </button>
          <button
            onClick={() => setSelectedPlatform("android")}
            className={`${styles.filterBtn} ${selectedPlatform === "android" ? styles.filterBtnActive : ""}`}
          >
            <Smartphone size={16} /> Android (APK)
          </button>
          <button
            onClick={() => setSelectedPlatform("ios")}
            className={`${styles.filterBtn} ${selectedPlatform === "ios" ? styles.filterBtnActive : ""}`}
          >
            <Apple size={16} /> iOS (IPA)
          </button>
          <button
            onClick={() => setSelectedPlatform("web")}
            className={`${styles.filterBtn} ${selectedPlatform === "web" ? styles.filterBtnActive : ""}`}
          >
            <Laptop size={16} /> Mã nguồn Web
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className={styles.sectionTitle}>
          <Layers size={16} /> Thể loại
        </h3>
        <div className={styles.categoryList}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.categoryPill} ${selectedCategory === cat ? styles.categoryPillActive : ""}`}
            >
              {cat === "all" ? "Tất cả" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div>
        <h3 className={styles.sectionTitle}>
          <SlidersHorizontal size={16} /> Sắp xếp
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className={styles.selectInput}
        >
          <option value="popular">Tải nhiều nhất</option>
          <option value="newest">Mới nhất</option>
          <option value="rating">Đánh giá cao nhất</option>
        </select>
      </div>
    </aside>
  );
}
