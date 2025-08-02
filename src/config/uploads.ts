import * as _ from 'lodash';
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const multer = require('multer')
const multerS3 = require('multer-s3-transform')
const mkdirp = require('mkdirp')
const { appConst } = require('../libs/constants')
const { ALLOWED_MIME_TYPE, ERR_FILE_TYPE, VIDEO_MIME_TYPE } = appConst;

const s3 = new AWS.S3()

const uploadStorage = multer.diskStorage({
  destination: async function (req: any, file: any, cb: any) {
    const type = req.body.type
    const prefix = `${process.env.UPLOADS}/${type}`
    await mkdirp(prefix)
    cb(null, prefix)
  },
  filename: function (req: any, file: any, cb: any) {
    if (req.body && req.body.type === 'lang') {
      const fileName = req.body.name.replace(/ /g, '_').toLowerCase()
      cb(null, `${fileName}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
    } else {
      cb(null, `${req.body.type}-${uuidv4()}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
    }
  }
})

const maxUploadImageSizeMB = parseFloat(process.env.MAX_UPLOAD_SIZE_IMAGE_MB || '0');
const maxUploadVideoSizeMB = parseFloat(process.env.MAX_UPLOAD_SIZE_VIDEO_MB || '0');
const maxUploadSizeMB = parseFloat(process.env.MAX_UPLOAD_SIZE_VIDEO_MB || '0');

export const uploadsS3 = multer({

  fileFilter: function (req: any, file: any, cb: any) {
    console.log("req.headers")
    const fileSize = parseInt(req.headers['content-length'])
    if (ALLOWED_MIME_TYPE.includes(file.mimetype) || VIDEO_MIME_TYPE.includes(file.mimetype)) {
      if ((ALLOWED_MIME_TYPE.includes(file.mimetype))) {
        if (fileSize <= maxUploadImageSizeMB * 1024 * 1024) {
          cb(null, true)
        } else {
          cb(new Error('1157'))
        }
      } else if (VIDEO_MIME_TYPE.includes(file.mimetype)) {
        if (fileSize <= maxUploadVideoSizeMB * 1024 * 1024) {
          cb(null, true)
        } else {
          cb(new Error('1158'))
        }
      }
    } else {
      cb(new Error('1159'))
    }
  },

  storage: multerS3({
    s3,
    bucket(req: any, file: any, cb: any) {
      const type = req.body.type.toLowerCase()
      cb(null, `${process.env.AWS_BUCKET_NAME}/${type}`)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req: any, file: any, cb: any) {
      if (req.body && req.body.type === 'lang') {
        const fileName = req.body.name.replace(/ /g, '_').toLowerCase()
        cb(null, `${fileName}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
      } else {
        cb(null, `${req.body.type}-${uuidv4()}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
      }
    }
  })
}).single('file_to_upload')



const langUpload = multer({
  limits: { fileSize: maxUploadSizeMB * 1024 * 1024 },
  storage: multerS3({
    s3,
    bucket(req: any, file: any, cb: any) {
      const uploadType = req.body.uploadType.toLowerCase()
      cb(null, `${process.env.AWS_BUCKET_NAME}/${uploadType}`)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req: any, file: any, cb: any) {
      if (req.body && req.body.uploadType === 'lang') {
        const fileName = req.body.name.replace(/ /g, '_').toLowerCase()
        const prefix = req.body.type.replace(/ /g, '_').toLowerCase()
        cb(null, `${prefix}_${fileName}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
      } else {
        cb(null, `${req.body.uploadType}-${uuidv4()}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
      }
    }
  })
}).single('lang_upload')

const countryUpload = multer({
  limits: { fileSize: maxUploadSizeMB * 1024 * 1024 },
  storage: multerS3({
    s3,
    bucket(req: any, file: any, cb: any) {
      const type = req.body.type.toLowerCase()
      cb(null, `${process.env.AWS_BUCKET_NAME}/${type}`)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      if (req.body && req.body.type === 'country') {
        const fileName = req.body.name.replace(/ /g, '_').toLowerCase()
        cb(null, `${fileName}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
      } else {
        cb(null, `${req.body.type}-${uuidv4()}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`)
      }
    }
  })
}).single('country_upload')

const uploads = multer({
  storage: uploadStorage,
  limits: { fileSize: maxUploadImageSizeMB * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (_.includes(ALLOWED_MIME_TYPE, file.mimetype) === false) {
      cb(new Error(ERR_FILE_TYPE))
    } else {
      cb(null, true)
    }
  }
}).single('file_to_upload')


module.exports = {
  uploads,
  langUpload,
  uploadsS3,
  countryUpload
}
