import { MulterMiddlewareConfig } from '../../middlewares/multer.middleware';

export const multerAccessImportArgs: MulterMiddlewareConfig = {
  bodyFields: ['form'],
  fieldConfigs: [{ field: { name: 'files', maxCount: 1 }, allowedMimeTypes: ['application/json'], maxFileSize: 5 * 1024 * 1024 }],

  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5MB
    fieldSize: 5 * 1024 * 1024, // 5MB
  },
};
