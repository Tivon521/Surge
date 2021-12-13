/*
0 0-6/1 * * * jd_sign.js
*/
const $ = new Env('京东签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const h5Tool = require('./utils/h5stTool_3_0.js');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '',UA = '',beanNum,message = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
}
const turnTableId = [
    //{"name": "京东商城-内衣", "id": 1071, "url": "https://prodev.m.jd.com/mall/active/4PgpL1xqPSW1sVXCJ3xopDbB1f69/index.html"},
    {"name": "京东商城-健康", "id": 527, "url": "https://prodev.m.jd.com/mall/active/w2oeK5yLdHqHvwef7SMMy4PL8LF/index.html"},
    {"name": "京东商城-清洁", "id": 446, "url": "https://prodev.m.jd.com/mall/active/2Tjm6ay1ZbZ3v7UbriTj6kHy9dn6/index.html"},
    {"name": "京东商城-个护", "id": 336, "url": "https://prodev.m.jd.com/mall/active/2tZssTgnQsiUqhmg5ooLSHY9XSeN/index.html"},
    //{"name": "京东商城-童装", "id": 511, "url": "https://prodev.m.jd.com/mall/active/3Af6mZNcf5m795T8dtDVfDwWVNhJ/index.html"},
    {"name": "京东商城-母婴", "id": 458, "url": "https://prodev.m.jd.com/mall/active/3BbAVGQPDd6vTyHYjmAutXrKAos6/index.html"},
    {"name": "京东商城-数码", "id": 347, "url": "https://prodev.m.jd.com/mall/active/4SWjnZSCTHPYjE5T7j35rxxuMTb6/index.html"},
    //{"name": "京东超市", "id": 1204, "url": "https://pro.m.jd.com/mall/active/QPwDgLSops2bcsYqQ57hENGrjgj/index.html"},
    // {
    //     "name": "天天领京豆(PLUS会员专属)",
    //     "id": 1265,
    //     "url": "https://prodev.m.jd.com/mall/active/N9MpLQdxZgiczZaMx2SzmSfZSvF/index.html"
    // },
]
$.CryptoJS = require('crypto-js');
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    for (let k = 0; k < turnTableId.length; k++) {
        $.oneInfo = turnTableId[k];
        console.log(`\n===========开始执行：${$.oneInfo.name}===========\n`);
        for (let i = 0; i < cookiesArr.length; i++) {
            UA = await getUA();
            if (cookiesArr[i]) {
                cookie = cookiesArr[i];
                $.index = i + 1;
                $.nickName = '';
                $.isLogin = true;
                //await TotalBean();
                //console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
                // if (!$.isLogin) {
                //     $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
                //     continue
                // }
                beanNum = 0
                successNum = 0
                errorNum = 0
                subTitle = '';
                const UTC8 = new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 28800000;
                $.beanSignTime = new Date(UTC8).toLocaleString('zh', {hour12: false});
                await signRun()
                // if (beanNum) {
                //     let msg = `【京东账号${$.index}】:  ${$.nickName || $.UserName}\n【签到时间】:  ${$.beanSignTime}\n【签到概览】:  成功${successNum}个, 失败${errorNum}个\n【签到奖励】:  ${beanNum}京豆\n`
                //     message += msg + '\n'
                //     $.msg($.name, msg);
                // }
            }
        }
    }
    // await showMsg();
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();})


