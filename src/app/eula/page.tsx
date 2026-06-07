import React from "react";
import dbConnect from "@/utils/dbConnect";
import Setting from "@/models/Setting";
import styles from "./page.module.css";

function parseMarkdown(md: string) {
  if (!md) return "";
  return md
    .split("\n\n")
    .map((block) => {
      let trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("## ")) {
        return `<h2>${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith("### ")) {
        return `<h3>${trimmed.slice(4)}</h3>`;
      }
      if (trimmed.startsWith("# ")) {
        return `<h1>${trimmed.slice(2)}</h1>`;
      }
      if (trimmed.startsWith("- ") || trimmed.includes("\n- ") || trimmed.startsWith("1. ")) {
        const items = trimmed.split("\n").map(item => {
          const trimmedItem = item.trim();
          if (trimmedItem.startsWith("- ")) {
            return `<li>${trimmedItem.slice(2)}</li>`;
          }
          if (/^\d+\.\s/.test(trimmedItem)) {
            return `<li>${trimmedItem.replace(/^\d+\.\s/, "")}</li>`;
          }
          return trimmedItem ? `<li>${trimmedItem}</li>` : "";
        }).join("");
        if (trimmed.startsWith("- ")) {
          return `<ul>${items}</ul>`;
        } else {
          return `<ol>${items}</ol>`;
        }
      }
      return `<p>${trimmed}</p>`;
    })
    .join("")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export const revalidate = 0; // Disable static cache to update instantly when admin changes it

export default async function EulaPage() {
  await dbConnect();
  const eulaSetting = await Setting.findOne({ key: "eula" });
  const content = eulaSetting?.value || "## ĐIỀU KHOẢN SỬ DỤNG (EULA)\n\nNội dung đang được cập nhật.";

  const htmlContent = parseMarkdown(content);

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "2rem 1.5rem" }}>
      <div className={`${styles.card} glass`}>
        <div 
          className={styles.markdownBody}
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    </div>
  );
}
