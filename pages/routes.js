const express = require('express');

const router = express.Router();
const { index } = require('./controllers');
const { create } = require('./create');
const { edit } = require('./edit');
const { getRecommendation } = require('./getRecommendation');

router.get('/', index);
router.post('/', index);
router.get('/create', create);
router.get('/edit', edit);
router.post('/getRecommendation', getRecommendation);

module.exports = router;
