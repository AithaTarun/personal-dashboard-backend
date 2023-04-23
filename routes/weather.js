const express = require('express');

const checkAuthentication = require('../middlewares/check-authentication');

const router = express.Router();

const weatherController = require('../controllers/weather');

router.get
(
    '/getLocations/:location',
    checkAuthentication,
    weatherController.getLocations
)

router.get
(
    '/getWeatherData/:location',
    checkAuthentication,
    weatherController.getLocationData
)

router.get
(
    '/getWeatherData/:latitude/:longitude',
    checkAuthentication,
    weatherController.getLocationData
)

router.get
(
    '/getHistoricalData/:latitude/:longitude/:timestamp',
    checkAuthentication,
    weatherController.getHistoricalData
)

module.exports = router;

