const express = require("express");
const cors = require("cors");
const compression = require("compression");
const transactionRoutes = require("./routes/transaction");
const sheetsRouter = require("./routes/sheet")
const categoriesRouter = require("./routes/categories");
const peopleRouter = require("./routes/people");
const paymentMethodsRouter = require("./routes/paymentMethod");


const app = express();
app.use(compression());
const PORT = process.env.PORT || 4000;
 
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
 
app.use("/api/transactions", transactionRoutes);
app.use("/api/sheets", sheetsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/people", peopleRouter);
app.use("/api/payment-methods", paymentMethodsRouter);
 
// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 