const express = require('express');
const router = express.Router();

router.use('/listings', require('./listings'));

module.exports = router;
