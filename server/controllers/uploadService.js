const uploadService = {};

uploadService.processUpload = async (file) => {
  const uploadTime = Date.now() - file.lastModified;
  const fileSize = file.size;
  const throughput = fileSize / (uploadTime / 1000); // Bytes per second

  // Simulate delay for testing purposes
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return { uploadTime, throughput, fileSize };
};

module.exports = uploadService;
