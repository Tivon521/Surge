/*
h5st加密，3.0版本
* */
async function getH5st($,url,appid){
    $.appId = appid;
    if(!appid){
        throw new Error("appId不能是空");
    }
    if(!$.h5stInfo ){
        $.h5stInfo = {};
    }
    if(!$.h5stInfo[appid]){
        $.fingerprint = await generateFp();
        await requestAlgo($);
        $.h5stInfo[appid] = {
            'fingerprint': $.fingerprint,
            'token':$.token,
            'enCryptMethodJD':$.enCryptMethodJD,
            //'stk':$.stk,
        };
    }else{
        $.fingerprint = $.h5stInfo[appid].fingerprint;
        $.token = $.h5stInfo[appid].token;
        $.enCryptMethodJD = $.h5stInfo[appid].enCryptMethodJD;
        //$.stk = $.h5stInfo[appid].stk;
    }
    // if(!$.fingerprint){
    //     $.fingerprint = await generateFp();
    // }
    // if(!$.fingerprint){
    //     throw new Error("fingerprint不能是空");
    // }
    // if(!$.token || !$.enCryptMethodJD){
    //     await requestAlgo($);
    // }
    // if($.enCryptMethodJDString && !$.enCryptMethodJD){
    //     $.enCryptMethodJD = new Function(`return ${$.enCryptMethodJDString}`)();
    // }
    let bodyInfo = getUrlData(url, 'body');
    if(!bodyInfo){
        throw new Error("找不到body");
    }
    const bodySign = $.CryptoJS.SHA256(bodyInfo).toString($.CryptoJS.enc.Hex);
    url = replaceParamVal(url,'body',bodySign);
    const stk = $.stk || (url ? getUrlData(url, '_stk') : '');
    if(!stk){
        throw new Error("找不到stk");
    }
    //console.log('stk:'+stk);
    const signtime = getUrlData(url, 't') ? getUrlData(url, 't') : Date.now();
    if(!signtime){
        throw new Error("t");
    }
    //console.log('signtime:'+signtime);
    const timestamp = timeString('yyyyMMddhhmmssSSS',new Date(Number(signtime)));
    let hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
    let st = '';
    stk.split(',').map((item, index) => {
        st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    let h5st = ["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2), "".concat('3.0'), "".concat(signtime)].join(";");
    return encodeURIComponent(h5st);
}

function replaceParamVal(url,paramName,replaceWith) {
    var re=eval('/('+ paramName+'=)([^&]*)/gi');
    var nUrl = url.replace(re,paramName+'='+replaceWith);
    return nUrl;
}

async function requestAlgo($) {
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        "headers": {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            //'User-Agent':$.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Content-Type': 'application/json',
            'Origin': 'https://daily-redpacket.jd.com',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://daily-redpacket.jd.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "3.0",
            "fp": $.fingerprint,
            "appId": $.appId,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    return new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            $.token = data.data.result.tk;
                            let enCryptMethodJDString = data.data.result.algo;
                            //$.token ="tk02w887b1b0418nBiKKbbRMfLUy1H4YvL60fv8HRi6iCSIoIhAb8sbHtKL0khzQ2jcbMbZ9Z/Y2n5XxOP5W+8Lpb/KL";// data.data.result.tk;
                            //let enCryptMethodJDString = "function test(tk,fp,ts,ai,algo){var rd='BU1mzUOdQS35';var str=`${tk}${fp}${ts}${ai}${rd}`;return algo.SHA512(str)}";//data.data.result.algo;
                            console.log(enCryptMethodJDString);
                            if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
                            console.log(`获取签名参数成功！`)
                            console.log(`token: ${$.token}`)
                        } else {
                            console.log('request_algo 签名参数API请求失败:')
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function generateFp() {
    const str = "0123456789", rmStrLen = 3, rd = Math.random() * 10 | 0, fpLen = 16
    let rmStr = "", notStr = ""
    !((num, str) => {
        let strArr = str.split(""), res = []
        for (let i = 0; i < num; i++) {
            let rd = Math.random() * (strArr.length - 1) | 0
            res.push(strArr[rd])
            strArr.splice(rd, 1)
        }
        rmStr = res.join(""), notStr = strArr.join("")
    })(rmStrLen, str)

    return ((size, num) => {
        let u = size, u2 = (fpLen - rmStrLen - size.toString().length) - size, res = ""
        while (u--) res += num[Math.random() * num.length | 0]
        res += rmStr
        while (u2--) res += num[Math.random() * num.length | 0]
        res += size
        return res
    })(rd, notStr)
}

function timeString(fmt,n) {
    var d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
    };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t, a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}

function getUrlData(url, name) {
    if (typeof URL !== "undefined") {
        let urls = new URL(url);
        let data = urls.searchParams.get(name);
        return data ? data : '';
    } else {
        const query = url.match(/\?.*/)[0].substring(1)
        const vars = query.split('&')
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=')
            if (pair[0] === name) {
                // return pair[1];
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
}

module.exports = {
    getH5st
}