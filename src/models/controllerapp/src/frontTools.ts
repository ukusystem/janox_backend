import { AtomicNumber } from './atomicNumber';
import { trimString, writeNewTicketPhotoFromBase64 } from './useful';
import { spawnSync } from 'child_process';

const SPAWN_TIMEOUT_MS = 30 * 1000;

export interface FileToThumb {
  filepath: string;
  type: string;
}

export interface ThumbData {
  result: boolean;
  sizeBytes: number;
  thumbBase64: string;
}

const defaultThumbData: ThumbData = { result: false, sizeBytes: 0, thumbBase64: '' };

/**
 * Spawn a process synchronously
 * @param commnad
 * @param args
 * @returns The stdout of the process
 */
async function spawnCommandArgs(commnad: string, args: string[]): Promise<Buffer | null> {
  try {
    const spawnProc = spawnSync(commnad, args, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true, timeout: SPAWN_TIMEOUT_MS });
    if (spawnProc.error) {
      console.log(`ERROR With no throw in spawn`);
      console.log(spawnProc.error);
      return null;
    }
    // console.log(`>spawnAsync stdout length: ${spawnProc?.stdout.length}`);
    return spawnProc.stdout;
  } catch (e) {
    console.log(`ERROR Spawn sync\n${e}`);
  }
  return null;
}

/**
 * Process a image buffer and resize it to a thumbnail size
 * @param input Original image buffer
 * @returns
 */
async function resizeFromStdinAndFinish(input: Buffer | null): Promise<ThumbData> {
  if (!input) {
    console.log(`ERROR Input for pipe is null`);
    return defaultThumbData;
  }
  try {
    const thumbArgs = ['-i', '-', '-y', '-vf', 'scale=200:112:force_original_aspect_ratio=increase,crop=200:112', '-c:v', 'libwebp', '-f', 'webp', '-'];
    const thumbProc = spawnSync('ffmpeg', thumbArgs, { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, timeout: SPAWN_TIMEOUT_MS, input: input });
    const thumb64 = thumbProc.stdout.toString('base64');
    if (thumbProc.error) {
      console.log(`ERROR With no throw finishing image`);
      console.log(thumbProc.error);
    }
    // console.log(`>resize stdout length ${thumbProc.stdout.length}`);
    return {
      result: thumbProc.error || thumbProc.stdout.length === 0 || thumb64.length === 0 ? false : true,
      sizeBytes: thumbProc.stdout.length,
      thumbBase64: thumb64,
    };
  } catch (e) {
    console.log(`ERROR Resizing to thumb size\n${e}`);
  }
  return defaultThumbData;
}

/**
 * Generate a thumbnail for a filename. The filepath must be a full path or relative to the project root
 */
export async function generateThumbs(fileData: FileToThumb): Promise<ThumbData> {
  switch (fileData.type) {
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
      const imgArgs = ['-i', fileData.filepath, '-vf', 'scale=200:112:force_original_aspect_ratio=increase,crop=200:112', '-c:v', 'libwebp', '-f', 'webp', '-'];
      const imgStdout = await spawnCommandArgs('ffmpeg', imgArgs);
      if (!imgStdout) {
        return defaultThumbData;
      }
      return {
        result: !imgStdout || imgStdout.length === 0 ? false : true,
        sizeBytes: imgStdout.length,
        thumbBase64: imgStdout.toString('base64'),
      };
    case 'application/pdf':
      const pdfArgs = ['-dBATCH', '-dNOPAUSE', '-dSAFER', '-sDEVICE=png16m', '-q', '-r100', '-dFirstPage=1', '-dLastPage=1', '-dGraphicsAlphaBits=4', '-dTextAlphaBits=4', '-sOutputFile=-', `${fileData.filepath}`];
      const pdfBuffer = await spawnCommandArgs('gswin64c', pdfArgs);
      return resizeFromStdinAndFinish(pdfBuffer);
    case 'video/mp4':
      const frameArgs = ['-i', fileData.filepath, '-vf', 'select=eq(n\\,1)', '-vframes', '1', '-f', 'image2pipe', '-'];
      const videoBuffer = await spawnCommandArgs('ffmpeg', frameArgs);
      return resizeFromStdinAndFinish(videoBuffer);
    default:
      console.log('File type not expected');
      break;
  }
  return defaultThumbData;
}

/**
 * FOR DEVELOPMENT ONLY
 * Deprecated for safety :)
 * @deprecated
 */
export async function test_createThumb() {
  const res1 = await generateThumbs({ filepath: 'C:/Users/hansg/Pictures/m.pdf', type: 'application/pdf' });
  // const res1 = await generateThumbs({ filepath: 'C:/Users/hansg/Pictures/j.png', type: 'image/png' });
  // const res1 = await generateThumbs({ filepath: 'C:/Users/hansg/Pictures/s.mp4', type: 'video/mp4' });
  const size = new AtomicNumber();
  const res3 = await writeNewTicketPhotoFromBase64(res1.thumbBase64, Date.now(), 1, size);
  console.log(`>Written: ${res3} Result: ${res1.result} Size: ${res1.sizeBytes} bytes File: '${trimString(res1.thumbBase64)}'`);
}
