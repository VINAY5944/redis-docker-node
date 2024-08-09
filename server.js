const express = require('express');
const cors = require('cors');
const userRoutes=require('./route/userRoute')
const app = express();

// Use CORS middleware
app.use(cors());

// Use JSON middleware to parse JSON bodies
app.use(express.json());

app.use('/users', userRoutes);

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
