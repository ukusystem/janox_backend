import path from 'path';
import fs from 'fs';

export const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const toPosixPath = (filePath: string) => filePath.split(path.sep).join(path.posix.sep);

export const moveFile = (source: string, destination: string) => {
  ensureDirExists(path.dirname(destination));
  fs.renameSync(source, destination);
};
