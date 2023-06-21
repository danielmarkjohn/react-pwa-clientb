const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();

// Apply security-related headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// Set rate limiting to prevent abuse or brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable parsing of JSON request bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Define the storage configuration for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Include the controllers
// Define the file upload middleware
const fileUpload = upload.single("file");
// Include the controllers
const uploadController = require("./controllers/uploadController");

app.use(express.static(path.join(__dirname, "..", "build")));

// Handle requests for the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// API endpoint for file upload
app.post(
  "/api/upload",
  fileUpload, // Use the renamed variable
  (req, res, next) => {
    body("file")
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

      const uploadTime = new Date()
      const fileSize = req.file.size;
      const throughput = fileSize / (uploadTime / 1000); // Bytes per second
      const addedDelay = 0;

      const result = {uploadTime, fileSize, throughput, addedDelay}

      setTimeout(() => {
        res.json(result);
      }, addedDelay);
    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ...


// Handle not found (404) errors
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8000");
});
