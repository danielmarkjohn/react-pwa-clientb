const { validationResult } = require("express-validator");
const { uploadService } = require("./uploadService");
const { body } = require("express-validator");

const upload = async (req, res, next) => {
  // Validation checks
  await body("file")
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error("No file provided");
      }
      return true;
    })
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await uploadService.processUpload(req.file);
    res.json(result);
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  upload,
};
