"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ApiService } from "@/services/api.service";

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  version: string;
  platform: "android" | "ios" | "web";
  category: string;
  description: string;
  detailedDescription: string;
  iconUrl: string;
  screenshots: string[];
  fileSize: number;
  downloads: number;
  rating: number;
  releaseDate: string;
  downloadUrl: string;
  status: "approved" | "pending";
  submittedBy: string;
  techStack?: string[];
  telegramFileId?: string;
}

interface AppStateContextType {
  apps: AppItem[];
  loading: boolean;
  refreshApps: () => Promise<void>;
  addApp: (app: Omit<AppItem, "id" | "downloads" | "rating" | "releaseDate" | "status" | "submittedBy">) => Promise<AppItem>;
  approveApp: (id: string) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  incrementDownloads: (id: string) => Promise<void>;
  rateApp: (id: string, ratingValue: number) => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshApps = useCallback(async () => {
    try {
      setLoading(true);
      const list = await ApiService.getApps();
      setApps(list);
    } catch (error) {
      console.error("Failed to load apps from database:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch approved apps on mount
  useEffect(() => {
    refreshApps();
  }, [refreshApps]);

  const addApp = async (appData: Omit<AppItem, "id" | "downloads" | "rating" | "releaseDate" | "status" | "submittedBy">) => {
    const newApp = await ApiService.submitApp(appData);
    // Don't append directly to apps listing since it starts as "pending"
    return newApp;
  };

  const approveApp = async (id: string) => {
    await ApiService.adminApproveApp(id);
    await refreshApps();
  };

  const deleteApp = async (id: string) => {
    await ApiService.adminDeleteApp(id);
    await refreshApps();
  };

  const incrementDownloads = async (id: string) => {
    const updated = await ApiService.incrementDownloads(id);
    setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const rateApp = async (id: string, ratingValue: number) => {
    const updated = await ApiService.rateApp(id, ratingValue);
    setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  return (
    <AppStateContext.Provider value={{ apps, loading, refreshApps, addApp, approveApp, deleteApp, incrementDownloads, rateApp }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
