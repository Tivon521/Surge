/*
*频道签到
10 8,20 * * * jd_pd_sign.js
* */
const $ = new Env('频道签到');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '',UA = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    let activityList = [
        {'code':'vL7Tz1i','name':'陪伴频道签到','url':'https://pro.m.jd.com/mall/active/kPM3Xedz1PBiGQjY4ZYGmeVvrts/index.html'},
        {'code':'vtJUrZG','name':'箱包签到','url':'https://pro.m.jd.com/mall/active/ZrH7gGAcEkY2gH8wXqyAPoQgk6t/index.html'},
        {'code':'vIJ9Tmz','name':'鞋靴馆签到','url':'https://pro.m.jd.com/mall/active/4RXyb1W4Y986LJW8ToqMK14BdTD/index.html'},
        {'code':'vCJHuKn','name':'拍拍二手签到','url':'https://pro.m.jd.com/mall/active/3S28janPLYmtFxypu37AYAGgivfp/index.html'},
    ];
    $.info = {};
    for (let i = 0; i < cookiesArr.length; i++) {
        UA = await getUA();
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            console.log(`\n*********京东账号${$.index} ${$.UserName}*********`);
            for (let j = 0; j < activityList.length; j++) {
                await signRun(activityList[j]);
            }
        }
    }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();})

