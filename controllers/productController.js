import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// response handling function
const handleResponse = (response, statusCode, responseType, responseBody, messageBody) => {
  response.status(statusCode).json({
    statusCode: statusCode,
    [responseType]: responseBody,
    message: messageBody
  });
}

// add product
export const addProduct = async (request, response) => {
  try {
    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { productName, productBuyingPrice, productSellingPrice, productDimensions, productWeight, productProfitMarginRate, supplierId } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "productName": "string",
      "productBuyingPrice": "number",
      "productSellingPrice": "number",
      "productDimensions": "string",
      "productWeight": "number",
      "productProfitMarginRate": "number",
      "supplierId": "number"
    };
    const missingKeys = [];
    const emptyKeys = [];
    const wrongTypeKeys = [];

    // loop through each key inside requiredKeys object
    for (let key in requiredKeys) {
      // check if the request body is missing any keys
      if (!request.body.hasOwnProperty(key)) {
        // if so, push them into missingKeys array
        missingKeys.push(key);
      } 
      
      // check if any of the request body keys are missing values
      else if (request.body[key] === "") {
        // if so, push them into emptyKeys array
        emptyKeys.push(key);
      }
      
      // check if any of the request body keys types are not into accordance to specified keys types
      else if (typeof request.body[key] !== requiredKeys[key]) {
        // if so, push them into wrongTypeKeys array
        wrongTypeKeys.push(key);
      }
    }

    // check if the missingKeys array contains any keys
    if (missingKeys.length) {
      // if so, return an error response
      if (missingKeys.length === 1) {
        return handleResponse(response, 400, "error", "Bad request", `Request body is missing the following required key: ${missingKeys}.`);
      }

      else {
        return handleResponse(response, 400, "error", "Bad request", `Request body is missing the following required keys: ${missingKeys.join(", ")}.`);
      }
    }
    
    // check if the emptyKeys array contains any keys
    if (emptyKeys.length) {
      // if so, return an error response
      if (emptyKeys.length === 1) {
        return handleResponse(response, 400, "error", "Bad request", `Following key must have a value: ${emptyKeys}.`);
      }

      else {
        return handleResponse(response, 400, "error", "Bad request", `Following keys must have a value: ${emptyKeys.join(", ")}.`);
      }
    }
    
    // check if the wrongTypeKeys array contains any keys
    if (wrongTypeKeys.length) {
      // if so, return an error response
      if (wrongTypeKeys.length === 1) {
        return handleResponse(response, 400, "error", "Bad request", `Following key have wrong value type: ${wrongTypeKeys}.`);
      }

      else {
        return handleResponse(response, 400, "error", "Bad request", `Following keys have wrong value types: ${wrongTypeKeys.join(", ")}.`);
      }
    }

    // check if the specified supplier does exist in the database
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        supplierId: parseInt(supplierId)
      },
    });

    // if not, return an error response
    if (!existingSupplier) {
      return handleResponse(response, 404, "error", "Not found", "Supplier not found.");
    }

    // check if the specified product already exists in the database
    const existingProduct = await prisma.product.findFirst({
      where: {
        productName: productName,
        productBuyingPrice: productBuyingPrice,
        productSellingPrice: productSellingPrice,
        productDimensions: productDimensions,
        productWeight: productWeight,
        productProfitMarginRate: productProfitMarginRate
      }
    });

    // if so, check if it's supplied by the specified supplier
    if (existingProduct) {
      const existingSuppliedBy = await prisma.supplied_by.findFirst({
        where: {
          productId: existingProduct.productId,
          supplierId: supplierId
        }
      });

      // if so, return an error response
      if (existingSuppliedBy) {
        return handleResponse(response, 409, "error", "Conflict", "Product already exists and is supplied by the given supplier.");
      }

      // if not, asign it to the specified supplier
      else {
        await prisma.supplied_by.create({
          data: {
            productId: existingProduct.productId,
            supplierId: supplierId
          }
        });
        // send a success response
        return handleResponse(response, 201, "success", "Created", "Product already exists, supply successfully linked with given supplier.");
      }
    }

    // if not, create it
    const product = await prisma.product.create({
      data: {
        productName,
        productBuyingPrice,
        productSellingPrice,
        productDimensions,
        productWeight,
        productProfitMarginRate
      }
    });

    // and link it to its specified supplier
    await prisma.supplied_by.create({
      data: {
        productId: product.productId,
        supplierId: supplierId
      }
    });

    // send a success response
    handleResponse(response, 201, "success", "Created", "Product created successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error creating product: ${error.message}`);
  }
}

