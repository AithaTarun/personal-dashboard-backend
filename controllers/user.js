const bcrypt = require("bcryptjs");
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const request = require('request');

exports.createUser = async (request,response,next)=>
exports.createUser = async (request,response,next)=>
{
    try
    {
        const hash = await bcrypt.hash(request.body.password,10);

        const user = new User
        (
            {
                username : request.body.username,
                password : hash,
                email : request.body.email,
                dob : request.body.dob
            }
        );

        const result = await user.save();

        await sendAccountActivationMail(request.body.email,request.body.username,result._id);

        return response.status(201).send
        (
            {
                message : 'User created',
                result :
                    {
                        id : result._id,
                        username : result.username,
                    }
            }
        );

    }
    catch (error)
    {
        console.log(error);

        let errorMessages = [];

        Object.entries(error.errors)
            .map(
                err =>
                {
                    console.log(err[0]);
                    errorMessages.push(err[0])
                }
        );

       return response.status(500).send
        (
            {
                message : errorMessages
            }
        );
    }
};

exports.userAccountActivation = async (request,response,next)=>
{
    try
    {
        await User.updateOne
        (
            {
                _id : request.body.id
            },
            {
                isActivated : true
            }
        );
    }
    catch (error)
    {
        console.log(error);

        return response.status(403).send
        (
            {
                message : ["Invalid activation ID"]
            }
        )
    }

    return response.status(200).send
    (
        {
            message:"Account activated successfully"
        }
    );
};

exports.loginUser = async (request,response,next)=>
{
    try
    {
        const user = await User.findOne
        (
            {
                username: request.body.username
            }
        );

        // Username not found
        if (user === null)
        {
            throw new Error("Username doesn't exits");
        }

        // Found user but account not activated
        if (user.isActivated === false)
        {
            throw new Error("User not yet verified");
        }

        // Found user but wrong password
        const result = await bcrypt.compare(request.body.password, user.password);
        if (!result)
        {
            throw new Error("Wrong username and password combination");
        }

        // Found user with correct password
        const token = jwt.sign
        (
            {
                userId: user._id,
                username : user.username,
                email: user.email,
                dob: user.dob
            },
            'secretKey',
            {
                //To configure token.
                expiresIn: request.body.remember ? '24h' : '1h'
            }
        );

        return response.status(200).send
        (
            {
                token: token,
                expiresIn: request.body.remember ? 86400 : 3600 //This token expires in 3600 seconds = 1 hour
            }
        );
    }
    catch(error)
    {
        console.log(error);

        return response.status(401).send
        (
            {
                message : error.message
            }
        );
    }
};

const sendAccountActivationMail = (toMail,username,activationId)=>
{
    let options =
        {
            method: 'POST',
            url: 'https://api.sendgrid.com/v3/mail/send',
            headers:
                {
                    'content-type': 'application/json',
                    authorization: 'Bearer '+ process.env.SENDGRID_API_KEY
                },
            body:
                {
                    personalizations :
                        [
                            {
                                to :
                                    [
                                        {
                                            email: toMail,
                                            name : username
                                        }
                                    ],
                                dynamic_template_data:
                                    {
                                        activationLink : `${process.env.FRONT_END_URL}/auth/activateAccount/${activationId}`
                                    },

                                subject: 'Welcome to personal dashboard'
                            }
                        ],
                    from :
                        {
                            email: 'webrecipebook@gmail.com', name: 'Personal dashboard'
                        },
                    reply_to:
                        {
                            email: 'webrecipebook@gmail.com', name: 'Personal dashboard'
                        },
                    template_id: 'd-fbc6a1e919f04616a029eda9c2076aeb'
                },
            json: true
        };

    request(options, function (error, response, body)
        {
            if (error) throw new Error(error);
        }
    );
}
