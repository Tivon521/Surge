/*
小米双十二瓜分百万京豆
需加入店铺会员才能参加活动
会加购物车
活动地址：
https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/sign/activity/5362652?activityId=dz2111100000412301&shareUuid=&adsource=null&shareuserid4minipg=tAKO3dzQ70qygS64JzCCaauhWjX4no4HCmbJz2FBEt+c5yVo3wKCr/48TYT+0/J8&shopid=1000004123&sid=&un_area=
1 1,19,21 * * * jd_xiaomi2.js
*/
const $ = new Env('小米双十二瓜分百万京豆');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', message = '';
let lz_cookie = {}, originCookie = '', activityCookie = '';
let activityUrl = 'https://lzdz1-isv.isvjcloud.com';
let activityId = 'dz2111100000412301'
let firstActorUuid = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('小米双十二瓜分百万京豆\n' +
      '需加入店铺会员才能参加活动\n' +
      '会加购物车\n' +
      '活动地址：\n' +
      'https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/sign/activity/5362652?activityId=dz2111100000412301&shareUuid=&adsource=null&shareuserid4minipg=tAKO3dzQ70qygS64JzCCaauhWjX4no4HCmbJz2FBEt+c5yVo3wKCr/48TYT+0/J8&shopid=1000004123&sid=&un_area=')
  $.shopUrl = `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/sign/activity/5362652?activityId=dz2111100000412301&shareUuid=7c1c6c2e11804d38aa225cf7a524ccdb&adsource=null&shareuserid4minipg=tAKO3dzQ70qygS64JzCCaauhWjX4no4HCmbJz2FBEt+c5yVo3wKCr/48TYT+0/J8&shopid=1000004123&sid=&un_area=`
  console.log(`\nactivityUrl：${activityUrl}`)
  console.log(`activityId：${activityId}\n`)
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i]
      originCookie = cookiesArr[i]
      newCookie = ''
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      console.log(`\n********开始【京东账号${$.index}】${$.nickName || $.UserName}********\n`);
      $.ADID = getUUID('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 1);
      $.UUID = getUUID('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      $.activityId = activityId
      $.activityUrl = $.shopUrl
      await shopDraw();
      await $.wait(2000)
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })


