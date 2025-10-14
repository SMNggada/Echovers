import AWS from 'aws-sdk';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Buffer } from 'buffer';

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: 'AKIAXWMA6SRA44EUF6TO',
  secretAccessKey: '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',
  region: process.env.AWS_REGION || 'eu-north-1',
  signatureVersion: 'v4',
});

// S3 bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'iqspace';

/**
 * Upload a file to S3
 * @param {Object} file - The file object with uri, name, and type
 * @param {string} key - The key (path) to store the file at
 * @param {string} contentType - The content type of the file
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export const uploadFile = async (file, key, contentType) => {
  try {
    console.log('Starting S3 file upload:', { file, key, contentType });

    if (!file?.uri || !file?.name || !file?.type) {
      throw new Error('Invalid file object: missing uri, name, or type');
    }

    const exists = await ReactNativeBlobUtil.fs.exists(file.uri);
    if (!exists) {
      throw new Error(`File not found at URI: ${file.uri}`);
    }

    const fileContent = await ReactNativeBlobUtil.fs.readFile(file.uri);
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
  
    };

    console.log('S3 upload params:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      
    });

    const data = await s3.upload(params).promise();
    console.log('S3 upload successful:', data);
    return data.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw error;
  }
};
/**
 * Get a signed URL for a file in S3
 * @param {string} key - The key (path) of the file
 * @param {number} expiresIn - The number of seconds the URL is valid for
 * @returns {Promise<string>} - The signed URL
 */
export const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    console.log('Getting signed URL for:', { key, expiresIn });
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    console.log('Signed URL:', url);
    return url;
  } catch (error) {
    console.error('Error getting signed URL from S3:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {string} key - The key (path) of the file to delete
 * @returns {Promise<boolean>} - True if the file was deleted successfully
 */
export const deleteFile = async (key) => {
  try {
    console.log('Deleting S3 file:', { key });
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    console.log('S3 file deleted:', { key });
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw error;
  }
};

/**
 * List files in an S3 directory
 * @param {string} prefix - The directory prefix
 * @returns {Promise<Array>} - Array of file objects
 */
export const listFiles = async (prefix) => {
  try {
    console.log('Listing S3 files:', { prefix });
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    };

    const data = await s3.listObjectsV2(params).promise();
    console.log('S3 files listed:', data.Contents);
    return data.Contents || [];
  } catch (error) {
    console.error('Error listing files from S3:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw error;
  }
};

export default {
  uploadFile,
  getSignedUrl,
  deleteFile,
  listFiles,
};

