const express = require('express');

const app = express();

const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

const connectionURL = process.env.MONGO_DB_URL

//const databaseName = 'personal-dashboard-database';

mongoose.connect
(
    connectionURL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
	  readPreference: 'secondary'
    }
).then
(
    ()=>
    {
        console.log("Connected to database")
    }
).catch
(
    (e)=>
    {
        console.log("Connection to database failed", e);
    }
);

app.use
(
    express.json()
);

try
{
    app.use //To handle CORS error.
        (
            (request,response,next)=>
            {
                response.setHeader
                (
                    'Access-Control-Allow-Origin',
                    '*'
                );

                response.setHeader
                    (
                        'Access-Control-Allow-Origin', process.env.FRONT_END_URL
                    );

                response.setHeader
                (
                    'Access-Control-Allow-Headers',
                    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
                );

                response.setHeader
                (
                    'Access-Control-Allow-Methods',
                    'GET, POST, PATCH, DELETE, OPTIONS, PUT'
                );

                response.setHeader
                (
                    'Access-Control-Allow-Credentials',
                    'true'
                )

                next();
            }
        );
}
catch (e)
{
    console.log("Error occurred :", e)
}

const userRoutes = require('./routes/user');
app.use("/api/user", userRoutes);

const fileUploadRoutes = require('./routes/filesUpload');
app.use("/api/files", fileUploadRoutes);

const weatherRoutes = require('./routes/weather');
app.use("/api/weather", weatherRoutes);

app.listen
(
  port,
  ()=>
  {
    console.log("Server is running on port",port);
  }
);

module.exports = app;