async function shopDraw() {
  try {
    $.token = null;
    $.secretPin = null;
    $.venderId = null;
    await getToken();
    await getCk();
    await $.wait(500)
    if ($.token) {
      await task('dz/common/getSimpleActInfoVo', `activityId=${$.activityId}`, 1)
      await $.wait(500)
      await getMyPing();
      if ($.secretPin) {
        let pin = '';
        if (activityUrl.includes('cjhy')) {
          pin = encodeURIComponent(encodeURIComponent($.secretPin));
        } else {
          pin = encodeURIComponent($.secretPin);
        }
        await task('common/accessLogWithAD', `venderId=${$.venderId}&code=${$.activityType}&pin=${pin}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=`, 1);
        await $.wait(500)
        await task('dingzhi/xiaomi/sign/activityContent', `activityId=${$.activityId}&pin=${pin}&pinImg=&nick=&cjyxPin=&cjhyPin=&shareUuid=`, 1);
        await $.wait(500)
        const { visitSku = {}, toShop = {}, shareActive = {}, sign = {}, addSku = {} } = $.activeTask;
        if (visitSku.allStatus) {
          console.log(`浏览商品任务：已完成`)
        } else {
          console.log(`\n开始做浏览商品任务`)
          for (const item of visitSku.data) {
            if (item['status'] === 0) await task('dingzhi/xiaomi/sign/saveTask', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&taskType=${item['type']}&taskValue=${item['value']}`, 1)
            await $.wait(100)
          }
        }
        if (toShop.allStatus) {
          console.log(`浏览会场任务：已完成`)
        } else {
          console.log(`\n开始做浏览会场任务`)
          for (const item of toShop.data) {
            if (item['status'] === 0) await task('dingzhi/xiaomi/sign/saveTask', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&taskType=${item['type']}&taskValue=${item['value']}`, 1)
            await $.wait(100)
          }
        }
        if (shareActive.allStatus) {
          console.log(`分享好友任务：已完成`)
        } else {
          console.log(`\n开始做分享好友任务`)
          for (const item of shareActive.data) {
            if (item['status'] === 0) await task('dingzhi/xiaomi/sign/saveTask', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&taskType=${item['type']}&taskValue=${item['value']}`, 1)
            await $.wait(100)
          }
        }
        if (sign.allStatus) {
          console.log(`每日签到任务：已完成`)
        } else {
          console.log(`\n开始做每日签到任务`)
          for (const item of sign.data) {
            if (item['status'] === 0) await task('dingzhi/xiaomi/sign/saveTask', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&taskType=${item['type']}&taskValue=${item['value']}`, 1)
            await $.wait(100)
          }
        }
        if (addSku.allStatus) {
          console.log(`一键加购任务：已完成`)
        } else {
          console.log(`\n开始做一键加购任务`)
          await task('dingzhi/xiaomi/sign/saveTask', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&taskType=21&taskValue=21`, 1)
        }
        if ($.index === 1) {
          console.log(`账号 ${$.index} ${$.UserName} 开始助力 作者\n`);
          await task('dingzhi/xiaomi/sign/shareRecord', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&shareUuid=7c1c6c2e11804d38aa225cf7a524ccdb`, 1);
        } else {
          console.log(`账号 ${$.index} ${$.UserName} 开始助力 账号 1邀请码： ${firstActorUuid}\n`);
          await task('dingzhi/xiaomi/sign/shareRecord', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${pin}&shareUuid=${firstActorUuid}`, 1);
        }
      } else {
        $.log("没有成功获取到用户信息")
      }
    } else {
      $.log("没有成功获取到用户鉴权信息")
    }
  } catch (e) {
    console.log(`错误：`, e);
  }
}

function task(function_id, body, isCommon = 0) {
  return new Promise(resolve => {
    const options = taskUrl(function_id, body, isCommon);
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          $.log(function_id + '网络请求失败')
          console.log($.toStr(err))
        } else {
          if (data) {
            data = JSON.parse(data);
            if (resp['headers']['set-cookie']) {
              cookie = `${originCookie};`
              for (let sk of resp['headers']['set-cookie']) {
                lz_cookie[sk.split(";")[0].substr(0, sk.split(";")[0].indexOf("="))] = sk.split(";")[0].substr(sk.split(";")[0].indexOf("=") + 1)
              }
              for (const vo of Object.keys(lz_cookie)) {
                cookie += vo + '=' + lz_cookie[vo] + ';'
              }
              // console.log('\n\n' + function_id + ' --- cookie ' + cookie)
            }
            if (data) {
              switch (function_id) {
                case 'dz/common/getSimpleActInfoVo':
                  // $.activityId = data.data.activityId;
                  $.jdActivityId = data.data.jdActivityId;
                  $.venderId = data.data.venderId;
                  $.shopId = data.data.shopId;
                  $.activityType = data.data.activityType;
                  break;
                case 'dingzhi/xiaomi/sign/activityContent':
                  if (data.result) {
                    const { allSignDay = [], activeTask = {}, actorUuid = '', isFollowShop, opencard } = data['data'];
                    console.log(`好友邀请码：${actorUuid}\n`);
                    if (actorUuid && !firstActorUuid) firstActorUuid = actorUuid;
                    $.actorUuid = actorUuid;
                    for (let item of allSignDay) {
                      console.log(`已签到日期：${item}`)
                    }
                    $.activeTask = activeTask;
                    if (!isFollowShop) {
                      console.log(`未关注店铺，开始关注店铺`)
                      await task('dingzhi/xiaomi/sign/followShop', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`, 1)
                    }
                    if (!opencard) {
                      console.log(`未加入店铺会员，开始加入店铺会员`)
                      const res = await openCard($.venderId, $.shopId);
                      if (res && res.code === 0) {
                        if (res.busiCode === "0") {
                          console.log(`【账号${$.index}:${$.nickName || $.UserName}】加入店铺会员成功！`);
                        } else {
                          console.log(`加入店铺会员失败：${res['message']}，busiCode：${res.busiCode}`);
                        }
                      } else {
                        console.log(`加入店铺会员异常：${$.toStr(res)}\n`);
                      }
                    }
                  } else {
                    console.log(`获取活动详情失败：${$.toStr(data)}\n`);
                  }
                  break;
                case 'dingzhi/xiaomi/sign/saveTask':
                  if (data.result) {
                    const { addScore = 0 } = data['data'];
                    console.log(`做任务成功，获得${addScore}积分`)
                  } else {
                    console.log(`做任务失败：${$.toStr(data)}\n`);
                    if (data.errorMessage && data.errorMessage.includes('您还没有关注店铺')) {
                      await task('dingzhi/xiaomi/sign/followShop', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`, 1)
                      await task(function_id, body, isCommon)
                    }
                    if (data.errorMessage && data.errorMessage.includes('您还不是会员')) {
                      const res = await openCard($.venderId, $.shopId);
                      if (res && res.code === 0) {
                        if (res.busiCode === "0") {
                          console.log(`【账号${$.index}:${$.nickName || $.UserName}】加入店铺会员成功！`);
                          await task(function_id, body, isCommon)
                        } else {
                          console.log(`加入店铺会员失败：${res['message']}，busiCode：${res.busiCode}`);
                        }
                      } else {
                        console.log(`加入店铺会员异常：${$.toStr(res)}\n`);
                      }
                    }
                  }
                  break;
                case 'dingzhi/xiaomi/sign/shareRecord':
                  console.log(`助力好友结果：${$.toStr(data)}\n`);
                  if (data && data.data && data.data['assistStatus'] === 1) console.log(`助力成功！`)
                  if (data && data.data && data.data['assistStatus'] === 2) console.log(`助力失败，已助力过该好友！`)
                  if (data && data.data && data.data['assistStatus'] === 3) console.log(`助力失败，已助力其他好友了！`)
                  break
                case 'crm/pageVisit/insertCrmPageVisit':
                  console.log('insertCrmPageVisit', data);
                  break
                case 'interaction/write/writePersonInfo':
                  console.log('writePersonInfo', data);
                  break
                case 'dingzhi/xiaomi/sign/followShop':
                  console.log('followShop', data);
                  break;
                default:
                  $.log(JSON.stringify(data))
                  break;
              }
            }
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }
    })
  })
}

function taskUrl(function_id, body, isCommon) {
  return {
    url: isCommon ? `${activityUrl}/${function_id}` : `${activityUrl}/wxDrawActivity/${function_id}`,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://lzkj-isv.isvjcloud.comm',
      'User-Agent': `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: 'keep-alive',
      Referer: $.activityUrl,
      Cookie: cookie
    },
    body: body,
    timeout: 10 * 1000
  }
}

function getMyPing() {
  let opt = {
    'url': `${activityUrl}/customer/getMyPing`,
    'headers': {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://lzkj-isv.isvjcloud.com',
      'User-Agent': `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      'Connection': 'keep-alive',
      'Referer': $.activityUrl,
      'Cookie': cookie,
    },
    'body': `userId=${$.venderId}&token=${$.token}&fromType=APP`,
    timeout: 10 * 1000
  }
  return new Promise(resolve => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log('getMyPing 请求失败')
          console.log($.toStr(err))
        } else {
          if (resp['headers']['set-cookie']) {
            cookie = `${originCookie};`
            for (let sk of resp['headers']['set-cookie']) {
              lz_cookie[sk.split(";")[0].substr(0, sk.split(";")[0].indexOf("="))] = sk.split(";")[0].substr(sk.split(";")[0].indexOf("=") + 1)
            }
            for (const vo of Object.keys(lz_cookie)) {
              cookie += vo + '=' + lz_cookie[vo] + ';'
            }
            // console.log('getMyPing --- cookie', cookie)
          }
          if (data) {
            data = JSON.parse(data)
            if (data.result) {
              $.log(`你好：${data.data.nickname}`)
              $.pin = data.data.nickname;
              $.secretPin = data.data.secretPin;
              console.log(`pin获取成功：${$.secretPin}\n`)
            } else {
              $.log(`getMyPing失败：${data.errorMessage}\n`)
            }
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }

    })
  })
}
function getCk() {
  return new Promise((resolve) => {
    let options = {
      'url': activityUrl + '/wxTeam/activity?activityId=' + activityId,
      'headers': {
        'Cookie': cookie,
        'User-Agent': 'jdapp;iPhone;9.4.0;13.1.2;2f7578cb634065f9beae94d013f172e197d62283;network/wifi;ADID/7B411CD9-D62C-425B-B083-9AFC49B94228;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone8,1;addressid/2474290248;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;pv/80.1;apprpd/Home_Main;ref/JDMainPageViewController;psq/1;ads/;psn/2f7578cb634065f9beae94d013f172e197d62283|138;jdv/0|kong|t_1000170135|tuiguang|notset|1611219732062|1611219732;adk/;app_device/IOS;pap/JA2015_311210|9.4.0|IOS 13.1.2;Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
      },
      timeout: 10 * 1000
    };
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          $.log('获取cookie失败：' + $.toStr(err))
        } else {
          if (resp['status'] === 200) {
            let LZ_TOKEN_KEY = JSON.stringify(resp).match(/LZ_TOKEN_KEY=[a-zA-Z0-9._-]+;/);
            let LZ_TOKEN_VALUE = JSON.stringify(resp).match(/LZ_TOKEN_VALUE=[\+a-zA-Z0-9._-]+/);
            if (LZ_TOKEN_KEY && LZ_TOKEN_VALUE) {
              activityCookie = '' + LZ_TOKEN_KEY + LZ_TOKEN_VALUE + '==';
              // console.log('activityCookie', activityCookie)
              cookie += activityCookie;
              // console.log('cookie + activityCookie', cookie)
            }
          } else {
            $.log(`获取activityCookie异常：${$.toStr(data)}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    });
  });
}
//强制加入会员
function openCard(venderId, shopId) {
  return new Promise(resolve => {
    const jsonpName = `jsonp_${Date.now()}_${getRandomInt(10000, 99999)}`
    const v_email = `${getRandomInt(1000000, 9999999)}@qq.com`
    let body = {
      "venderId": venderId,
      "shopId": shopId,
      "bindByVerifyCodeFlag": 1,
      "registerExtend": {
        "v_sex": "未知",
        "v_name": randomString(6),
        "v_birthday": "1990-03-18",
        "v_email": v_email
      },
      "writeChildFlag": 0,
      "channel": 9744
    }
    const opt = {
      url: `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body=${encodeURIComponent($.toStr(body))}&client=H5&clientVersion=9.2.0&uuid=&jsonp=${jsonpName}`,
      headers: {
        'Cookie': cookie,
        'Accept': "*/*",
        'Connection': "close",
        'Referer': "https://shopmember.m.jd.com/shopcard/?",
        'Accept-Encoding': "gzip, deflate, br",
        'Host': "api.m.jd.com",
        'User-Agent': "jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        'Accept-Language': "zh-cn"
      },
      timeout: 10 * 1000
    }
    $.get(opt, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.toStr(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = data.substring(data.indexOf(`(`) + 1, data.lastIndexOf(")"));
            data = JSON.parse(data);
          } else {
            console.log(`服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data)
      }
    });
  });
}

function getToken() {
  let opt = {
    url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
    headers: {
      Host: 'api.m.jd.com',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      Connection: 'keep-alive',
      Cookie: cookie,
      'User-Agent': 'JD4iPhone/167650 (iPhone; iOS 13.7; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    body: `body=%7B%22url%22%3A%20%22https%3A//lzdz1-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=72124265217d48b7955781024d65bbc4&client=apple&clientVersion=9.4.0&st=1621796702000&sv=120&sign=14f7faa31356c74e9f4289972db4b988`
  }
  return new Promise(resolve => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.code === "0") {
              $.token = data.token
            }
          } else {
            $.log("京东返回了空数据")
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }
    })
  })
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function randomString(e) {
  e = e || 32;
  let t = "abcdefhijkmnprstwxyz2345678", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}
function getUUID(format = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', UpperCase = 0) {
  return format.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    if (UpperCase) {
      uuid = v.toString(36).toUpperCase();
    } else {
      uuid = v.toString(36)
    }
    return uuid;
  });
}
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
