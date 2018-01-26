const express = require('express');

const router = express.Router();
const { index } = require('./controllers');
const { create } = require('./create');
const { edit } = require('./edit');

router.get('/', index);
router.post('/', index);
router.get('/create', create);
router.get('/edit', edit);

module.exports = router;
