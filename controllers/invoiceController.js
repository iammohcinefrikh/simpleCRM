import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// date regular expression
const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// response handling function
const handleResponse = (response, statusCode, responseType, responseBody, messageBody) => {
  response.status(statusCode).json({
    statusCode: statusCode,
    [responseType]: responseBody,
    message: messageBody
  });
}

// add invoice
export const addInvoice = async (request, response) => {
  try {
    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { invoiceDate, invoiceDueDate, invoiceAmount, clientId, enterpriseId, products } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "invoiceDate": "string",
      "invoiceDueDate": "string",
      "invoiceAmount": "number",
      "clientId": "number",
      "enterpriseId": "number",
      "products": "object"
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
        // if the current key is products, skip it
        if (key === "products") {
          continue;
        }

        // if so, push them into emptyKeys array
        else {
          emptyKeys.push(key);
        }
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

    // check if the wrongTypeKeys array contains any keys
    if (!Array.isArray(products) || products.length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Products array must have at least one product.");
    }

    // loop through each product object inside products array
    for (const product of products) {
      // check if the current product doesn't have productId key
      if (!product.hasOwnProperty("productId")) {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product at index ${products.indexOf(product)} in products array must have a productId key.`);
      }

      // check if the current product doesn't have productQuantity key
      if (!product.hasOwnProperty("productQuantity")) {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product at index ${products.indexOf(product)} in products array must have a productQuantity key.`);
      }

      // check if the current product productId key value type is not a number
      if (typeof product.productId !== "number") {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product productId key at index ${products.indexOf(product)} in products array have wrong value type.`);
      }

      // check if the current product productQuantity key value type is not a number
      if (typeof product.productQuantity !== "number") {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product productQuantity key at index ${products.indexOf(product)} in products array have wrong value type.`);
      }
    }

    // check if both invoiceDate and invoiceDueDate date format is invalid
    if (!dateRegex.test(invoiceDate) && !dateRegex.test(invoiceDueDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid invoiceDate and invoiceDueDate value format.");
    }

    // check only if invoiceDate date format is invalid
    else if (!dateRegex.test(invoiceDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid invoiceDate value format.");
    }

    // check only if invoiceDueDate date format is invalid
    else if (!dateRegex.test(invoiceDueDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid invoiceDueDate value format.");
    }

    // check if the specified client already exists in the database
    const existingClient = await prisma.client.findUnique({
      where: {
        clientId: clientId,
      }
    });

    // if not, return an error response
    if (!existingClient) {
      return handleResponse(response, 404, "error", "Not found", "Specified client does not exist.");
    }

    // check if the specified enterprise already exists in the database
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: {
        enterpriseId: enterpriseId,
      }
    });

    // if not, return an error response
    if (!existingEnterprise) {
      return handleResponse(response, 404, "error", "Not found", "Specified enterprise does not exist.");
    }

    // get the productIds from the products array
    const productIds = products.map(product => product.productId);
    // add them into a new set to prevent duplicates
    const uniqueProductIds = new Set(productIds);

    // check if the productIds array length is not equal to productId set size
    if (productIds.length !== uniqueProductIds.size) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Products array should not contain duplicated products, each product in the products array should have a unique productId.");
    }

    // loop through each product object inside uniqueProductIds array
    for (const product of uniqueProductIds) {
      // check if the current productId exists inside the database
      const existingProduct = await prisma.product.findUnique({
        where: {
          productId: product
        }
      });

      // if so, return an error response
      if (!existingProduct) {
        return handleResponse(response, 404, "error", "Not found", "A specified product in products array does not exist.");
      }
    }

    // push the invoice and invoiceDetails data into the database
    await prisma.invoice.create({
      data: {
        invoiceDate,
        invoiceDueDate,
        invoiceAmount,
        clientId,
        enterpriseId,
        invoicedetails: {
          create: products.map(product => ({
            productId: product.productId,
            productQuantity: product.productQuantity
          }))
        }
      }
    });

    // send a success response
    handleResponse(response, 201, "success", "Created", "Invoice created successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error creating invoice: ${error.message}`);
  }
}

