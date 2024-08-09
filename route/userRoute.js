const express = require('express');
const userController = require('../controllers/userController'); // Adjust the path based on your directory structure

const Router = express.Router();

// Use Router.post() to handle POST requests to /create
Router.post('/', userController.create);
Router.get('/:id',userController.read);
Router.delete("/:id",userController.delete);
Router.put('/:id',userController.update);

module.exports = Router;
