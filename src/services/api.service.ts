import { AppItem } from "@/ecosystem/appState.context";

export const ApiService = {
  /**
   * Fetch approved apps with optional filters
   */
  async getApps(filters?: {
    search?: string;
    platform?: string;
    category?: string;
    sort?: string;
  }): Promise<AppItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.platform) params.append("platform", filters.platform);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.sort) params.append("sort", filters.sort);

    const res = await fetch(`/api/apps?${params.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch apps");
    return json.data;
  },

  /**
   * Fetch detailed information of a single app
   */
  async getAppDetail(id: string): Promise<AppItem> {
    const res = await fetch(`/api/apps/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch app details");
    return json.data;
  },

  /**
   * Submit a new app for approval
   */
  async submitApp(appData: Omit<AppItem, "id" | "downloads" | "rating" | "releaseDate" | "status" | "submittedBy">): Promise<AppItem> {
    const savedUser = localStorage.getItem("ro_user");
    const submittedBy = savedUser ? JSON.parse(savedUser).username : "UserPremium";

    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...appData, submittedBy }),
    });
    
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to submit app");
    return json.data;
  },

  /**
   * Record a download trigger
   */
  async incrementDownloads(id: string): Promise<AppItem> {
    const res = await fetch(`/api/apps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "download" }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to record download");
    return json.data;
  },

  /**
   * Submit user star rating
   */
  async rateApp(id: string, rating: number): Promise<AppItem> {
    const res = await fetch(`/api/apps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rate", rating }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to submit rating");
    return json.data;
  },

  /**
   * Admin: Fetch all applications
   */
  async adminGetApps(): Promise<AppItem[]> {
    const res = await fetch("/api/apps/admin");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch admin apps");
    return json.data;
  },

  /**
   * Admin: Approve a pending app
   */
  async adminApproveApp(id: string): Promise<AppItem> {
    const res = await fetch("/api/apps/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "approve" }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to approve app");
    return json.data;
  },

  /**
   * Admin: Delete an app
   */
  async adminDeleteApp(id: string): Promise<void> {
    const res = await fetch(`/api/apps/admin?id=${id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to delete app");
  },

  /**
   * Social: Fetch all posts from MongoDB
   */
  async getPosts(): Promise<any[]> {
    const res = await fetch("/api/posts");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch posts");
    return json.data;
  },

  /**
   * Social: Create a new post in MongoDB
   */
  async createPost(postData: { author: string; authorAvatar: string; content: string }): Promise<any> {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to create post");
    return json.data;
  },

  /**
   * Social: Toggle like state for a post in MongoDB
   */
  async likePost(postId: string, username: string): Promise<any> {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", username }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to toggle like");
    return json.data;
  },

  /**
   * Social: Submit a comment to a post in MongoDB
   */
  async commentPost(postId: string, commentData: { author: string; avatar: string; text: string }): Promise<any> {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", ...commentData }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to submit comment");
    return json.data;
  },

  /**
   * Social: Record a share (forward) on a post in MongoDB
   */
  async sharePost(postId: string): Promise<any> {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to record share");
    return json.data;
  },

  /**
   * Edit an app's details or update its version
   */
  async editApp(id: string, appData: any): Promise<AppItem> {
    const res = await fetch(`/api/apps/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to edit app");
    return json.data;
  },

  /**
   * Social: Edit a post's content
   */
  async editPost(postId: string, content: string, username: string, role: string): Promise<any> {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, username, role }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to edit post");
    return json.data;
  },

  /**
   * Social: Delete a post
   */
  async deletePost(postId: string, username: string, role: string): Promise<void> {
    const params = new URLSearchParams({ username, role });
    const res = await fetch(`/api/posts/${postId}?${params.toString()}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to delete post");
  },

  /**
   * Developer Bio: Fetch public details & approved apps
   */
  async getDeveloperBio(username: string): Promise<{ developer: any; apps: AppItem[] }> {
    const res = await fetch(`/api/u/${encodeURIComponent(username)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch developer bio");
    return json.data;
  },

  /**
   * Settings: Get site settings configurations
   */
  async getSettings(): Promise<any> {
    const res = await fetch("/api/settings");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch system settings");
    return json.data;
  },

  /**
   * Settings: Update site configurations
   */
  async updateSettings(settings: Record<string, any>): Promise<void> {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to update system settings");
  },

  /**
   * Reports: Fetch all abuse complaints (Admin)
   */
  async getReports(): Promise<any[]> {
    const res = await fetch("/api/reports");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch reports");
    return json.data;
  },

  /**
   * Reports: Submit a new abuse complaint / report
   */
  async createReport(reportData: {
    type: "app" | "post";
    targetId: string;
    targetName: string;
    reporter: string;
    reason: string;
  }): Promise<any> {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to submit report");
    return json.data;
  },

  /**
   * Reports: Resolve a report (Admin)
   */
  async resolveReport(id: string, status: "resolved" | "pending"): Promise<any> {
    const res = await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to update report status");
    return json.data;
  },

  /**
   * Members: Get all users (Admin)
   */
  async getUsers(): Promise<any[]> {
    const res = await fetch("/api/auth/users");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch users");
    return json.data;
  },

  /**
   * Members: Update user details (Admin / User Profile Settings)
   */
  async updateUser(userData: {
    username: string;
    role?: "user" | "admin";
    status?: "active" | "banned";
    bio?: string;
    githubUrl?: string;
    telegramUrl?: string;
    websiteUrl?: string;
    avatarUrl?: string;
    email?: string;
  }): Promise<any> {
    const res = await fetch("/api/auth/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to update user");
    return json.data;
  },

  /**
   * Members: Delete user (Admin)
   */
  async deleteUser(username: string): Promise<void> {
    const res = await fetch(`/api/auth/users?username=${encodeURIComponent(username)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to delete user");
  }
};