async function signRun(){
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    $.stk = "appid,body,client,clientVersion,functionId,t";
    //console.log(`开始执行：${$.oneInfo.name}`);
    let detailInfo = await turncardChannelDetail();
    await $.wait(3000);
    if(detailInfo.data.hasSign){
        console.log(`${$.UserName},已签到`);
        return ;
    }
    //console.log(`去签到`);
    let data = await turncardChannelSign()
    //console.log(JSON.stringify(signInfo))
    if (data.success && data.data) {
        data = data.data
        if (Number(data.jdBeanQuantity) > 0) beanNum += Number(data.jdBeanQuantity)
        signFlag = true;
        console.log(`${$.UserName} 签到成功:获得 ${Number(data.jdBeanQuantity)}京豆`);
    } else {
        if (data.errorMessage) {
            if (data.errorMessage.indexOf('已签到') > -1 || data.errorMessage.indexOf('今天已经签到') > -1) {
                signFlag = true;
            }
            console.log(`${$.UserName} ${$.oneInfo.name} 签到失败： ${data.errorMessage}\n`)
            if (data.errorMessage && data.errorMessage.includes('火爆')) $.hotAccount = true;
            if (data.errorMessage && data.errorMessage.includes('系统繁忙')) $.hotAccount = true;
        } else {
            console.log(`${$.UserName} ${$.oneInfo.name} 签到异常： ${JSON.stringify(data)}\n`)
        }
    }
    await $.wait(5000)
}
async function turncardChannelDetail(){
    let appId = '9a4de';
    let body = {"turnTableId":$.oneInfo.id}
    body = `clientVersion=&appid=jdchoujiang_h5&t=${Date.now()}&functionId=turncardChannelDetail&body=${JSON.stringify(body)}&uuid=12282635814281946523573`
    let h5st = await h5Tool.getH5st($,`https://api.m.jd.com?${body}`,appId);
    let url = `https://api.m.jd.com?${body}&h5st=${h5st}`;
    let options = {
        url: url,
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            'Cookie': cookie,
            "Origin": "https://prodev.m.jd.com",
            "Referer": "https://prodev.m.jd.com/",
            "User-Agent": UA,
        }
    }
    return new Promise(resolve => {
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data || {});
            }
        })
    })
}
async function turncardChannelSign() {
    let appId = 'b342e';
    let body = {"turnTableId":$.oneInfo.id,"fp":"","eid":""};
    let url = `https://api.m.jd.com/api?client=iOS&clientVersion=10.2.7&appid=jdchoujiang_h5&t=${Date.now()}&functionId=turncardChannelSign&body=${JSON.stringify(body)}`;
    let h5st = await h5Tool.getH5st($,url,appId);
    url = `${url}&h5st=${h5st}&uuid=${$.UUID}&build=${$.build}&osVersion=${$.osVersion}&networkType=wifi&partner=&d_brand=iPhone&d_model=${$.mobile}&turnTableId=${$.oneInfo.id}&fp=&eid=`;
    let options = {
        url: url,
        body:'',
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            'Cookie': cookie,
            "Origin": "https://prodev.m.jd.com",
            "Referer": "https://prodev.m.jd.com/",
            "User-Agent": UA,
        }
    }
    return new Promise(resolve => {
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data || {});
            }
        })
    })
}
function getUA() {
    $.UUID = randomString(40)
    const buildMap = {
        "167814": `10.1.4`,
        "167841": `10.1.6`,
    }
    $.osVersion = `${randomNum(12, 14)}.${randomNum(0, 6)}`
    let network = `network/${['4g', '5g', 'wifi'][randomNum(0, 2)]}`
    $.mobile = `iPhone${randomNum(9, 13)},${randomNum(1, 3)}`
    $.build = ["167814","167841","167894"][randomNum(0,1)]
    $.appVersion = buildMap[$.build]
    return `jdapp;iPhone;${$.appVersion};${$.osVersion};${$.UUID};${network};model/${$.mobile};addressid/${randomNum(1e9)};appBuild/${$.build};jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS ${$.osVersion.replace(/\./g, "_")} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomNum(min, max) {
    if (arguments.length === 0) return Math.random()
    if (!max) max = 10 ** (Math.log(min) * Math.LOG10E + 1 | 0) - 1
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomString(min, max = 0) {
    var str = "", range = min, arr = [...Array(35).keys()].map(k => k.toString(36));

    if (max) {
        range = Math.floor(Math.random() * (max - min + 1) + min);
    }
    for (let i = 0; i < range;) {
        let randomString = Math.random().toString(16).substring(2)
        if ((range - i) > randomString.length) {
            str += randomString
            i += randomString.length
        } else {
            str += randomString.slice(i - range)
            i += randomString.length
        }
    }
    return str;
}

async function showMsg() {
    if (message) {
        $.msg($.name, '', `【签到数量】:  ${turnTableId.length}个\n` + subTitle + message);
        if ($.isNode() && message) await notify.sendNotify(`${$.name}`, `【签到数量】:  ${turnTableId.length}个\n` + subTitle + message);
    }
}
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
