const jwt = require('jsonwebtoken');

/*
This middleware is used to check incoming token with request is valid or not.
*/

module.exports =
    (request,response,next)=>
    {
        try
        {
            const token = request.headers.authorization.split(" ")[1]; //Remove "Bearer "

            jwt.verify
            (
                token,
                process.env.JWT_KEY
            );

            request.token = token;
            next(); // Authentication passed, Continue next process.
        }
        catch (error)
        {
            console.log(error);

            response.status(401).send
            (
                {
                    message : 'Authentication failed : ' + 'Invalid token'
                }
            )
        }
    }
