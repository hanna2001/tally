const express = require("express");
const cors = require("cors");
const compression = require("compression");
const transactionRoutes = require("./routes/transactions");
const sheetsRouter = require("./routes/sheets")
 
const app = express();
app.use(compression());
const PORT = process.env.PORT || 4000;
 
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
 
app.use("/api/transactions", transactionRoutes);
app.use("/api/sheets", sheetsRouter);
 
// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 