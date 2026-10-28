const dotenv = require("dotenv");

// Load .env BEFORE anything else uses process.env
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`FermiScope server running on port ${PORT}`);
  });
});
