import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// email regular expression
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
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

// add supplier
export const addSupplier = async (request, response) => {
  try {
    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { supplierName, supplierAddress, supplierPhoneNumber, supplierEmail, supplierCreationDate, supplierIdentifierNumber } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "supplierName": "string",
      "supplierAddress": "string",
      "supplierPhoneNumber": "string",
      "supplierEmail": "string",
      "supplierCreationDate": "string",
      "supplierIdentifierNumber": "string"
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

    // check if supplierEmail email format is invalid
    if (!emailRegex.test(supplierEmail)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid supplierEmail value format.");
    }

    // check if supplierCreationDate date format is invalid
    if (!dateRegex.test(supplierCreationDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid supplierCreationDate value format.");
    }

    // check if the specified supplier already exists in the database
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        supplierEmail: supplierEmail
      }
    });

    // if so, return an error response
    if (existingSupplier) {
      return handleResponse(response, 409, "error", "Conflict", "Supplier already exists.");
    }

    // if not, create it
    await prisma.supplier.create({
      data: {
        supplierName,
        supplierAddress,
        supplierPhoneNumber,
        supplierEmail,
        supplierCreationDate,
        supplierIdentifierNumber
      }
    });

    // send a success response
    handleResponse(response, 201, "success", "Created", "Supplier created successfully.");
  }
  
  // if any unexpected error occurred, catch it
  catch (error) {
    handleResponse(response, 500, "error", "Internal Server Error", `Error creating supplier: ${error.message}`);
  }
};

export const getSupplier = async (request, response) => {
  try {
    // destructure request parameter
    const { supplierId } = request.params;

    // check if the request parameter is not present
    if (!supplierId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "supplierId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(supplierId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "supplierId parameter must be a number.");
    }

    // check if the specified supplier does exist in the database
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        supplierId: parseInt(supplierId)
      }
    })

    // if not, return an error response
    if (!existingSupplier) {
      return handleResponse(response, 404, "error", "Not found", "Supplier not found.");
    }

    // if so, send it as a response
    response.status(200).json({ 
      statusCode: 200,
      success: "OK",
      message: "Supplier fetched successfully.", 
      supplier: existingSupplier
    });
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error fetching supplier: ${error.message}`);
  }
}

// update supplier
export const updateSupplier = async (request, response) => {
  try {
    // destructure request parameter
    const { supplierId } = request.params;

    // check if the request parameter is not present
    if (!supplierId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "supplierId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(supplierId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "supplierId parameter must be a number.");
    }

    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { supplierName, supplierAddress, supplierPhoneNumber, supplierEmail, supplierCreationDate, supplierIdentifierNumber } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "supplierName": "string",
      "supplierAddress": "string",
      "supplierPhoneNumber": "string",
      "supplierEmail": "string",
      "supplierCreationDate": "string",
      "supplierIdentifierNumber": "string"
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

    // check if supplierEmail email format is invalid
    if (!emailRegex.test(supplierEmail)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid supplierEmail value format.");
    }

    // check if supplierCreationDate date format is invalid
    if (!dateRegex.test(supplierCreationDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid supplierCreationDate value format.");
    }


    // check if the specified supplier does exist in the database
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        supplierId: parseInt(supplierId)
      }
    })

    // if not, return an error response
    if (!existingSupplier) {
      return handleResponse(response, 404, "error", "Not found", "Supplier not found.");
    }

    // if so, update it
    await prisma.supplier.update({
      where: {
        supplierId: parseInt(supplierId),
      },
      data: {
        supplierName,
        supplierAddress,
        supplierPhoneNumber,
        supplierEmail,
        supplierCreationDate,
        supplierIdentifierNumber
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Supplier updated successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error updating supplier: ${error.message}`);
  }
}

// delete supplier
export const deleteSupplier = async (request, response) => {
  try {
    // destructure request parameter
    const { supplierId } = request.params;

    // check if the request parameter is not present
    if (!supplierId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "supplierId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(supplierId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "supplierId parameter must be a number.");
    }

    // check if the specified supplier does exist in the database
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        supplierId: parseInt(supplierId)
      }
    })

    // if not, return an error response
    if (!existingSupplier) {
      return handleResponse(response, 404, "error", "Not found", "Supplier not found.");
    }

    // if so, delete it
    await prisma.supplier.delete({
      where: {
        supplierId: parseInt(supplierId),
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Supplier deleted successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 500, "error", "Internal Server Error", `Error deleting supplier: ${error.message}`);
  }
}