// get product
export const getProduct = async (request, response) => {
  try {
    // destructure request parameter
    const { productId } = request.params;

    // check if the request parameter is not present
    if (!productId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "productId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(productId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "productId parameter must be a number.");
    }

    // check if the specified product does exist in the database
    const existingProduct = await prisma.product.findUnique({
      where: {
        productId: parseInt(productId)
      },
      include: {
        supplied_by: {
          select: {
            supplier: true
          }
        }
      }
    });

    // if not, return an error response
    if (!existingProduct) {
      return handleResponse(response, 404, "error", "Not found", "Product not found.");
    }

    existingProduct.supplied_by = existingProduct.supplied_by.map(supplied_by => supplied_by.supplier);

    // if so, send it as a response
    response.status(200).json({ 
      statusCode: 200,
      success: "OK",
      message: "Product fetched successfully.",
      product: existingProduct
    });
  }
  
  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error fetching product: ${error.message}`);
  }
}

export const updateProduct = async (request, response) => {
  try {
    // destructure request parameter
    const { productId } = request.params;

    // check if the request parameter is not present
    if (!productId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "productId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(productId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "productId parameter must be a number.");
    }

    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { productName, productBuyingPrice, productSellingPrice, productDimensions, productWeight, productProfitMarginRate } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "productName": "string",
      "productBuyingPrice": "number",
      "productSellingPrice": "number",
      "productDimensions": "string",
      "productWeight": "number",
      "productProfitMarginRate": "number"
    };
    const missingKeys = [];
    const emptyKeys = [];
    const wrongTypeKeys = [];

    // loop through each key inside requiredKeys object
    for (let key in requiredKeys) {
      // check if the request body is missing any keys
      if (!request.body.hasOwnProperty(key)) {
        // if so, push them into missingKeys array
        missingKeys.push(key);
      } 
      
      // check if any of the request body keys are missing values
      else if (request.body[key] === "") {
        // if so, push them into emptyKeys array
        emptyKeys.push(key);
      }
      
      // check if any of the request body keys types are not into accordance to specified keys types
      else if (typeof request.body[key] !== requiredKeys[key]) {
        // if so, push them into wrongTypeKeys array
        wrongTypeKeys.push(key);
      }
    }

    // check if the missingKeys array contains any keys
    if (missingKeys.length) {
      // if so, return an error response
      if (missingKeys.length === 1) {
        return handleResponse(response, 400, "error", "Bad request", `Request body is missing the following required key: ${missingKeys}.`);
      }

      else {
        return handleResponse(response, 400, "error", "Bad request", `Request body is missing the following required keys: ${missingKeys.join(", ")}.`);
      }
    }
    
    // check if the emptyKeys array contains any keys
    if (emptyKeys.length) {
      // if so, return an error response
      if (emptyKeys.length === 1) {
        return handleResponse(response, 400, "error", "Bad request", `Following key must have a value: ${emptyKeys}.`);
      }

      else {
        return handleResponse(response, 400, "error", "Bad request", `Following keys must have a value: ${emptyKeys.join(", ")}.`);
      }
    }
    
    // check if the wrongTypeKeys array contains any keys
    if (wrongTypeKeys.length) {
      // if so, return an error response
      if (wrongTypeKeys.length === 1) {
        return handleResponse(response, 400, "error", "Bad request", `Following key have wrong value type: ${wrongTypeKeys}.`);
      }

      else {
        return handleResponse(response, 400, "error", "Bad request", `Following keys have wrong value types: ${wrongTypeKeys.join(", ")}.`);
      }
    }

    // check if the specified product already exists in the database
    const existingProduct = await prisma.product.findFirst({
      where: {
        productId: parseInt(productId)
      }
    });

    // if not, return an error response
    if (!existingProduct) {
      return handleResponse(response, 404, "error", "Not found", "Product not found.");
    }

    // if so, update it
    await prisma.product.update({
      where: {
        productId: parseInt(productId)
      },
      data: {
        productName,
        productBuyingPrice,
        productSellingPrice,
        productDimensions,
        productWeight,
        productProfitMarginRate
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Product updated successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error updating product: ${error.message}`);
  }
}

// delete product
export const deleteProduct = async (request, response) => {
  try {
    // destructure request parameter
    const { productId } = request.params;

    // check if the request parameter is not present
    if (!productId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "productId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(productId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "productId parameter must be a number.");
    }

    // check if the specified product does exist in the database
    const existingProduct = await prisma.product.findUnique({
      where: {
        productId: parseInt(productId)
      },
    })

    // if not, return an error response
    if (!existingProduct) {
      return handleResponse(response, 404, "error", "Not found", "Product not found.");
    }

    // if so, delete it
    await prisma.product.delete({
      where: {
        productId: parseInt(productId),
      },
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Product deleted successfully.");
  }
    
  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error deleting product: ${error.message}`);
  }
}