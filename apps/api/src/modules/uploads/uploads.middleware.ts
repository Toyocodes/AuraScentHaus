import multer from "multer";
import { ApiError } from "../../utils/api-error.js";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Files are kept in memory, then streamed to Supabase Storage. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5 MB each
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES[file.mimetype]) return cb(null, true);
    cb(ApiError.badRequest("Only JPG, PNG, WebP or AVIF images are allowed", "INVALID_FILE_TYPE"));
  },
});
