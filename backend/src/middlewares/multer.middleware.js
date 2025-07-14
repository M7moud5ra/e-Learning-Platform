import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure public directory exists
const publicDir = "./public";
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, publicDir)
    },
    filename: function (req, file, cb) {
      // Generate unique filename to avoid conflicts
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
      cb(null, fileName)
    }
  })
  
export const upload = multer({ 
    storage, 
})