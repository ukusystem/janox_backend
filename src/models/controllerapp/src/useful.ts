import { AtomicNumber } from './atomicNumber';
import { BaseAttach } from './baseAttach';
import fs from 'fs/promises';
import fsNormal from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import path from 'path';
import * as codes from './codes';
import { FirmwareVersion } from './firmware';
// import process from 'node:process'
const BCRYPT_STRENGTH = 12;
const MAX_FILE_SIZE_B = 5 * 1000 * 1000;
const PHOTO_BASE_NAME = 'foto';
const PHOTO_NEW_BASE_NAME = 'foto_new_';
const PHOTO_FORMAT = '.png';
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const YEAR_FORMAT = 'YYYY';
const MONTH_FORMAT = 'MM';

// export const DUMMY_DATE = "2000-01-01 00:00:00";

const PHOTOS_RELATIVE_PATH = 'photos';
const REGISTERED_RELATIVE_PATH = 'registered';
const MAX_LOG_LINE_LENGTH = 120;

let osName: string | null = null;

/**
 * List of known errors.
 */
export const error = [codes.ERR];

/**
 *
 * @returns Whether the current OS is Windows based.
 */
export function isWindows(): boolean {
  if (osName === null) {
    osName = process.platform;
  }
  return osName === 'win32';
  // return true
}

/**
 *
 * @returns Whether the current OS is Linux based.
 */
export function isLinux(): boolean {
  if (osName === null) {
    osName = process.platform;
  }
  return osName === 'linux';
}

/**
 * @param buffer Buffer to get the file content from.
 * @return The version object, or null if the data could not be found in the predefined position.
 */
function getVersionFromBuffer(buffer: Buffer): FirmwareVersion | null {
  const start = 0x30;
  const length = 16;
  const sub = buffer.subarray(start, start + length);
  // console.log(buffer.subarray(0, start).toString('hex'));
  // console.log(sub.toString('hex'));
  // console.log("Base64 head '" + buffer.toString('base64').substring(0, 30) + "' Hex head '" + buffer.subarray(0, start + length).toString('hex') + "'");
  const versionString = sub.toString();
  const verParts = versionString.split('.');
  const major = parseInt(verParts[0]);
  const minor = parseInt(verParts[1]);
  const patch = parseInt(verParts[2]);
  if (major >= 0 && minor >= 0 && patch >= 0) {
    return { major: major, minor: minor, patch: patch };
  }
  return null;
}

export async function getVersionFromFile(path: string): Promise<FirmwareVersion | null> {
  const fileBuffer = await readFileAsBuffer(path);
  if (!fileBuffer) {
    return null;
  }
  return getVersionFromBuffer(fileBuffer);
}

/**
 * Like {@linkcode getVersionFromBuffer} but it gets the content from a base64 string.
 * @param base64Content
 * @returns
 */
export function getVersionFromBase64(base64Content: string): FirmwareVersion | null {
  const versionString = Buffer.from(base64Content, 'base64');
  return getVersionFromBuffer(versionString);
}

export function toHex(number: number): string {
  return '0x' + number.toString(16);
}

/**
 * Parse the date time.
 *
 * @param date The date in a specific format.
 * @returns The equivalent date in seconds, or `-1` if an error occurred.
 * @see {@linkcode DATE_FORMAT}
 */
export function datetimeToLong(date: string) {
  const curDate = new Date(date);
  if (!isNaN(curDate.getTime())) {
    return curDate.getTime() / 1000;
  }
  return -1;
}

export function lastPart(text: string): string {
  return text.length >= MAX_LOG_LINE_LENGTH ? ' ... ' + text.substring(text.length - MAX_LOG_LINE_LENGTH) : text;
}

/**
 * Trim the provide string if it is longer than {@linkcode MAX_LOG_LINE_LENGTH}.
 *
 * @param text The text to trim.
 * @returns The trimmed text.
 */
export function trimString(text: string): string {
  return text.length >= MAX_LOG_LINE_LENGTH ? text.substring(0, MAX_LOG_LINE_LENGTH) + ' ... ' : text;
}

/**
 * Get the name of the state as a string.
 *
 * @param state State.
 * @returns The name of the state.
 */
export function getStateName(state: number): string {
  return state === codes.VALUE_CONNECTED ? 'connected' : state === codes.VALUE_DISCONNECTED ? 'disconnected' : state === codes.VALUE_DENIED ? 'denied' : 'unknownState';
}

export async function readFileAsBase64(path: string): Promise<string | null> {
  const buf = await readFileAsBuffer(path);
  return buf ? buf.toString('base64') : null;
}

export async function readFileAsBuffer(path: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path);
  } catch (e) {
    console.log(e);
  }
  return null;
}

export async function readWorkerPhotoAsBase64(filename: string): Promise<string | null> {
  return readFileAsBase64(filename);
}

/**
 * Write a file using the bytes from a decoded base64 source.
 *
 * @param base64   Base64 source.
 * @param path Path to write the file to.
 * @param byteSize The size in bytes written to the file. If an error occurs, this value is set to `-1`.
 * @returns True if the write was successful, false otherwise.
 */