// get invoice
export const getInvoice = async (request, response) => {
  try {
    // destructure request parameter
    const { invoiceId } = request.params;

    // check if the request parameter is not present
    if (!invoiceId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "invoiceId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(invoiceId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "invoiceId parameter must be a number.");
    }

    // check if the specified invoice already exists in the database
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        invoiceId: parseInt(invoiceId),
      },
      include: {
        invoicedetails: {
          select: {
            productId: true,
            productQuantity: true,
            product: true
          }
        }
      }
    });

    // if not, return an error response
    if (!existingInvoice) {
      return handleResponse(response, 404, "error", "Not found", "Invoice not found.");
    }

    // if so, send it as a response
    response.status(200).json({
      statusCode: 200,
      success: "OK",
      message: "Invoice fetched successfully.",
      invoice: existingInvoice
    });
  } 
  
  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error fetching invoice: ${error.message}`);
  }
}

// update invoice
export const updateInvoice = async (request, response) => {
  try {
    // destructure request parameter
    const { invoiceId } = request.params;

    // check if the request parameter is not present
    if (!invoiceId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "invoiceId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(invoiceId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "invoiceId parameter must be a number.");
    }

    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { invoiceDate, invoiceDueDate, invoiceAmount, clientId, enterpriseId, products } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "invoiceDate": "string",
      "invoiceDueDate": "string",
      "invoiceAmount": "number",
      "clientId": "number",
      "enterpriseId": "number",
      "products": "object"
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
        // if the current key is products, skip it
        if (key === "products") {
          continue;
        }

        // if so, push them into emptyKeys array
        else {
          emptyKeys.push(key);
        }
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

    // check if the wrongTypeKeys array contains any keys
    if (!Array.isArray(products) || products.length === 0) {
      return handleResponse(response, 400, "error", "Bad request", "Products array must have at least one product.");
    }

    // loop through each product object inside products array
    for (const product of products) {
      // check if the current product doesn't have productId key
      if (!product.hasOwnProperty("productId")) {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product at index ${products.indexOf(product)} in products array must have a productId key.`);
      }

      // check if the current product doesn't have productQuantity key
      if (!product.hasOwnProperty("productQuantity")) {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product at index ${products.indexOf(product)} in products array must have a productQuantity key.`);
      }

      // check if the current product productId key value type is not a number
      if (typeof product.productId !== "number") {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product productId key at index ${products.indexOf(product)} in products array have wrong value type.`);
      }

      // check if the current product productQuantity key value type is not a number
      if (typeof product.productQuantity !== "number") {
        // if so, return an error response
        return handleResponse(response, 400, "error", "Bad request", `Product productQuantity key at index ${products.indexOf(product)} in products array have wrong value type.`);
      }
    }

    // check if both invoiceDate and invoiceDueDate date format is invalid
    if (!dateRegex.test(invoiceDate) && !dateRegex.test(invoiceDueDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid invoiceDate and invoiceDueDate value format.");
    }

    // check only if invoiceDate date format is invalid
    else if (!dateRegex.test(invoiceDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid invoiceDate value format.");
    }

    // check only if invoiceDueDate date format is invalid
    else if (!dateRegex.test(invoiceDueDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid invoiceDueDate value format.");
    }

    // check if the specified client already exists in the database
    const existingClient = await prisma.client.findUnique({
      where: {
        clientId: clientId,
      }
    });

    // if not, return an error response
    if (!existingClient) {
      return handleResponse(response, 404, "error", "Not found", "Specified client does not exist.");
    }

    // check if the specified enterprise already exists in the database
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: {
        enterpriseId: enterpriseId,
      }
    });

    // if not, return an error response
    if (!existingEnterprise) {
      return handleResponse(response, 404, "error", "Not found", "Specified enterprise does not exist.");
    }

    // get the productIds from the products array
    let productIds = products.map(product => product.productId);
    // add them into a new set to prevent duplicates
    const uniqueProductIds = new Set(productIds);

    // check if the productIds array length is not equal to productId set size
    if (productIds.length !== uniqueProductIds.size) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Products array should not contain duplicated products, each product in the products array should have a unique productId.");
    }

    // loop through each product object inside uniqueProductIds array
    for (const product of uniqueProductIds) {
      // check if the current productId exists inside the database
      const existingProduct = await prisma.product.findUnique({
        where: {
          productId: product
        }
      });

      // if so, return an error response
      if (!existingProduct) {
        return handleResponse(response, 404, "error", "Not found", "A specified product in products array does not exist.");
      }
    }
     
    // check if the specified invoice already exists in the database
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        invoiceId: parseInt(invoiceId)
      },
    });

    // if not, return an error response
    if (!existingInvoice) {
      return handleResponse(response, 404, "error", "Not found", "Invoice not found.");
    }


    // push the invoice data into the database in the specified invoiceId row
    await prisma.invoice.update({
      where: {
        invoiceId: parseInt(invoiceId)
      },
      data: {
        invoiceDate,
        invoiceDueDate,
        invoiceAmount,
        clientId,
        enterpriseId
      }
    });

    productIds = [];
    // store the productIds inside the products array into productIds array
    productIds = products.map(product => product.productId);
    // delete any product that isn't present inside productIds array from the invoicedetails table
    await prisma.invoicedetails.deleteMany({
      where: {
        invoiceId: parseInt(invoiceId),
        productId: {
          notIn: productIds,
        }
      }
    });

    // loop throught the products objects inside the products array
    for (const product of products) {
      // look for any row that has same productId as the current product and same invoiceId as the specified one
      const existingDetail = await prisma.invoicedetails.findUnique({
        where: {
          productId_invoiceId: {
            productId: product.productId,
            invoiceId: parseInt(invoiceId),
          }
        }
      });

      // if found, update its quantity
      if (existingDetail) {
        await prisma.invoicedetails.update({
          where: {
            productId_invoiceId: {
              productId: product.productId,
              invoiceId: parseInt(invoiceId),
            }
          },
          data: {
            productQuantity: product.quantity,
          }
        });
      } 
      
      // if not, create it
      else {
        await prisma.invoicedetails.create({
          data: {
            productId: product.productId,
            invoiceId: parseInt(invoiceId),
            productQuantity: product.quantity,
          }
        });
      }
    }

    // send a success response
    handleResponse(response, 200, "success", "OK", "Invoice updated successfully.");
  } 

  // if any unexpected error occurred, catch it
  catch (error) {
    console.error(error);
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error updating invoice: ${error.message}`);
  }
}

// delete invoice
export const deleteInvoice = async (request, response) => {
  try {
    // destructure request parameter
    const { invoiceId } = request.params;

    // check if the request parameter is not present
    if (!invoiceId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "invoiceId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(invoiceId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "invoiceId parameter must be a number.");
    }

    // check if the specified invoice already exists in the database
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        invoiceId: parseInt(invoiceId)
      },
    })

    // if not, return an error response
    if (!existingInvoice) {
      return handleResponse(response, 404, "error", "Not found", "Invoice not found.");
    }

    // if so, delete it
    await prisma.invoice.delete({
      where: {
        invoiceId: parseInt(invoiceId),
      },
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Invoice deleted successfully.");
  }
    
  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error deleting invoice: ${error.message}`);
  }
}