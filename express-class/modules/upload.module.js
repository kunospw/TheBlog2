import AWS from "aws-sdk";
import path from "path";
import multer from "multer";
import multerS3 from "multer-s3"; // Fixed: was "multers3"

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({
  storage: multerS3({
    // Fixed: was "multers3"
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE, // Fixed: was "multers3"
    key: (req, file, cb) => {
      const filename = Date.now() + "-" + file.originalname;
      cb(null, filename);
    },
  }),
  fileFilter,
});

export default upload;
