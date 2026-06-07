"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiService } from "@/services/api.service";
import { useNotification } from "@/ecosystem/notification.context";

export interface CommentItem {
  _id?: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string | Date;
}

export interface PostItem {
  _id: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: string[];
  comments: CommentItem[];
  shares: number;
  createdAt: string | Date;
}

export function useTimelineController() {
  const { showNotification } = useNotification();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Post Creator State
  const [newPostContent, setNewPostContent] = useState("");
  
  // Comment Section states
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getPosts();
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to load timeline posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create new post
  const handleCreatePost = async (username: string, avatarUrl: string) => {
    if (!newPostContent.trim()) return;
    try {
      const created = await ApiService.createPost({
        author: username,
        authorAvatar: avatarUrl,
        content: newPostContent
      });
      // Append at the top and clear editor
      setPosts((prev) => [created, ...prev]);
      setNewPostContent("");
      showNotification("Đã đăng bài viết mới thành công!", "success");
    } catch (err: any) {
      showNotification("Đăng bài viết thất bại: " + (err.message || err), "error");
    }
  };

  // Toggle Like (Like / Unlike)
  const handleLike = async (postId: string, username: string) => {
    // Optimistic UI Update for instant feedback
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const likedIdx = post.likes.indexOf(username);
          const newLikes = [...post.likes];
          if (likedIdx > -1) {
            newLikes.splice(likedIdx, 1);
          } else {
            newLikes.push(username);
          }
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );

    try {
      const updated = await ApiService.likePost(postId, username);
      // Sync back with database response
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updated : post))
      );
    } catch (err) {
      console.error("Failed to toggle like on server:", err);
      // Re-fetch in case of failure to sync back UI
      fetchPosts();
    }
  };

  // Submit Comment
  const handleComment = async (postId: string, username: string, avatarUrl: string) => {
    const commentText = commentInputs[postId] || "";
    if (!commentText.trim()) return;

    try {
      const commentData = {
        author: username,
        avatar: avatarUrl,
        text: commentText
      };
      
      const updated = await ApiService.commentPost(postId, commentData);
      
      // Update local state and clear input field
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updated : post))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      showNotification("Đăng bình luận thành công!", "success");
    } catch (err: any) {
      showNotification("Đăng bình luận thất bại: " + (err.message || err), "error");
    }
  };

  // Share / Forward post
  const handleShare = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          return { ...post, shares: post.shares + 1 };
        }
        return post;
      })
    );

    try {
      await ApiService.sharePost(postId);
      showNotification("Đã chia sẻ thành công bài viết!", "success");
    } catch (err: any) {
      console.error("Failed to record share on server:", err);
      showNotification("Chia sẻ bài viết thất bại: " + (err.message || err), "error");
      fetchPosts();
    }
  };

  // Toggle visibility of comment panel
  const toggleCommentPanel = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Update comment input field value
  const handleCommentInputChange = (postId: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));
  };

  // Edit post
  const handleEditPost = async (postId: string, content: string, username: string, role: string) => {
    try {
      const updated = await ApiService.editPost(postId, content, username, role);
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updated : post))
      );
      showNotification("Đã chỉnh sửa bài viết thành công!", "success");
    } catch (err: any) {
      showNotification("Chỉnh sửa bài viết thất bại: " + (err.message || err), "error");
      throw err;
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string, username: string, role: string) => {
    try {
      await ApiService.deletePost(postId, username, role);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      showNotification("Đã xóa bài viết thành công!", "success");
    } catch (err: any) {
      showNotification("Xóa bài viết thất bại: " + (err.message || err), "error");
    }
  };

  return {
    posts,
    loading,
    error,
    newPostContent,
    setNewPostContent,
    commentInputs,
    openComments,
    handleCreatePost,
    handleLike,
    handleComment,
    handleShare,
    toggleCommentPanel,
    handleCommentInputChange,
    handleEditPost,
    handleDeletePost,
    refreshPosts: fetchPosts
  };
}
