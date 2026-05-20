import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import multer from 'multer'

dotenv.config()

const uploadPath = process.env.UPLOAD_PATH || 'src/uploads'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    cb(null, `${crypto.randomUUID()}-${Date.now()}${extension}`)
  },
})

const allowedMimeTypes = ['video/mp4', 'application/pdf']
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido'))
  }
  return cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 100) * 1024 * 1024,
  },
})

export default upload
