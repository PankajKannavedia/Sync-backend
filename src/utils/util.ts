import * as fs from "fs";
import md5File from 'md5-file';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== "number" && value === "") {
    return true;
  } else if (typeof value === "undefined" || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === "object" &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

export const createDirectoryIfNotExists = (dir: string) => {
  return new Promise((res) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }
    res(true);
  });
};

/**
 * Get md5 hash for files
 */
export const getFileHash = async ({ fileData }: { fileData: { name: string; path: string } }) => {
  const fileBufferHash = await md5File.sync(fileData.path);

  return {
    name: fileData.name,
    hash: fileBufferHash,
    path: fileData.path,
  };
};