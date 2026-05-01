const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transactions");
 
const app = express();
const PORT = process.env.PORT || 4000;
 
app.use(cors({ origin: "http://localhost:5173" })); // adjust to your Vite/CRA port
app.use(express.json());
 
app.use("/api/transactions", transactionRoutes);
 
// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 