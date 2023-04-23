const httpRequest = require('request');
const async = require("async");

exports.getWeatherData = async (request, response, next) =>
{
    const latitude = request.params.latitude;
    const longitude = request.params.longitude;
    const units = "metric";

    const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=${units}`;

    httpRequest
    (
        {
            url : weatherURL,
            json : true
        },

        (error, data)=>
        {
            if (error)
            {
                console.log(error);

                return response.status(503).send
                (
                    {
                        message: 'Unable to connect to weather service'
                    }
                )
            }
            else if (data.body.message)
            {
                console.log(data.body);

                return response.status(500).send
                (
                    {
                        message: data.body.message
                    }
                )
            }
            else
            {
               return response.status(200).send
               (
                   {
                       weatherData: data.body,
                       locationData: request.body.locationData
                   }
               )
            }
        }
    );
}

exports.getLocationData = async (request, response, next) =>
{
    let mapbox_URL;

    if (request.params.location)
    {
        const location = request.params.location;

        mapbox_URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.MAPBOX_API_KEY}`;
    }
    else
    {
        const latitude = request.params.latitude;
        const longitude = request.params.longitude;

        mapbox_URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.MAPBOX_API_KEY}`;
    }

    httpRequest
    (
        {
            url: encodeURI(mapbox_URL),
            json: true
        },
        (error, data)=>
        {
            if (error)
            {
                console.log(error);

                return response.status(503).send
                (
                    {
                        message: 'Unable to connect to location service'
                    }
                )
            }
            else if (data.body.message)
            {
                console.log(data.body);

                return response.status(500).send
                (
                    {
                        message: data.body.message
                    }
                )
            }
            else if (data.body.features.length===0)
            {
                console.log(data.body);

                return response.status(400).send
                (
                    {
                        message: 'Invalid location'
                    }
                )
            }
            else
            {
                request.body.locationData = data.body;

                request.params.longitude = data.body.features[0].center[0];
                request.params.latitude = data.body.features[0].center[1];

                this.getWeatherData(request, response, next);
            }
        }
    );
}

exports.getLocations = async (request, response, next) =>
{
    const mapbox_URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${request.params.location}.json?access_token=${process.env.MAPBOX_API_KEY}`;;

    httpRequest
    (
        {
            url: encodeURI(mapbox_URL),
            json: true
        },
        (error, locationData)=>
        {
            if (error)
            {
                console.log(error);

                return response.status(503).send
                (
                    {
                        message: 'Unable to connect to location service'
                    }
                )
            }
            else if (locationData.body.message)
            {
                console.log(locationData.body);

                return response.status(500).send
                (
                    {
                        message: locationData.body.message
                    }
                )
            }
            else if (locationData.body.features.length===0)
            {
                console.log(locationData.body);

                return response.status(400).send
                (
                    {
                        message: 'Invalid location'
                    }
                )
            }
            else
            {
                let data = [];

                async.each(locationData.body.features,
                    function(location, callback)
                    {
                        const latitude = location.center[1];
                        const longitude = location.center[0]
                        const units = "metric";

                        const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,alerts&appid=${process.env.OPEN_WEATHER_API_KEY}&units=${units}`;

                        httpRequest
                        (
                            {
                                url : weatherURL,
                                json : true
                            },

                            (error, weatherBody)=>
                            {
                                if (error)
                                {
                                    console.log(error);

                                    return response.status(503).send
                                    (
                                        {
                                            message: 'Unable to connect to weather service'
                                        }
                                    )
                                }
                                else if (weatherBody.body.message)
                                {
                                    console.log(weatherBody.body);

                                    return response.status(400).send
                                    (
                                        {
                                            message: weatherBody.body.message
                                        }
                                    )
                                }
                                else
                                {
                                    data.push({locationName : location.place_name, weatherData: weatherBody.body});

                                    callback();
                                }
                            }
                        );
                    },
                    function(err)
                    {
                        if (err)
                        {
                            console.log(err);

                            return response.status(400).send
                            (
                                {
                                    message: err.message
                                }
                            )
                        }
                        else
                        {
                            return response.status(200).send
                            (
                                {
                                    locationWeatherData: data
                                }
                            )
                        }
                    }
                    );
            }
        }
    );
}

exports.getHistoricalData = async(request, response, next) =>
{
    const latitude = request.params.latitude;
    const longitude = request.params.longitude;
    const timestamp = request.params.timestamp;
    const units = "metric";

    const weatherURL = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${timestamp}&units=${units}&appid=${process.env.OPEN_WEATHER_API_KEY}`;

    httpRequest
    (
        {
            url : weatherURL,
            json : true
        },

        (error, data)=>
        {
            if (error)
            {
                console.log(error);

                return response.status(503).send
                (
                    {
                        message: 'Unable to connect to weather service'
                    }
                )
            }
            else if (data.body.message)
            {
                console.log(data.body);

                return response.status(500).send
                (
                    {
                        message: data.body.message
                    }
                )
            }
            else
            {
                return response.status(200).send
                (
                    {
                        weatherData: data.body,
                    }
                )
            }
        }
    );
}
