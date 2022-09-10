/*
=======================About=======================
A JavaScript program for you to have a good sleep!
=================Your Information==================
*/
const username = '2019********';   // Student ID
const password = '******';   // Password
const provinceCode = '**';   // Province Code
const cityCode = '****';   // City Code
const currentLocation = '******';   // Your Current Location
const longitude = '***.******';   // Longitude
const latitude = '**.******';   // Latitude
const vaccinationState = 5;   // Your Vaccination State 1:First Vaccinated; 2:Second Vaccinated; 3:Haven't Been Vaccinated; 4:Can't Been Vaccinated; 5:Third Vaccinated;

// const OCR = '*******'   // https://ocr.space where you can get your free API key for verification code identification.

/*
=======================Code========================
*/
const $ = API("jksb", true);

$.http = HTTP({
    baseURL: "https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll",
})

!(async () => {
    $.log("开始执行...")
    $.log('登录中...')
    const loginResult = await login()
    if (loginResult.indexOf('对不起') > -1) {
        const error = loginResult.match(/(对不起.*?)</)
        $.notify("登录失败", error[1] || loginResult)
        return
    }
    const [, ptopid] = loginResult.match(/ptopid=(.*?)&sid=(.*?)/)
    if (!ptopid) {
        $.notify("登录失败", loginResult)
        return
    }
    $.log('登录成功！');
    $.log('查看今天填报情况...');
    const getIndexResult = await getIndex(ptopid)
    if (getIndexResult.indexOf('已经填报过了') > -1) {
        $.notify("填报成功", "今天已经填报过了！")
        return
    }
    $.log('今天还未填报！');
    $.log('填报中...');
    await submitIndex(ptopid)
    // let code = ''
    // for (let i = 0; i < 5; i++) {
    //     code = await getCode(ptopid)
    //     if (code) {
    //         break
    //     }
    // }
    // if(!code) {
    //     $.notify("填报失败", "获取验证码失败！")
    //     return
    // }
    const submitFormResult = await submitForm(ptopid)
    if (submitFormResult.indexOf('感谢') > -1) {
        $.notify("填报成功")
        return
    } else if (submitFormResult.indexOf('提交失败') > -1) {
        const error = submitFormResult.match(/提交失败.*?<li>(.*?)<\/li>/)
        $.notify("填报失败", error[1] || error[0] || submitFormResult)
        return
    } else {
        $.notify("填报失败", submitFormResult)
        return
    }
})()
    .catch(err => {
        $.notify("填报失败", err)
    })


function login() {
    return new Promise((resolve, reject) => {
        const data = {
            uid: username,
            upw: password
        }
        $.http.post({
            url: '/login',
            body: urlEncode(data)
        })
            .then(res => resolve(res.body))
            .catch(err => reject(err))
    })
}

function getIndex(ptopid) {
    return new Promise((resolve, reject) => {
        $.http.get(`/jksb?ptopid=${ptopid}`)
            .then(res => resolve(res.body))
            .catch(err => {
                reject(err)
            })
    })
}

function submitIndex(ptopid) {
    return new Promise((resolve, reject) => {
        const data = {
            'did': '1',
            'door': '',
            'fun18': '220',
            'men6': 'a',
            'ptopid': ptopid,
            'sid': '',
        }
        $.http.post({
            url: '/jksb',
            body: urlEncode(data)
        })
            .then(res => resolve(res.body))
            .catch(err => reject(err))
    })
}

// function getCode(ptopid) {
//     return new Promise((resolve, reject) => {
//         const url = `https://jksb.v.zzu.edu.cn/vls6sss/zzjlogin3d.dll/getonemencode?p2p=${ptopid}`
//         const ocrUrl = `https://api.ocr.space/parse/imageurl?apikey=${OCR}&language=chs&url=${url}`
//
//         $.http.get(ocrUrl)
//             .then(res => {
//                 const ocrResult = JSON.parse(res.body)
//                 if (ocrResult.IsErroredOnProcessing) {
//                     $.log('OCR IsErroredOnProcessing\n' + ocrResult)
//                     reject(0)
//                 }
//                 let chars = ocrResult.ParsedResults[0].ParsedText.match(/[\u4e00-\u9fa5]/g);
//                 if (chars?.length !== 4) {
//                     $.log(chars)
//                     reject(0)
//                 }
//                 const map = {
//                     "零": "0",
//                     "壹": "1",
//                     "贰": "2",
//                     "叁": "3",
//                     "肆": "4",
//                     "伍": "5",
//                     "陆": "6",
//                     "柒": "7",
//                     "捌": "8",
//                     "玖": "9"
//                 }
//                 let code = ''
//                 chars.forEach(char => {
//                     if (map[char]) {
//                         code += map[char]
//                     }
//                 })
//                 if (code.length !== 4) {
//                     $.log(code)
//                     reject(0)
//                 }
//                 resolve(code)
//             }).catch(err => {
//             $.log(err)
//         })
//     })
// }

function submitForm(ptopid) {
    return new Promise((resolve, reject) => {
        const data = {
            // "myvs_94c": code,
            "myvs_1": "否",
            "myvs_2": "否",
            "myvs_3": "否",
            "myvs_4": "否",
            "myvs_5": "否",
            // "myvs_6": "否",
            "myvs_7": "否",
            "myvs_8": "否",
            // "myvs_9": "y",
            // "myvs_10": "否",
            "myvs_11": "否",
            "myvs_12": "否",
            "myvs_13": "否",
            // "myvs_14": "否",
            "myvs_15": "否",
            "myvs_13a": provinceCode,
            "myvs_13b": cityCode,
            "myvs_13c": currentLocation,
            "myvs_24": "否",
            "myvs_26": vaccinationState,
            "memo22": "成功获取",
            "did": "2",
            "door": "",
            "day6": "",
            "men6": "a",
            "sheng6": "",
            "shi6": "",
            'fun118': "0904",
            "fun3": "",
            "jingdu": longitude,
            "weidu": latitude,
            "ptopid": ptopid,
            "sid": ""
        }
        $.http.post({
            url: '/jksb',
            body: urlEncode(data)
        })
            .then(res => resolve(res.body))
            .catch(err => reject(err))
    })
}

function urlEncode(json) {
    return Object.keys(json).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    }).join('&');
}


// prettier-ignore
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s.openUrl=d),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}