export async function writeFileFromBase64(base64: string, filePath: string, byteSize: AtomicNumber): Promise<boolean> {
  try {
    const temp = Buffer.from(base64, 'base64');
    if (temp.length <= MAX_FILE_SIZE_B) {
      const parent = path.dirname(filePath);
      if (!fsNormal.existsSync(parent)) {
        fsNormal.mkdirSync(parent, { recursive: true });
      }
      // await fs.mkdir(parent,{recursive:true})
      // console.log('Directories created')
      await fs.writeFile(filePath, temp);
      // console.log("File written");
      byteSize.inner = temp.length;
      return true;
    } else {
      // console.log("File too big");
    }
  } catch (e) {
    console.log(e);
    // console.log(`Error writing file '${filePath}'`);
    byteSize.inner = -1;
  }
  return false;
}

/**
 * Build a filename using {@linkcode PHOTO_BASE_NAME} and an id.
 *
 * @param id The id included in the filename.
 * @returns The string with the filename.
 */
export function getPhotoFilename(id: number): string {
  return `${PHOTO_BASE_NAME}${id}${PHOTO_FORMAT}`;
}

/**
 * Build a filename using {@linkcode PHOTO_NEW_BASE_NAME} and an id.
 *
 * @param id The id included in the filename.
 * @returns The string with the filename.
 */
export function getPhotoNewFilename(id: number): string {
  return `${PHOTO_NEW_BASE_NAME}${id}${PHOTO_FORMAT}`;
}

/**
 * Build the path for an unregistered worker photo, including the filename.
 * @param nodeID ID of the node to which the ticket belongs.
 * @param millis Number to use as identifier. It is advised to use the current system time {@linkcode Date.now}
 * @returns The built path.
 */
export function getPathForNewWorkerPhoto(nodeID: number, millis: number): string {
  return path.join(PHOTOS_RELATIVE_PATH, BaseAttach.getNodeDBName(nodeID), getPhotoNewFilename(millis));
}

/**
 * Build the path for a worker photo, including the filename.
 * @param workerID ID of the worker.
 * @returns The built path.
 */
export function getPathForWorkerPhoto(workerID: number): string {
  return path.join(PHOTOS_RELATIVE_PATH, REGISTERED_RELATIVE_PATH, getPhotoFilename(workerID));
}

/**
 * Write a file to a path proper for an unregistered worker photo, using {@linkcode PHOTOS_RELATIVE_PATH}, the database name and the file name provided.
 *
 * @param base64
 * @param milis
 * @param nodeID The node ID to built the database name with.
 * @param byteSize
 * @return
 */
export async function writeNewTicketPhotoFromBase64(base64: string, millis: number, nodeID: number, byteSize: AtomicNumber): Promise<boolean> {
  return writeFileFromBase64(base64, getReplacedPath(getPathForNewWorkerPhoto(nodeID, millis)), byteSize);
}

/**
 * Write a file to a path proper for a worker photo, using {@linkcode PHOTOS_RELATIVE_PATH},
 * {@link REGISTERED_RELATIVE_PATH} and building the filename using a worker ID.
 *
 * @param base64 Bytes source
 * @param workerID ID of the worker
 * @param byteSize Amount of bytes written, `-1` if an error occurred.
 * @returns True if the operation was successful, false otherwise.
 * @see {@linkcode writeFileFromBase64}
 */
export async function writePhotoFromBase64(base64: string, workerID: number, byteSize: AtomicNumber): Promise<boolean> {
  return writeFileFromBase64(base64, getReplacedPath(getPathForWorkerPhoto(workerID)), byteSize);
}

/**
 * Replace the `\` in the path with `/`.
 * @param path Path to replace.
 * @returns The replaced string.
 */
export function getReplacedPath(path: string): string {
  return path.replace('\\', '/');
}

/**
 * Hash a string with SHA-256 algorithm,
 *
 * @param text Text to hash
 * @returns The hashed string (hexadecimal values), or null if an error occurred.
 */
export function hash(text: string): string {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return hash;
}

/**
 * Hash a text using BCrypt as algorithm.
 *
 * @param original Original text.
 * @returns The hashed text.
 */
export async function bCryptEncode(original: string): Promise<string | null> {
  return await bcrypt
    .genSalt(BCRYPT_STRENGTH)
    .then((salt) => {
      return bcrypt.hash(original, salt);
    })
    .catch((_error) => {
      // console.log('Error encoding with BCrypt')
      return null;
    });
}

/**
 * Get the system time
 *
 * @returns The time in seconds (time stamp)
 */
export function timeInt(): number {
  return Math.trunc(Date.now() / 1000);
}

/**
 * Format the current time to a format accepted by the database.
 *
 * @returns The current date and time as a string in a default format.
 * @see {@linkcode DATE_FORMAT}
 */
export function getCurrentDate(): string {
  return dayjs().format(DATE_FORMAT);
}

export function getYear(): number | null {
  return parseInt(dayjs().format(YEAR_FORMAT));
}

export function getMonth(): number | null {
  return parseInt(dayjs().format(MONTH_FORMAT));
}

export function fixDate(utcTime: string): string {
  return dayjs(utcTime).format(DATE_FORMAT);
}

/**
 * Format a time stamp into a format accepted by the database.
 *
 * @param timestamp Time in seconds since the Epoch.
 * @returns A string representing the date and time provided.
 * @see {@linkcode DATE_FORMAT}
 */
export function formatTimestamp(timestamp: number): string {
  // console.log(timestamp)
  return dayjs(timestamp * 1000).format(DATE_FORMAT);
}

export function getYearFromTimestamp(timestamp: number): string {
  return dayjs(timestamp * 1000).format(YEAR_FORMAT);
}
