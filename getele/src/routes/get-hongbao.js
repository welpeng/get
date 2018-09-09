const express = require('express');
const _ = require('lodash');
const router = express.Router();
const logger = require('../util/logger')('request/get-hongbao');
const eleme = require('../service/eleme/get-hongbao');

router.post('/', async (req, res, next) => {
  const startTime = Date.now();
  try {
    let {url, mobile, cookies} = req.body;
    if (typeof cookies === 'string') {
      req.body.cookies = JSON.parse(cookies);
    }
    // cookies 太多了，日志只打 length
    logger.info('%j', {
      url,
      mobile,
      cookies: req.body.cookies.length
    });
    const action = [eleme][0];
    await action(req,res);
  } catch (e) {
    logger.error(e);
    res.json({code: -2, message: _.get(e, 'response.data.message', '网络繁忙，请稍后重试')});
  }
  logger.info(`耗时 ${(Date.now() - startTime) / 1000}s`);
});

module.exports = router;
