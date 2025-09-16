import path from "path";
import { Language } from "@repo/types/i18n";

export interface PathInfo {
  siteName: string;
  language: Language;
  filename: string;
  fullPath: string;
}

/**
 * Parse file path to extract site name, language, and filename
 * Expected format: siteName/language/filename.mdx
 */
export function parseFilePath(filePath: string): PathInfo {
  const normalizedPath = path.normalize(filePath);
  const parts = normalizedPath.split(path.sep);

  if (parts.length < 3) {
    throw new Error(
      "Invalid file path format. Expected format: siteName/language/filename.mdx",
    );
  }

  const siteName = parts[parts.length - 3]!;
  const language = parts[parts.length - 2] as Language;
  const filename = parts[parts.length - 1]!;

  // Validate language
  if (!Object.values(Language).includes(language)) {
    throw new Error(
      `Invalid language "${language}". Supported languages: ${Object.values(
        Language,
      ).join(", ")}`,
    );
  }

  // Validate file extension
  if (!filename.endsWith(".mdx")) {
    throw new Error("File must have .mdx extension");
  }

  // Build full path relative to content directory
  const contentDir = path.join(process.cwd(), "content");
  const fullPath = path.join(contentDir, siteName, language, filename);

  return {
    siteName,
    language,
    filename,
    fullPath,
  };
}
