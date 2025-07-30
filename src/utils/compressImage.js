import imageCompression from 'browser-image-compression';

/**
 * Compress an image file in the browser.
 * @param {File} file - Original image file selected via <input type="file">.
 * @returns {Promise<File>} - Compressed image file (or original if compression fails).
 */
export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Fallback to original file if compression fails
  }
};
