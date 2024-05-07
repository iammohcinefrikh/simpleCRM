import express from "express";

import clientRoutes from "./routes/clientRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import enterpriseRoutes from "./routes/enterpriseRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(express.json());

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError) {
    return response.status(400).json({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid request syntax."
    });
  }
  
  else {
    next();
  }
});

app.use(clientRoutes);
app.use(supplierRoutes);
app.use(invoiceRoutes);
app.use(enterpriseRoutes);
app.use(productRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server Listening on port: ", PORT);
});