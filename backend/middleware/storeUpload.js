import multer from "multer";
import path from "path";
import fs from "fs";

// ensure uploads folder exists
const dir = "uploads/store";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "store_" + Date.now() + ext);
  }
});

// Only allow images
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images allowed"), false);
  }
  cb(null, true);
}

export const storeUpload = multer({ storage, fileFilter });
