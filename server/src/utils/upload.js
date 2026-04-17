import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");
const idCardDir = path.resolve(__dirname, "../../uploads/id-cards");
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(idCardDir, { recursive: true });

// Storage for listing images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage for ID cards
const idCardStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, idCardDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only JPG and PNG images are allowed"));
    return;
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export const setupIdCardUpload = multer({
  storage: idCardStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});
