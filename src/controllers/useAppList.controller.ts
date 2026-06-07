"use client";

import { useState, useMemo } from "react";
import { useAppState, AppItem } from "@/ecosystem/appState.context";

export type SortOption = "popular" | "newest" | "rating";

export function useAppListController() {
  const { apps } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "android" | "ios" | "web">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  // Get only approved apps for general listing
  const approvedApps = useMemo(() => {
    return apps.filter((app) => app.status === "approved");
  }, [apps]);

  // Extract unique categories based on selected platform (or all)
  const categories = useMemo(() => {
    const relevantApps = selectedPlatform === "all"
      ? approvedApps
      : approvedApps.filter((app) => app.platform === selectedPlatform);
    
    const uniqueCats = new Set<string>();
    relevantApps.forEach((app) => uniqueCats.add(app.category));
    return ["all", ...Array.from(uniqueCats)];
  }, [approvedApps, selectedPlatform]);

  // Reset category filter if selected platform changes and the category is no longer valid
  const handlePlatformChange = (platform: "all" | "android" | "ios" | "web") => {
    setSelectedPlatform(platform);
    setSelectedCategory("all");
  };

  // Filter and sort the app list
  const filteredApps = useMemo(() => {
    let result = [...approvedApps];

    // Filter by platform
    if (selectedPlatform !== "all") {
      result = result.filter((app) => app.platform === selectedPlatform);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((app) => app.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.developer.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          (app.techStack && app.techStack.some(tech => tech.toLowerCase().includes(query)))
      );
    }

    // Sort result
    if (sortBy === "popular") {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [approvedApps, selectedPlatform, selectedCategory, searchQuery, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    selectedPlatform,
    setSelectedPlatform: handlePlatformChange,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    filteredApps,
  };
}
