const querystring = require('querystring');
const cookie2sns = require('./core/cookie2sns');
const MobileList = require('./core/mobile-list');
const Request = require('./core/request');
const logger = require('../../util/logger')('service/eleme');
const CookieStatus = require('../../constant/cookie-status');
const getHongbaoResponse = require('../get-hongbao-response');
const NO_MOBILE = '10000000000';

module.exports = async (req, res) => {
  let {url, mobile, cookies} = req.body;
  const response = getHongbaoResponse(req, res);
  mobile = mobile || NO_MOBILE;

  if (!url || !mobile) {
    return response(1, '请将信息填写完整');
  }

  if (!/^1\d{10}$/.test(mobile)) {
    return response(2, '请填写 11 位手机号码');
  }

  // 某些地方复制出的链接带 &amp; 而不是 &
  url = String(url).replace(/&amp;/g, '&');
  const query = querystring.parse(url);
  const request = new Request({sn: query.sn});
  let index = 0;
  let number = -1;

  try {
    query.lucky_number = (await request.lucky(query)).lucky_number;
  } catch (e) {
    return response(3, `饿了么红包链接不正确或请求饿了么超时 ${e.message}`);
  }

  if (!query.sn || !query.lucky_number || isNaN(query.lucky_number)) {
    return response(3, '饿了么红包链接不正确');
  }

  const lucky = await (async function lottery() {
    if (mobile === NO_MOBILE && number === 1) {
      return response(99, '已领取到最佳前一个红包。下一个是最大红包，请手动打开红包链接领取');
    }

    const cookie = cookies[index++];
    if (!cookie) {
      // 传过来的 cookie 不够用
      return response(4, '请求饿了么服务器失败，请重试。如果重试仍然不行，请换一个饿了么链接再来');
    }


    try {
      let phone;
      let data;
      let count = 0;

      // code 10 逻辑，由之前的递归改为循环
      while (true) {
        // 如果这个是最佳红包，换成指定的手机号领取
        phone = number === 1 ? mobile : MobileList.getOne(mobile);

        data = await request.hongbao({
          phone,
          openid: cookie.avatar,
          sign: cookie.elemeKey,
          platform: query.platform,
          sid: cookie.sid,
          sn: query.sn
        });

        // 不是 code 10 跳出
        if (!data || data.ret_code !== 10) {
          break;
        }

        // code 10 黑名单
        MobileList.addBlack(phone);

        // 是 code 10 并且是你填的那个号码
        if (phone === mobile) {
          return response(
            12,
            '你的手机号没有注册饿了么账号或者需要填写验证码，无法领最大。下一个是最大红包，别再点网站的领取按钮，请手动打开红包链接领取'
          );
        }

        // 100 次都是 code 10，防止死循环，直接报错
        if (++count >= 100) {
          return response(13, '请求饿了么服务器失败，请重试');
        }
      }

      // 失败走下一轮请求
      if (data === null) {
        return lottery();
      }

      if (data.name === 'SNS_UID_CHECK_FAILED') {
        // 库里面 cookie 无效，虽然这种可能性比较小

      } else {
        // 可用的，并且不是用户填的，存起来用于以后随机
        if (phone !== mobile && data.ret_code !== 1) {
          MobileList.addWhite(phone);
        }

        switch (data.ret_code) {
          case 1:
            // 红包被抢完了
            break;
          case 2:
            // 这个号 抢过这个红包
            // TODO: 有一定几率不对，有可能是 cookie 号领过，因为概率比较低，所以暂时先这样
            if (phone === mobile) {
              return response(
                11,
                '你的手机号之前领过小红包，无法领最大。下一个是最大红包，别再点网站的领取按钮，请手动打开红包链接领取'
              );
            }
            break;
          case 3:
          case 4:
            // 领取成功
            break;
          case 5:
            // 没次数了，有可能是手机号没次数了，也有可能是 cookie 没次了
            // 如果是自己的号领的，没次了，直接提示
            if (phone === mobile) {
              return response(
                9,
                '你的手机号（或代领最佳的小号）今日领取次数已达上限。下一个是最大红包，别再点网站的领取按钮，请手动打开红包链接领取'
              );
            }
            break;
        }

        // 计算剩余第几个为最佳红包
        number = query.lucky_number - data.promotion_records.length;

        if(number === 1) {
            return response(
                222,
                '下一个是最大红包，别再点网站的领取按钮，请手动打开红包链接领取'
            );
        }
        // 领完了可能不会返回 records，所以 === 0
        if (data.promotion_records.length === 0 || number <= 0) {
          const lucky = data.promotion_records[query.lucky_number - 1];
          logger.info('手气最佳红包已被领取 %j', lucky);

          // 还是取不到，可能是因为领完了，不会返回数组了
          if (!lucky) {
            return response(0, '手气最佳红包已被领取', {
              nickname: '未知',
              price: 0,
              date: '未知',
              id: query.sn
            });
          }
          return lucky;
        }

        logger.info(`还要领 ${number} 个红包才是手气最佳`);

      }

      return lottery();
    } catch (e) {
      logger.error(e.message);
      const is400500 = [400, 500].includes((e.response || {}).status);
      if (is400500) {
        // 还有 cookie 继续
        if (index < cookies.length - 1) {
          return lottery();
        }
        if (number === 1) {
          // 400 重试过了，仍然 400，而且马上要最大红包了
          return response(
            10,
            '饿了么返回错误或者你的手机号今日领取次数已达上限。下一个是最大红包，别再点网站的领取按钮，请手动打开红包链接领取'
          );
        }
      }

      return response(
        7,
        is400500 ? '饿了么返回 400 错误，请重试。如果重试仍然不行，请换一个饿了么链接再来。' : e.message
      );
    }
  })();

  if (!lucky) {
    return;
  }

  response(0, '手气最佳红包已被领取', {
    nickname: lucky.sns_username || '',
    price: parseFloat(lucky.amount || 0),
    date: new Date(lucky.created_at * 1000).toString(),
    id: query.sn
  });
};
