import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// email regular expression
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// response handling function
const handleResponse = (response, statusCode, responseType, responseBody, messageBody) => {
  response.status(statusCode).json({
    statusCode: statusCode,
    [responseType]: responseBody,
    message: messageBody
  });
}

// add client
export const addClient = async (request, response) => {
  try {
    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { clientFirstName, clientLastName, clientAddress, clientPhoneNumber, clientEmail } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "clientFirstName": "string",
      "clientLastName": "string",
      "clientAddress": "string",
      "clientPhoneNumber": "string",
      "clientEmail": "string"
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

    // check if clientEmail email format is invalid
    if (!emailRegex.test(clientEmail)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid clientEmail value format.");
    }

    // check if the specified client already exists in the database
    const existingClient = await prisma.client.findUnique({
      where: {
        clientEmail: clientEmail
      }
    });

    // if so, return an error response
    if (existingClient) {
      return handleResponse(response, 409, "error", "Conflict", "Client already exists.");
    }

    // if not, create it
    await prisma.client.create({
      data: {
        clientFirstName,
        clientLastName,
        clientAddress,
        clientPhoneNumber,
        clientEmail
      }
    });

    // send a success response
    handleResponse(response, 201, "success", "Created", "Client created successfully.");
  } 
  
  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error creating client: ${error.message}`);
  }
};

// get client
export const getClient = async (request, response) => {
  try {
    // destructure request parameter
    const { clientId } = request.params;

    // check if the request parameter is not present
    if (!clientId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "clientId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(clientId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "clientId parameter must be a number.");
    }

    // check if the specified client does exist in the database
    const existingClient = await prisma.client.findUnique({
      where: {
        clientId: parseInt(clientId)
      }
    });

    // if not, return an error response
    if (!existingClient) {
      return handleResponse(response, 404, "error", "Not found", "Client not found.");
    }

    // if so, send it as a response
    response.status(200).json({ 
      statusCode: 200,
      success: "OK",
      message: "Client fetched successfully.", 
      client: existingClient
    });
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error fetching client: ${error.message}`);
  }
}

// update client
export const updateClient = async (request, response) => {
  try {
    // destructure request parameter
    const { clientId } = request.params;

    // check if the request parameter is not present
    if (!clientId) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "clientId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(clientId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "clientId parameter must be a number.");
    }

    // check if request object is empty
    if (Object.keys(request.body).length === 0) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "Request body is empty.");
    }

    // if not, destructure request body
    const { clientFirstName, clientLastName, clientAddress, clientPhoneNumber, clientEmail } = request.body;

    // specification of required body keys and their types
    const requiredKeys = {
      "clientFirstName": "string",
      "clientLastName": "string",
      "clientAddress": "string",
      "clientPhoneNumber": "string",
      "clientEmail": "string"
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

    // check if clientEmail email format is invalid
    if (!emailRegex.test(clientEmail)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad request", "Invalid clientEmail value format.");
    }

    // check if the specified client already exists in the database
    const existingClient = await prisma.client.findUnique({
      where: {
        clientId: parseInt(clientId)
      },
    });

    // if not, return an error response
    if (!existingClient) {
      return handleResponse(response, 404, "error", "Not found", "Client not found.");
    }

    // if no, update it
    await prisma.client.update({
      where: {
        clientId: parseInt(clientId)
      },
      data: {
        clientFirstName,
        clientLastName,
        clientAddress,
        clientPhoneNumber,
        clientEmail
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Client updated successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error updating client: ${error.message}`);
  }
}

// delete client
export const deleteClient = async (request, response) => {
  try {
    // destructure request parameter
    const { clientId } = request.params;

    // check if the request parameter is not present
    if (!clientId) {
      return handleResponse(response, 400, "error", "Bad Request", "clientId parameter is required.");
    }

    // check if the request parameter is not a number
    if (isNaN(clientId)) {
      // if so, return an error response
      return handleResponse(response, 400, "error", "Bad Request", "clientId parameter must be a number.");
    }

    // check if the specified client already exists in the database
    const existingClient = await prisma.client.findUnique({
      where: {
        clientId: parseInt(clientId)
      },
    });

    // if not, return an error response
    if (!existingClient) {
      return handleResponse(response, 404, "error", "Not found", "Client not found.");
    }

    // if so, delete it
    await prisma.client.delete({
      where: {
        clientId: parseInt(clientId)
      }
    });

    // send a success response
    handleResponse(response, 200, "success", "OK", "Client deleted successfully.");
  }

  // if any unexpected error occurred, catch it
  catch (error) {
    // and send it as a response
    handleResponse(response, 400, "error", "Bad request", `Error deleting client: ${error.message}`);
  }
}