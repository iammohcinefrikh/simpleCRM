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

// add enterprise
export const addEnterprise = async (request, response) => {
  try {
    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { enterpriseCapital, enterpriseWorkforceCount, enterpriseAddress, enterprisePhoneNumber, enterpriseEmail, enterpriseName, enterpriseHeadquartersLocation, enterpriseCreationDate, enterpriseIdentifierNumber } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "enterpriseCapital": "number",
      "enterpriseWorkforceCount": "number",
      "enterpriseAddress": "string",
      "enterprisePhoneNumber": "string",
      "enterpriseEmail": "string",
      "enterpriseName": "string",
      "enterpriseHeadquartersLocation": "string",
      "enterpriseCreationDate": "string", 
      "enterpriseIdentifierNumber": "string"
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

    // check if enterpriseEmail email format is invalid
    if (!emailRegex.test(enterpriseEmail)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid enterpriseEmail value format.");
    }

    // check if enterpriseCreationDate date format is invalid
    if (!dateRegex.test(enterpriseCreationDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid enterpriseCreationDate value format.");
    }

    // check if the specified enterprise already exists in the database
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: {
        enterpriseEmail: enterpriseEmail
      },
    })

    // if so, return an error response
    if (existingEnterprise) {
      return handleResponse(response, 409, "error", "Conflict", "Enterprise already exists.");
    }

    // if not, create it
    await prisma.enterprise.create({
      data: {
        enterpriseCapital,
        enterpriseWorkforceCount,
        enterpriseAddress,
        enterprisePhoneNumber,
        enterpriseEmail,
        enterpriseName,
        enterpriseHeadquartersLocation,
        enterpriseCreationDate,
        enterpriseIdentifierNumber
      }
    });

    // send a success response
    handleResponse(response, 201, "success", "Created", "Enterprise created successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error creating enterprise: ${error.message}`);
  }
}

// get enterprise
export const getEnterprise = async (request, response) => {
  try {
    // destructure request parameter
    const { enterpriseId } = request.params;

    // check if the request parameter is not present
    if (!enterpriseId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "enterpriseId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(enterpriseId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "enterpriseId parameter must be a number.");
    }

    // check if the specified enterprise does exist in the database
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: {
        enterpriseId: parseInt(enterpriseId)
      },
    });

    // if not, return an error response
    if (!existingEnterprise) {
      return handleResponse(response, 404, "error", "Not found", "Enterprise not found.");
    }

    // if so, send it as a response
    response.status(200).json({ 
      statusCode: 200,
      success: "OK",
      message: "Enterprise fetched successfully.", 
      enterprise: existingEnterprise
    });
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error fetching enterprise: ${error.message}`);
  }
}

// update enterprise
export const updateEnterprise = async (request, response) => {
  try {
    // destructure request parameter
    const { enterpriseId } = request.params;

    // check if the request parameter is not present
    if (!enterpriseId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "enterpriseId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(enterpriseId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "enterpriseId parameter must be a number.");
    }

    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { enterpriseCapital, enterpriseWorkforceCount, enterpriseAddress, enterprisePhoneNumber, enterpriseEmail, enterpriseName, enterpriseHeadquartersLocation, enterpriseCreationDate, enterpriseIdentifierNumber } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "enterpriseCapital": "number",
      "enterpriseWorkforceCount": "number",
      "enterpriseAddress": "string",
      "enterprisePhoneNumber": "string",
      "enterpriseEmail": "string",
      "enterpriseName": "string",
      "enterpriseHeadquartersLocation": "string",
      "enterpriseCreationDate": "string", 
      "enterpriseIdentifierNumber": "string"
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

    // check if enterpriseEmail email format is invalid
    if (!emailRegex.test(enterpriseEmail)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid enterpriseEmail value format.");
    }

    // check if enterpriseCreationDate date format is invalid
    if (!dateRegex.test(enterpriseCreationDate)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid enterpriseCreationDate value format.");
    }

    // check if the specified enterprise does exist in the database
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: {
        enterpriseId: parseInt(enterpriseId)
      },
    });

    // if not, return an error response
    if (!existingEnterprise) {
      return handleResponse(response, 404, "error", "Not found", "Enterprise not found.");
    }

    // if so, update it
    await prisma.enterprise.update({
      where: {
        enterpriseId: parseInt(enterpriseId),
      },
      data: {
        enterpriseCapital,
        enterpriseWorkforceCount,
        enterpriseAddress,
        enterprisePhoneNumber,
        enterpriseEmail,
        enterpriseName,
        enterpriseHeadquartersLocation,
        enterpriseCreationDate,
        enterpriseIdentifierNumber
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Enterprise updated successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error updating enterprise: ${error.message}`);
  }
}

// delete enterprise
export const deleteEnterprise = async (request, response) => {
  try {
    // destructure request parameter
    const { enterpriseId } = request.params;

    // check if the request parameter is not present
    if (!enterpriseId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "enterpriseId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(enterpriseId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "enterpriseId parameter must be a number.");
    }

    // check if the specified enterprise does exist in the database
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: {
        enterpriseId: parseInt(enterpriseId)
      },
    });

    // if not, return an error response
    if (!existingEnterprise) {
      return handleResponse(response, 404, "error", "Not found", "Enterprise not found.");
    }

    // if so, delete it
    await prisma.enterprise.delete({
      where: {
        enterpriseId: parseInt(enterpriseId)
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Enterprise deleted successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error deleting enterprise: ${error.message}`);
  }
}