async function signRun(actInfo) {
    console.log(`\n执行签到：${actInfo.name}`);
    let thisInfo = await getUrl(cookie,actInfo.code,UA);
    if(!thisInfo.url || !thisInfo.ck){
        console.log(`初始化失败1`);
        return
    }
    cookie = thisInfo.ck;
    let thisHtml = await getHtml(thisInfo.url);
    if(thisHtml.match(/"encryptProjectId\\":\\"(.*?)\\"/) && thisHtml.match(/"encryptAssignmentId\\":\\"(.*?)\\"/)){
        actInfo.encryptProjectId = thisHtml.match(/"encryptProjectId\\":\\"(.*?)\\"/)[1] || '';
        actInfo.encryptAssigmentIds = thisHtml.match(/"encryptAssignmentId\\":\\"(.*?)\\"/)[1] || '';
    }
    if(!actInfo.encryptProjectId || !actInfo.encryptAssigmentIds){
        console.log(`初始化失败2`);
        return
    }
    let body = {
        "encryptProjectId":actInfo.encryptProjectId,
        "encryptAssigmentIds":[actInfo.encryptAssigmentIds],
        "ext":{
            "rewardEncryptAssignmentId":actInfo.encryptAssigmentIds,
            "timesEncryptAssignmentId":actInfo.encryptAssigmentIds,
            "needNum":50
        },
        "sourceCode":"aceaceqingzhan"
    };
    let mainInfo = await takeRequest('queryInteractiveInfo',body,thisInfo.url);
    if(mainInfo.msg === 'success'){
        console.log(`获取详情成功`);
    }else{
        console.log(`获取详情失败`);
        return ;
    }
    await $.wait(3000);
    let assignmentList = mainInfo.assignmentList;
    for (let i = 0; i < assignmentList.length; i++) {
        let oneInfo = assignmentList[i];
        if(oneInfo.completionFlag){
            console.log(`已签到`);
        }else{
            let ext = oneInfo.ext;
            let info = {
                "encryptProjectId":actInfo.encryptProjectId,
                "encryptAssignmentId":oneInfo.encryptAssignmentId,
                "completionFlag":true,
                "itemId":ext.sign1.itemId,
                "sourceCode":"aceaceqingzhan"
            }
            console.log(JSON.stringify(info))
            let signInfo = await takeRequest('doInteractiveAssignment',info,thisInfo.url);
            console.log(JSON.stringify(signInfo));
        }
    }
}
async function getHtml(url) {
    //let url = `https://pro.m.jd.com/mall/active/${id}/index.html`;
    let options ={
        url,
        headers: {
            Cookie: cookie,
            'User-Agent': 'JD4iPhone/167220 (iPhone; iOS 13.7; Scale/3.00)'
        }
    }
    return new Promise(resolve => {
        $.get(options, async (err, resp, data) => {
            try {

            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data || {});
            }
        })
    })
}
async function takeRequest(functionID,bodyInfo,Referer) {
    let url = `https://api.m.jd.com/client.action?functionId=${functionID}`;
    let body = `appid=babelh5&body=${encodeURIComponent(JSON.stringify(bodyInfo))}&sign=11&t=${Date.now()}`;
    let options = {
        url: url,
        body:body,
        headers: {
            "Origin": "https://pro.m.jd.com",
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
            'Cookie': cookie,
            "Referer": Referer,
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN",
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
var _0xodL='jsjiami.com.v6',_0xodL_=['‮_0xodL'],_0x41a9=[_0xodL,'w7kTwrbCow8=','wrtXwqXDl8Kc','w4QgwrjDssKO','woLDphgTYA==','w48FwrzDqcKq','JcOfW2Y1CcKV','wpjDvw8pw64=','ezolw6wj','fxN+ZcKpKT0=','wqJEIw8=','wpzCmhc1WcO0Zw==','w5HCs0PCosOwwo/Dv8Obw7YM','w5LCkMO4wpcre8OzAcOrTQ==','G8K+bsKewp3ClA==','w7PCq2PDmcOL','wr/ClcK1dg==','w6x0GSlW','w7UCC0gi','EsO2EcOvwos=','wrrCmMKJUMOI','d1/Cs25MwrItAw==','AinCq8KTEsOPwobDqw==','BVJSwpvDgQ==','IcOQS2Al','URjCuVxI','bMOTwpJj','Ql/CkcKB','woFwFDDCuA==','w6jCm8Oqw5U=','J3xgwozDng==','N8Orw6V/cQ==','RCPDjyRC','wpTDnsKPW8O6','wqgqw4RhPg==','w7nChsO7w7QY','w5DDpMOAwqjDmw==','FsO4cggi','wphjwrvChls=','CsObNMOTUw==','wrpowpvCrWk=','wrnCs8KOc8Ox','wqwswqEIwq8=','wpPCs1DCkko=','woNPPMO6wqE=','w7Qlwp7DnQ==','bsOmw7jDvgg=','IMOsEcO0wpc=','wqrCr8Kzw6LDk8Kdwrc=','wr0bwoIFwpg=','wrnCosKDdsO1','wo5cwprCmGM/w7E=','GUJkwoHDsg==','wq/DqMK1YMOc','WMOlwqB2w4I=','JcO6AsOjwoc=','woXDngUBSA==','w7AuwoXDlMKB','wq/ClsKpwr8D','w47CuVDDisOhwpI=','LGHDuQ==','w7fli6nlpIrljIHCg+Wkn+i3hg==','OcOsWwAu','w5/DlcONwrbDoA==','XhHDuwBC','worDviANUw==','wqHCgMKUw63Dmw==','woRKwp3CunI=','wqTDmhkbbQ==','wqDDiMKCacOE','w5VkCiJh','w6nClVjDosOE','w7c8wrbCnws=','w6DCv0fDpMOW','w47DpMOiwrXDpA==','wog6wp81woc=','wpPCkiALTw==','PcOSTAg3','dsONwphlVw==','ZsOuwptR','YcOswp5Vw5Q=','w4rDh8Ocwp7Duw==','ZBhqbMKwBT4=','TyDDlANG','w6U6MXs2','wrXCk8OkeUvCocKJ','B8KsaMKSwoo=','w6bCpFXDvMO/','w5fCscOZKMKh','AcOYL8O0Vw==','w6UtMHAB','ZcOlw6PDmQw=','G8OJYjcw','woHClcKewoY9','wpjCsEvCtU4=','wp5uTcOGSw==','GsOWVxw+','w4I6wpXDlMKG','fFXCpFtRwrYn','axzDvi9B','w63CkMOLw44n','w592Ewh+Eg==','bsKCwrlfXMKD','ZxlnZw==','wqZ1V8OLT8KE','awosw5IK','LHYpw7jCvg==','w5vCl8O1I8Kk','wqLCqyEmSQ==','w6jCkgPDpsODwojDv8Oew7pGGhpDwr5nL8KnCMO4w4/CmEwtw7jCvipoYQrCgiF+w4rCshPDoBzDnCNNcj3CswV/asOqwq08','wqIfw7N7PUjDh8KLwqTCtjjDkcOJTsOccw==','ZgoFw48P','RMO0woBmw7g=','RxJAQsKD','Zi4pw7A1w6rCgw==','b8O3w6bDjgs=','wpgjwpkhwr4=','PcO9fxAN','woZrwqzChXs=','OcOFw4FQc8KB','Q0XCg8Kew4/Dg8OtbzjCq0TDmHx/wqzDhUU=','w4ZHEcO6w4w=','DcOUDsOZwrY=','O8OWZzAS','wrnCrFTCsUQ=','ZS/ChGlK','G8O4NsOVYw==','w7DCnUPDrcO/','XnLCisKEOQ==','QXLCisK7Jg==','FW4cccOF','w4ZVJS1W','wptcwp4=','VsOEwo8nw7E=','wrpwOsOWwrA=','M8OkMsO/Qg==','wpDCpMKxwoU5','OMODVm4=','ccOMwplYRg==','wp3CkRI0RMOJcg==','woHDvTsqVw==','wpgdw65RHQ==','wqJEIBPCo8KYwoo=','w4gBNnEd','TnTCm8K0w54=','wqsuwoI2wo4=','X8OawrMWw4w=','UBbCqnpSw7g=','F2vDiMKXw5A=','P8OYIcOgdg==','ZjLCn2pP','wpfClBAJWg==','HEoSw7zCsw==','woQvw5oFwrxEw54cbsKzwq3CnBnDkMK1Y8OwwrjCiEnCqsKkMcKzw5MONGYWUkpHfsOGKsKsKsK8bx7CrMK1MBzCnTEaVkU=','wpXDh8KKecOA','OklxwoHDoQ==','wqnCiMK4w5XDqA==','wqfCpSwFfw==','w64OwpHCrAg=','wqcuwrccwrY=','Em88acOL','wr5gwqzCrWU=','CsOdOsO0QA==','w4QewoDCtQw=','IcOoOQ==','wp4vw6RFGA==','LUw2dsOS','wqzCqHDCjkw=','eMOewpFpw4g=','wrjDhQ8Vw7w=','wq7DrCYmw6s=','Yy8qw5A/w5c=','wpouw6t+Iw==','IinCr8K3FMOU','wqvCn8KOR8Ox','IZjxYGsjiaumik.cofmC.rxyvr6AwA=='];if(function(_0x4264c6,_0xdddede,_0x17f34a){function _0x538c3d(_0xa1de13,_0x301583,_0x5a85bb,_0x3765c2,_0x10c040,_0x1a2e54){_0x301583=_0x301583>>0x8,_0x10c040='po';var _0x49be91='shift',_0xfbd3d4='push',_0x1a2e54='‮';if(_0x301583<_0xa1de13){while(--_0xa1de13){_0x3765c2=_0x4264c6[_0x49be91]();if(_0x301583===_0xa1de13&&_0x1a2e54==='‮'&&_0x1a2e54['length']===0x1){_0x301583=_0x3765c2,_0x5a85bb=_0x4264c6[_0x10c040+'p']();}else if(_0x301583&&_0x5a85bb['replace'](/[IZxYGukfCrxyrAwA=]/g,'')===_0x301583){_0x4264c6[_0xfbd3d4](_0x3765c2);}}_0x4264c6[_0xfbd3d4](_0x4264c6[_0x49be91]());}return 0xc4c67;};return _0x538c3d(++_0xdddede,_0x17f34a)>>_0xdddede^_0x17f34a;}(_0x41a9,0xb7,0xb700),_0x41a9){_0xodL_=_0x41a9['length']^0xb7;};function _0x3229(_0x83958c,_0xc60544){_0x83958c=~~'0x'['concat'](_0x83958c['slice'](0x1));var _0x1e47e3=_0x41a9[_0x83958c];if(_0x3229['cKQUvu']===undefined){(function(){var _0x4609f8=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0xcce60e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4609f8['atob']||(_0x4609f8['atob']=function(_0x588f01){var _0x5307a6=String(_0x588f01)['replace'](/=+$/,'');for(var _0x10caed=0x0,_0x32d84e,_0x4e19b6,_0x44ba62=0x0,_0x118601='';_0x4e19b6=_0x5307a6['charAt'](_0x44ba62++);~_0x4e19b6&&(_0x32d84e=_0x10caed%0x4?_0x32d84e*0x40+_0x4e19b6:_0x4e19b6,_0x10caed++%0x4)?_0x118601+=String['fromCharCode'](0xff&_0x32d84e>>(-0x2*_0x10caed&0x6)):0x0){_0x4e19b6=_0xcce60e['indexOf'](_0x4e19b6);}return _0x118601;});}());function _0x142369(_0x468481,_0xc60544){var _0x474989=[],_0x3f9e37=0x0,_0xfc7927,_0x349f5f='',_0x135f6f='';_0x468481=atob(_0x468481);for(var _0x235986=0x0,_0x14cecb=_0x468481['length'];_0x235986<_0x14cecb;_0x235986++){_0x135f6f+='%'+('00'+_0x468481['charCodeAt'](_0x235986)['toString'](0x10))['slice'](-0x2);}_0x468481=decodeURIComponent(_0x135f6f);for(var _0xeb31af=0x0;_0xeb31af<0x100;_0xeb31af++){_0x474989[_0xeb31af]=_0xeb31af;}for(_0xeb31af=0x0;_0xeb31af<0x100;_0xeb31af++){_0x3f9e37=(_0x3f9e37+_0x474989[_0xeb31af]+_0xc60544['charCodeAt'](_0xeb31af%_0xc60544['length']))%0x100;_0xfc7927=_0x474989[_0xeb31af];_0x474989[_0xeb31af]=_0x474989[_0x3f9e37];_0x474989[_0x3f9e37]=_0xfc7927;}_0xeb31af=0x0;_0x3f9e37=0x0;for(var _0xbb1888=0x0;_0xbb1888<_0x468481['length'];_0xbb1888++){_0xeb31af=(_0xeb31af+0x1)%0x100;_0x3f9e37=(_0x3f9e37+_0x474989[_0xeb31af])%0x100;_0xfc7927=_0x474989[_0xeb31af];_0x474989[_0xeb31af]=_0x474989[_0x3f9e37];_0x474989[_0x3f9e37]=_0xfc7927;_0x349f5f+=String['fromCharCode'](_0x468481['charCodeAt'](_0xbb1888)^_0x474989[(_0x474989[_0xeb31af]+_0x474989[_0x3f9e37])%0x100]);}return _0x349f5f;}_0x3229['DsXrcE']=_0x142369;_0x3229['AxjypX']={};_0x3229['cKQUvu']=!![];}var _0x5d5272=_0x3229['AxjypX'][_0x83958c];if(_0x5d5272===undefined){if(_0x3229['vTMUtY']===undefined){_0x3229['vTMUtY']=!![];}_0x1e47e3=_0x3229['DsXrcE'](_0x1e47e3,_0xc60544);_0x3229['AxjypX'][_0x83958c]=_0x1e47e3;}else{_0x1e47e3=_0x5d5272;}return _0x1e47e3;};async function getUrl(_0x3ec5aa,_0x23c205,_0xb18b4c){var _0x2df097={'VidPQ':function(_0x6e25a7,_0x459110){return _0x6e25a7(_0x459110);},'QQDOz':function(_0x410b16){return _0x410b16();},'tGVGN':function(_0x147dca,_0x19c88d,_0x4c133c){return _0x147dca(_0x19c88d,_0x4c133c);},'bACjp':_0x3229('‫0','u1X!'),'xswNp':_0x3229('‫1','m1ae'),'VWNXN':_0x3229('‫2','hICp'),'mpNtK':_0x3229('‫3','RNEa'),'NCGpy':function(_0x2977f3,_0x24f248){return _0x2977f3!=_0x24f248;},'dZQrY':_0x3229('‮4','r%!0'),'FQqYk':function(_0x3e5727,_0x47797c){return _0x3e5727!==_0x47797c;},'bGOdC':_0x3229('‮5','4sy^'),'hwgtx':function(_0x5da97d,_0x241ec2){return _0x5da97d===_0x241ec2;},'bVBaG':function(_0x1e2d3c,_0x991bd6){return _0x1e2d3c+_0x991bd6;},'JyRJb':_0x3229('‮6','hdUL'),'wSRBk':function(_0x24c15c,_0x58f093){return _0x24c15c===_0x58f093;},'pyrdb':_0x3229('‫7','lG#Z'),'LBtSN':_0x3229('‫8','HEVd'),'aWnxu':function(_0x5edade,_0x29f6e2,_0x5dc9c6){return _0x5edade(_0x29f6e2,_0x5dc9c6);},'ZkcrR':function(_0x2f0e45,_0x58e311){return _0x2f0e45!=_0x58e311;},'gmVZs':_0x3229('‫9','*m]R'),'eiypl':_0x3229('‫a','hdUL'),'CrWOk':_0x3229('‫b','eo[r'),'gDpie':_0x3229('‮c','dPda')};let _0x5356f8=_0x2df097[_0x3229('‮d','KMm#')](decodeURIComponent,cookie[_0x3229('‮e','^z$]')](/pt_pin=([^; ]+)(?=;?)/)&&cookie[_0x3229('‫f','wmuP')](/pt_pin=([^; ]+)(?=;?)/)[0x1]);if(!$[_0x3229('‫10','WIfY')][_0x5356f8]){$[_0x3229('‫11','([)Z')][_0x5356f8]=_0x2df097[_0x3229('‫12','u1X!')](getCookieStr);}let _0x17e222=$[_0x3229('‮13','RNEa')][_0x5356f8];let _0x581228='';let _0x5bb76d=await _0x2df097[_0x3229('‮14','KMm#')](getInfo1,''+_0x3ec5aa+_0x17e222,_0x23c205);let _0x2ed23d=_0x5bb76d[_0x2df097[_0x3229('‫15','NpHh')]][_0x2df097[_0x3229('‮16','3IS&')]][_0x2df097[_0x3229('‮17','RlE^')]]||_0x5bb76d[_0x2df097[_0x3229('‫18','35VQ')]][_0x2df097[_0x3229('‫19','RNEa')]][_0x2df097[_0x3229('‫1a','mo)r')]]||'';let _0x288dd0='';if(_0x2ed23d){if(_0x2df097[_0x3229('‫1b','x5gh')](typeof _0x2ed23d,_0x2df097[_0x3229('‫1c','8C(J')])){_0x288dd0=_0x2ed23d[_0x3229('‮1d','HnvJ')](',');}else{if(_0x2df097[_0x3229('‫1e','8C(J')](_0x2df097[_0x3229('‫1f','hdUL')],_0x2df097[_0x3229('‫20','(Tod')])){_0x288dd0=_0x2ed23d[_0x3229('‮21','WN&V')](',');}else{_0x288dd0=_0x2ed23d;}}for(let _0x3ec5aa of _0x288dd0){let _0x28af33=_0x3ec5aa[_0x3229('‮22','IomU')](';')[0x0][_0x3229('‫23','L)jJ')]();if(_0x28af33[_0x3229('‮24','3kzZ')]('=')[0x1]){if(_0x2df097[_0x3229('‫25','*m]R')](_0x581228[_0x3229('‫26','^U$^')](_0x28af33[_0x3229('‫27','(Tod')]('=')[0x1]),-0x1))_0x581228+=_0x2df097[_0x3229('‫28','hdUL')](_0x28af33[_0x3229('‫29','8C(J')](/ /g,''),';\x20');}}}let _0x4bea27=_0x5bb76d[_0x2df097[_0x3229('‫2a','KMm#')]][_0x3229('‮2b','RlE^')](/(https:\/\/u\.jd\.com\/jda[^']+)/)&&_0x5bb76d[_0x2df097[_0x3229('‫2c','0&d@')]][_0x3229('‮2d','*m]R')](/(https:\/\/u\.jd\.com\/jda[^']+)/)[0x1]||'';if(!_0x4bea27){if(_0x2df097[_0x3229('‮2e','Xb&N')](_0x2df097[_0x3229('‫2f','L)jJ')],_0x2df097[_0x3229('‫30','&6cC')])){$[_0x3229('‮31','hICp')](e,resp);}else{console[_0x3229('‮32','R[Im')](_0x5356f8+_0x3229('‫33','hdUL'));return;}}let _0x4fc244=await _0x2df097[_0x3229('‮34','x5gh')](getInfo2,_0x4bea27,''+_0x3ec5aa+_0x17e222+_0x581228);_0x2ed23d=_0x4fc244[_0x2df097[_0x3229('‮35','mo)r')]]&&_0x4fc244[_0x2df097[_0x3229('‫36','3IS&')]][_0x2df097[_0x3229('‮37','Xb&N')]]&&(_0x4fc244[_0x2df097[_0x3229('‫38','^U$^')]][_0x2df097[_0x3229('‫39','8C(J')]][_0x2df097[_0x3229('‫3a','Xb&N')]]||_0x4fc244[_0x2df097[_0x3229('‮3b','RlE^')]][_0x2df097[_0x3229('‮3c','lG#Z')]][_0x2df097[_0x3229('‮3d','4sy^')]]||'')||'';_0x288dd0='';if(_0x2ed23d){if(_0x2df097[_0x3229('‮3e','6ACq')](typeof _0x2ed23d,_0x2df097[_0x3229('‫3f','4sy^')])){_0x288dd0=_0x2ed23d[_0x3229('‮40','mo)r')](',');}else{_0x288dd0=_0x2ed23d;}for(let _0x3ec5aa of _0x288dd0){if(_0x2df097[_0x3229('‮41','(Tod')](_0x2df097[_0x3229('‫42','m1ae')],_0x2df097[_0x3229('‮43','x5gh')])){let _0x28af33=_0x3ec5aa[_0x3229('‫44','WIfY')](';')[0x0][_0x3229('‮45','0&d@')]();if(_0x28af33[_0x3229('‮46','0&d@')]('=')[0x1]){if(_0x2df097[_0x3229('‮47','mo)r')](_0x581228[_0x3229('‫48','l#c$')](_0x28af33[_0x3229('‮49','3IS&')]('=')[0x1]),-0x1))_0x581228+=_0x2df097[_0x3229('‫4a','HEVd')](_0x28af33[_0x3229('‫4b','@mrV')](/ /g,''),';\x20');}}else{_0x288dd0=_0x2ed23d[_0x3229('‫4c','r%!0')](',');}}}let _0x629773=_0x4fc244[_0x2df097[_0x3229('‫4d','4sy^')]]&&_0x4fc244[_0x2df097[_0x3229('‮4e','IELR')]][_0x2df097[_0x3229('‫4f','HnvJ')]]&&(_0x4fc244[_0x2df097[_0x3229('‮50','HEVd')]][_0x2df097[_0x3229('‮51','3kzZ')]][_0x2df097[_0x3229('‫52','x5gh')]]||_0x4fc244[_0x2df097[_0x3229('‮53','&6cC')]][_0x2df097[_0x3229('‫54','WN&V')]][_0x2df097[_0x3229('‮55','69P3')]]||'')||'';return{'url':_0x629773,'ck':''+_0x3ec5aa+_0x17e222+_0x581228};}function getCookieStr(){var _0x345317={'Bmbde':function(_0x55f8d7,_0x4cf28a){return _0x55f8d7+_0x4cf28a;},'WLFEs':function(_0x34f164,_0x50b10a){return _0x34f164(_0x50b10a);},'leGtO':function(_0x3dcc9c,_0x216d96){return _0x3dcc9c*_0x216d96;}};let _0x394f80=0x7b;let _0x28886d=_0x345317[_0x3229('‫56','x5gh')](_0x345317[_0x3229('‮57','L)jJ')](new Date()[_0x3229('‫58','eo[r')](),''),_0x345317[_0x3229('‫59','3IS&')](parseInt,_0x345317[_0x3229('‫5a','RNEa')](0x7fffffff,Math[_0x3229('‫5b','lG#Z')]())));let _0x458073=_0x28886d[_0x3229('‫5c','j@4W')](0x0,0xa);let _0x2ef4fd=0x1;let _0x45bf2d=[_0x394f80,_0x28886d,_0x458073,_0x458073,_0x458073,_0x2ef4fd][_0x3229('‮5d','l#c$')]('.');let _0x4eb233=_0x3229('‫5e','69P3')+_0x45bf2d+';';return _0x4eb233;}async function getInfo1(_0x43fa30,_0x18a541){var _0x2f7186={'SXMfA':function(_0xf668e8,_0x236f83){return _0xf668e8===_0x236f83;},'EOxYY':function(_0x10cd60,_0x2da351){return _0x10cd60+_0x2da351;},'cmRHI':function(_0x16772e,_0x3adebe){return _0x16772e!==_0x3adebe;},'YohJz':_0x3229('‮5f','C8aj'),'YVIVj':_0x3229('‮60','oVe#'),'bSnoD':function(_0x2bf33e,_0x4dade2){return _0x2bf33e(_0x4dade2);},'RKtbl':function(_0x2a74e3){return _0x2a74e3();},'LykZV':function(_0x1d8ade,_0x4a4cfa){return _0x1d8ade!==_0x4a4cfa;},'SykeI':_0x3229('‮61','IELR'),'HnMtT':_0x3229('‮62','m1ae'),'kBXAG':_0x3229('‫63','hICp'),'JdNKK':function(_0x4509df,_0x779f06){return _0x4509df!==_0x779f06;},'rarYw':_0x3229('‮64','35VQ'),'VHwMR':function(_0x4652dd,_0x19d88){return _0x4652dd===_0x19d88;},'eFJhV':_0x3229('‮65','C8aj'),'zRFqy':_0x3229('‮66','0&d@')};let _0x511bc1='';if(_0x2f7186[_0x3229('‮67','l#c$')](_0x18a541[_0x3229('‮68','C8aj')](_0x2f7186[_0x3229('‮69','3kzZ')]),-0x1)){if(_0x2f7186[_0x3229('‫6a','(Tod')](_0x2f7186[_0x3229('‮6b','x5gh')],_0x2f7186[_0x3229('‮6c','8C(J')])){$[_0x3229('‮6d','NpHh')](e,resp);}else{_0x511bc1=_0x18a541;}}else{_0x511bc1=_0x3229('‫6e','([)Z')+_0x18a541;}return new Promise(_0x20d6aa=>{var _0x201deb={'tqmTe':function(_0x515f78,_0x663d9e){return _0x2f7186[_0x3229('‫6f','Q8xL')](_0x515f78,_0x663d9e);},'RviZS':function(_0xfe0e04,_0x333391){return _0x2f7186[_0x3229('‫70','*m]R')](_0xfe0e04,_0x333391);},'OmEkl':function(_0x41c475,_0x1d770f){return _0x2f7186[_0x3229('‮71','x5gh')](_0x41c475,_0x1d770f);},'JOjEe':_0x2f7186[_0x3229('‮72','WN&V')],'eElZb':_0x2f7186[_0x3229('‫73','wmuP')],'FsyZQ':function(_0x1a68c4,_0x10a8b5){return _0x2f7186[_0x3229('‮74','HnvJ')](_0x1a68c4,_0x10a8b5);},'WeVYR':function(_0x368561){return _0x2f7186[_0x3229('‮75','hICp')](_0x368561);}};if(_0x2f7186[_0x3229('‮76','O^bp')](_0x2f7186[_0x3229('‫77','O^bp')],_0x2f7186[_0x3229('‫78','B!kX')])){const _0x51ba32={'url':_0x511bc1,'followRedirect':![],'headers':{'Cookie':_0x43fa30,'user-agent':_0x2f7186[_0x3229('‮79','lG#Z')]}};$[_0x3229('‫7a','8C(J')](_0x51ba32,async(_0x66fc79,_0x55e439,_0x42ab53)=>{if(_0x201deb[_0x3229('‫7b','xWC^')](_0x201deb[_0x3229('‮7c','IomU')],_0x201deb[_0x3229('‫7d','HnvJ')])){let _0x379a0a=_0x43fa30[_0x3229('‫7e','&6cC')](';')[0x0][_0x3229('‫7f','^z$]')]();if(_0x379a0a[_0x3229('‮22','IomU')]('=')[0x1]){if(_0x201deb[_0x3229('‮80','WIfY')](newCookie[_0x3229('‮81','m1ae')](_0x379a0a[_0x3229('‫82','Xb&N')]('=')[0x1]),-0x1))newCookie+=_0x201deb[_0x3229('‫83','35VQ')](_0x379a0a[_0x3229('‫84','u1X!')](/ /g,''),';\x20');}}else{try{if(_0x201deb[_0x3229('‫85','HEVd')](_0x201deb[_0x3229('‮86','([)Z')],_0x201deb[_0x3229('‫87','(Tod')])){setcookie=setcookies;}else{_0x201deb[_0x3229('‫88','xWC^')](_0x20d6aa,{'resp':_0x55e439,'data':_0x42ab53});}}catch(_0x50eeb9){$[_0x3229('‮89','wmuP')](_0x50eeb9,_0x55e439);}finally{_0x201deb[_0x3229('‮8a','R[Im')](_0x20d6aa);}}});}else{_0x201deb[_0x3229('‫8b','HnvJ')](_0x20d6aa,{'resp':resp,'data':data});}});}async function getInfo2(_0x4247e7,_0x15e3be){var _0x10128a={'WNKzt':function(_0x5f33dc,_0x176843){return _0x5f33dc(_0x176843);},'irGJq':function(_0x54a8e8){return _0x54a8e8();},'jIoRC':function(_0x3cc3af,_0x4aa205){return _0x3cc3af===_0x4aa205;},'SZZTC':function(_0x58d833,_0x1b0b04){return _0x58d833+_0x1b0b04;},'CYDAQ':function(_0xc297cd,_0x1841ff){return _0xc297cd(_0x1841ff);},'iEYpZ':function(_0x4a618d,_0x80558){return _0x4a618d!==_0x80558;},'OomlZ':_0x3229('‫8c','wmuP'),'BYFYg':_0x3229('‫8d','m1ae'),'svbNg':_0x3229('‮8e','oVe#'),'iIUXU':_0x3229('‫8f','(Tod')};return new Promise(_0x462465=>{var _0x410f2e={'PElum':function(_0x158a5d,_0x4695a9){return _0x10128a[_0x3229('‫90','RlE^')](_0x158a5d,_0x4695a9);},'pkOPC':function(_0x58e32b){return _0x10128a[_0x3229('‫91','KMm#')](_0x58e32b);},'TDcNV':function(_0x3937db,_0x4076bd){return _0x10128a[_0x3229('‮92','^U$^')](_0x3937db,_0x4076bd);},'pLgsC':function(_0x1df015,_0x16fa3e){return _0x10128a[_0x3229('‫93','m1ae')](_0x1df015,_0x16fa3e);},'LkLur':function(_0x4b9817,_0x43e5b2){return _0x10128a[_0x3229('‫94','6ACq')](_0x4b9817,_0x43e5b2);},'jBcUh':function(_0x1405ec,_0x5497b6){return _0x10128a[_0x3229('‫95','(Tod')](_0x1405ec,_0x5497b6);},'SJlUf':_0x10128a[_0x3229('‫96','B!kX')],'EcEfq':_0x10128a[_0x3229('‫97','8C(J')],'DwOBm':_0x10128a[_0x3229('‫98','HnvJ')]};const _0x5d5896={'url':_0x4247e7,'followRedirect':![],'headers':{'Cookie':_0x15e3be,'user-agent':_0x10128a[_0x3229('‮99','6ACq')]}};$[_0x3229('‫9a','FZIt')](_0x5d5896,async(_0x4933f9,_0x1cfd02,_0x42a6a9)=>{var _0x2bd157={'ORKYI':function(_0xb61cac,_0x4e7d35){return _0x410f2e[_0x3229('‫9b','35VQ')](_0xb61cac,_0x4e7d35);},'tzhyn':function(_0x423423,_0x7e7dc2){return _0x410f2e[_0x3229('‫9c','B!kX')](_0x423423,_0x7e7dc2);}};try{_0x410f2e[_0x3229('‮9d','WN&V')](_0x462465,{'resp':_0x1cfd02,'data':_0x42a6a9});}catch(_0x249c90){if(_0x410f2e[_0x3229('‫9e','0&d@')](_0x410f2e[_0x3229('‮9f','V%6X')],_0x410f2e[_0x3229('‮a0','V%6X')])){$[_0x3229('‫a1','C8aj')](_0x249c90,_0x1cfd02);}else{try{_0x410f2e[_0x3229('‫a2','35VQ')](_0x462465,{'resp':_0x1cfd02,'data':_0x42a6a9});}catch(_0x94c287){$[_0x3229('‮a3','dPda')](_0x94c287,_0x1cfd02);}finally{_0x410f2e[_0x3229('‮a4','hdUL')](_0x462465);}}}finally{if(_0x410f2e[_0x3229('‮a5','6ACq')](_0x410f2e[_0x3229('‫a6','qiMc')],_0x410f2e[_0x3229('‮a7','L)jJ')])){_0x410f2e[_0x3229('‮a8','Xb&N')](_0x462465);}else{if(_0x2bd157[_0x3229('‫a9','L)jJ')](newCookie[_0x3229('‮aa','^z$]')](name[_0x3229('‮ab','V%6X')]('=')[0x1]),-0x1))newCookie+=_0x2bd157[_0x3229('‮ac','C8aj')](name[_0x3229('‫ad','l#c$')](/ /g,''),';\x20');}}});});};_0xodL='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
