/**
 * Simulated service to manage secure and high-speed downloads
 */
export const DownloadService = {
  /**
   * Triggers a download countdown timer
   */
  startCountdown(seconds: number, onTick: (remaining: number) => void): Promise<void> {
    return new Promise((resolve) => {
      let remaining = seconds;
      onTick(remaining);

      const interval = setInterval(() => {
        remaining -= 1;
        onTick(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  },

  /**
   * Simulates a file download progress
   */
  simulateDownload(
    fileSize: number,
    onProgress: (percent: number, speedMBs: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      let loaded = 0;
      const speed = Math.random() * 8 + 4; // 4 to 12 MB/s
      const speedBytes = speed * 1024 * 1024;
      const intervalTime = 100; // updates every 100ms

      const timer = setInterval(() => {
        loaded += (speedBytes * intervalTime) / 1000;
        
        let percent = Math.min((loaded / fileSize) * 100, 100);
        
        // Add some random speed fluctuation
        const currentSpeed = speed + (Math.random() * 2 - 1);
        
        onProgress(Math.round(percent), parseFloat(currentSpeed.toFixed(1)));

        if (percent >= 100) {
          clearInterval(timer);
          resolve();
        }
      }, intervalTime);
    });
  },

  /**
   * Triggers a real browser file download or redirects to external hosting link
   */
  triggerFileDownload(downloadUrl: string) {
    if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
      // Open real download/cloud links in a new tab
      window.open(downloadUrl, "_blank");
      return;
    }

    // Creating a mock file download in browser for local mock paths
    const element = document.createElement("a");
    const file = new Blob(
      ["[Mock Rổ Ứng Dụng File] Đây là tập tin tải xuống giả lập cho dự án Rổ Ứng Dụng."],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = downloadUrl.split("/").pop() || "app_file.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};
