import { diskStorage } from 'multer';

export const multerConfig = {
  storage: diskStorage({
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
};
