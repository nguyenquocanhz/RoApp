"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/ecosystem/appState.context";
import { useNotification } from "@/ecosystem/notification.context";
import { useAuth } from "@/ecosystem/auth.context";

export interface SubmitForm {
  name: string;
  developer: string;
  version: string;
  platform: "android" | "ios" | "web";
  category: string;
  description: string;
  detailedDescription: string;
  fileSizeMB: number;
  iconUrl: string;
  screenshots: string[];
  techStackCSV?: string;
}

const INITIAL_FORM: SubmitForm = {
  name: "",
  developer: "",
  version: "1.0.0",
  platform: "android",
  category: "Trò chơi",
  description: "",
  detailedDescription: "",
  fileSizeMB: 0,
  iconUrl: "",
  screenshots: [],
  techStackCSV: ""
};

// Telegram Cloud Configuration
const TELEGRAM_BOT_TOKEN = "8304432515:AAFsYK5T_6TBw38y3V4ye6P7ZL-g14vdlzo";
const TELEGRAM_CHAT_ID = "-5155137502";

export function useSubmitAppController() {
  const { addApp } = useAppState();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [form, setForm] = useState<SubmitForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof SubmitForm | "driveUrl" | "githubUrl" | "uploadFile" | "iconUpload" | "screenshotsUpload", string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Advanced upload selector states
  const [developerType, setDeveloperType] = useState<"display" | "custom">("display");
  const [fileSourceType, setFileSourceType] = useState<"drive" | "github" | "upload">("drive");
  const [driveUrl, setDriveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Image upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [screenshotsUploading, setScreenshotsUploading] = useState(false);
  const [screenshotsProgress, setScreenshotsProgress] = useState(0);

  // Auto populate uploader Display Name if developerType is display
  useEffect(() => {
    if (developerType === "display" && user) {
      setForm((prev) => ({ ...prev, developer: user.username }));
    } else if (developerType === "custom") {
      setForm((prev) => ({ ...prev, developer: "" }));
    }
  }, [developerType, user]);

  // Upload utility using XMLHttpRequest for progress tracking
  const uploadFileToTelegram = (
    file: File,
    type: "document" | "photo",
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("chat_id", TELEGRAM_CHAT_ID);
      
      if (type === "photo") {
        formData.append("photo", file);
      } else {
        formData.append("document", file);
      }

      const endpoint = type === "photo" ? "sendPhoto" : "sendDocument";
      xhr.open("POST", `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`);

      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (!response.ok) {
              return reject(new Error(response.description || "Telegram API upload failed"));
            }
            
            let fileId = "";
            if (type === "photo") {
              const photos = response.result.photo;
              fileId = photos[photos.length - 1].file_id; // Get the highest resolution image
            } else {
              fileId = response.result.document.file_id;
            }

            // Fetch actual file URL path from Telegram servers
            const pathRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
            const pathData = await pathRes.json();
            
            if (!pathData.ok) {
              console.warn("Telegram getFile warning:", pathData.description);
              // Fallback for files > 20MB where getFile fails due to Telegram API limits
              const messageId = response.result.message_id;
              const chat = response.result.chat;
              
              let fallbackUrl = "";
              if (chat.username) {
                // Public channel/group link format (accessible to anyone)
                fallbackUrl = `https://t.me/${chat.username}/${messageId}`;
              } else {
                // Private channel/group link format (requires membership)
                const chatIdStr = Math.abs(chat.id).toString();
                const cleanChatId = chatIdStr.startsWith("100") ? chatIdStr.substring(3) : chatIdStr;
                fallbackUrl = `https://t.me/c/${cleanChatId}/${messageId}`;
              }
              
              resolve(fallbackUrl);
              return;
            }

            const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${pathData.result.file_path}`;
            resolve(fileUrl);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`Telegram server error code: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network Error during file transfer to Telegram"));
      };

      xhr.send(formData);
    });
  };

  // Real Upload for App/ZIP Source Code
  const startTelegramUpload = (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);

    // Auto-detect and set file size!
    const sizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
    setForm((prev) => ({ ...prev, fileSizeMB: sizeMB }));

    uploadFileToTelegram(file, "document", (progress) => {
      setUploadProgress(progress);
    })
      .then((url) => {
        setUploadedFileUrl(url);
        setUploading(false);
        showNotification(`Đã tải lên tệp cài đặt lên Telegram Cloud thành công!`, "success");
        
        setErrors((errs) => {
          const copy = { ...errs };
          delete copy.uploadFile;
          return copy;
        });
      })
      .catch((err) => {
        console.error("Telegram Upload Error:", err);
        setUploading(false);
        showNotification("Tải lên FileCloud thất bại: " + err.message, "error");
      });
  };

  // Real Upload for Logo
  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    setLogoProgress(0);
    try {
      const url = await uploadFileToTelegram(file, "photo", (progress) => {
        setLogoProgress(progress);
      });
      setForm((prev) => ({ ...prev, iconUrl: url }));
      showNotification("Đã tải biểu tượng logo lên Telegram Cloud thành công!", "success");
      
      setErrors((errs) => {
        const copy = { ...errs };
        delete copy.iconUrl;
        return copy;
      });
    } catch (err: any) {
      console.error("Logo Upload Error:", err);
      showNotification("Tải logo thất bại: " + err.message, "error");
    } finally {
      setLogoUploading(false);
    }
  };

  // Real Upload for Previews/Screenshots
  const handleScreenshotsUpload = async (files: FileList) => {
    setScreenshotsUploading(true);
    setScreenshotsProgress(0);
    try {
      const urls: string[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const url = await uploadFileToTelegram(file, "photo", (progress) => {
          const currentProgress = Math.round(((i + progress / 100) / totalFiles) * 100);
          setScreenshotsProgress(currentProgress);
        });
        urls.push(url);
      }
      
      setForm((prev) => ({ 
        ...prev, 
        screenshots: [...prev.screenshots, ...urls] 
      }));
      showNotification(`Đã tải lên thành công ${totalFiles} ảnh minh họa lên Telegram Cloud!`, "success");
    } catch (err: any) {
      console.error("Screenshots Upload Error:", err);
      showNotification("Tải ảnh minh họa thất bại: " + err.message, "error");
    } finally {
      setScreenshotsUploading(false);
    }
  };

  const handleRemoveScreenshot = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleChange = (
    key: keyof SubmitForm,
    value: string | number
  ) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      
      if (key === "platform") {
        if (value === "android") {
          updated.category = "Trò chơi";
        } else if (value === "ios") {
          updated.category = "Thiết kế & Đồ họa";
        } else if (value === "web") {
          updated.category = "Thương mại điện tử";
        }
      }
      
      return updated;
    });

    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!form.name.trim()) newErrors.name = "Tên ứng dụng/mã nguồn là bắt buộc";
    if (!form.developer.trim()) newErrors.developer = "Tên nhà phát triển là bắt buộc";
    if (!form.description.trim()) newErrors.description = "Mô tả ngắn là bắt buộc";
    if (!form.detailedDescription.trim()) newErrors.detailedDescription = "Mô tả chi tiết là bắt buộc";
    if (form.fileSizeMB <= 0) newErrors.fileSizeMB = "Dung lượng phải lớn hơn 0";
    if (!form.iconUrl) newErrors.iconUrl = "Vui lòng tải lên Logo của ứng dụng";

    if (fileSourceType === "drive" && !driveUrl.trim()) {
      newErrors.driveUrl = "Đường dẫn Google Drive là bắt buộc";
    }
    if (fileSourceType === "github" && !githubUrl.trim()) {
      newErrors.githubUrl = "Đường dẫn kho lưu trữ GitHub là bắt buộc";
    }
    if (fileSourceType === "upload" && !uploadedFileUrl) {
      newErrors.uploadFile = "Vui lòng tải lên tệp cài đặt";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showNotification("Vui lòng điền đầy đủ các thông tin bắt buộc và tải lên logo!", "warning");
      return;
    }

    const fileSize = form.fileSizeMB * 1024 * 1024;
    
    // Set download URL based on selected source type
    let downloadUrl = "";
    if (fileSourceType === "drive") {
      downloadUrl = driveUrl.trim();
    } else if (fileSourceType === "github") {
      downloadUrl = githubUrl.trim();
    } else {
      downloadUrl = uploadedFileUrl;
    }
    
    const techStack = form.platform === "web" && form.techStackCSV
      ? form.techStackCSV.split(",").map(s => s.trim()).filter(Boolean)
      : undefined;

    addApp({
      name: form.name.trim(),
      developer: form.developer.trim(),
      version: form.version.trim(),
      platform: form.platform,
      category: form.category,
      description: form.description.trim(),
      detailedDescription: form.detailedDescription.trim(),
      iconUrl: form.iconUrl,
      screenshots: form.screenshots,
      fileSize,
      downloadUrl,
      techStack
    });

    showNotification("Đăng tải ứng dụng thành công! Đang chờ duyệt từ hệ thống.", "success");
    setIsSuccess(true);
    setForm(INITIAL_FORM);
    setDriveUrl("");
    setGithubUrl("");
    setUploadedFileUrl("");
    setUploadedFileName("");
  };

  const resetSuccess = () => {
    setIsSuccess(false);
  };

  return {
    form,
    errors,
    isSuccess,
    developerType,
    setDeveloperType,
    fileSourceType,
    setFileSourceType,
    driveUrl,
    setDriveUrl,
    githubUrl,
    setGithubUrl,
    uploadedFileName,
    uploading,
    uploadProgress,
    logoUploading,
    logoProgress,
    screenshotsUploading,
    screenshotsProgress,
    startTelegramUpload,
    handleLogoUpload,
    handleScreenshotsUpload,
    handleRemoveScreenshot,
    handleChange,
    handleSubmit,
    resetSuccess
  };
}
