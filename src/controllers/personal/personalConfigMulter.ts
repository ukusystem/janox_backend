import { MulterMiddlewareConfig } from '../../middlewares/multer.middleware';

export const multerCreatePersonalArgs: MulterMiddlewareConfig = {
  bodyFields: ['form'],
  fieldConfigs: [{ field: { name: 'files', maxCount: 1 }, allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'], maxFileSize: 5 * 1024 * 1024 }],
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5MB
    fieldSize: 5 * 1024 * 1024, // 5MB
  },
};
