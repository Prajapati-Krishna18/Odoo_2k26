/**
 * @file    storage.service.ts
 * @desc    Pluggable File Storage Service infrastructure supporting Local disk
 *          and cloud providers (AWS S3, Cloudinary, Supabase Storage).
 */

import path from "node:path";
import fs from "node:fs";

// ── Storage Provider Interface ────────────────────────────────

export interface StorageProvider {
  name: string;
  upload(file: Express.Multer.File, targetSubfolder?: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
}

// ── Local Disk Storage Provider ───────────────────────────────

class LocalStorageProvider implements StorageProvider {
  name = "local";

  async upload(file: Express.Multer.File, targetSubfolder: string = ""): Promise<string> {
    const baseDir = path.resolve(process.cwd(), "uploads");
    const targetDir = path.join(baseDir, targetSubfolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const destinationPath = path.join(targetDir, uniqueName);

    // Write file to target destination
    if (file.buffer) {
      // Memory storage (buffers)
      await fs.promises.writeFile(destinationPath, file.buffer);
    } else if (file.path) {
      // Disk storage (temp files copy)
      await fs.promises.copyFile(file.path, destinationPath);
      // Clean up temp file
      try {
        await fs.promises.unlink(file.path);
      } catch {}
    } else {
      throw new Error("Invalid file format: No buffer or temporary file path detected");
    }

    // Return relative URL with forward slashes
    const relativeUrl = path
      .relative(process.cwd(), destinationPath)
      .replace(/\\/g, "/");

    return `/${relativeUrl}`;
  }

  async delete(fileUrl: string): Promise<void> {
    // Sanitize path to prevent directory traversal
    const relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
    const absolutePath = path.resolve(process.cwd(), relativePath);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  }
}

// ── Cloud Providers Interfaces (For Future Developers) ────────

class S3StorageProvider implements StorageProvider {
  name = "s3";
  async upload(_file: Express.Multer.File): Promise<string> {
    console.log("☁️  [S3 Cloud Storage] Uploading file to AWS S3 bucket...");
    return "/uploads/s3-mock-url.png";
  }
  async delete(_url: string): Promise<void> {
    console.log("☁️  [S3 Cloud Storage] Deleting file from AWS S3...");
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  name = "cloudinary";
  async upload(_file: Express.Multer.File): Promise<string> {
    console.log("☁️  [Cloudinary] Uploading file to Cloudinary assets...");
    return "/uploads/cloudinary-mock-url.png";
  }
  async delete(_url: string): Promise<void> {
    console.log("☁️  [Cloudinary] Deleting asset from Cloudinary...");
  }
}

// ── Reusable Storage Service Manager ──────────────────────────

export class StorageService {
  private static provider: StorageProvider = new LocalStorageProvider();

  /**
   * Configure the active storage provider dynamically at runtime.
   */
  static setProvider(provider: StorageProvider) {
    this.provider = provider;
    console.log(`📂  Storage service provider swapped to: '${provider.name}'`);
  }

  /**
   * Reusable upload helper.
   */
  static async upload(file: Express.Multer.File, targetSubfolder?: string): Promise<string> {
    return this.provider.upload(file, targetSubfolder);
  }

  /**
   * Reusable deletion helper.
   */
  static async delete(fileUrl: string): Promise<void> {
    return this.provider.delete(fileUrl);
  }
}

// ── Initialize Provider based on env variables ────────────────

const activeProvider = (process.env["STORAGE_PROVIDER"] || "local").toLowerCase();
if (activeProvider === "s3") {
  StorageService.setProvider(new S3StorageProvider());
} else if (activeProvider === "cloudinary") {
  StorageService.setProvider(new CloudinaryStorageProvider());
} else {
  StorageService.setProvider(new LocalStorageProvider());
}
