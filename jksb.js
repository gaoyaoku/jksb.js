/*
====================简介=====================
A JavaScript program for you to have a good sleep!
        Last modified time: 2021-8-20

     Created by GAOYAOKU on 2021-07-30
         Copyright © 2021 GAOYAOKU
            All rights reserved
         Email: gaoyaoku@gmail.com
=================个人信息填写=================
*/
let username = '2019********';   //用户名
let password = '********';   //密码
let provinceCode = '41';   //省代码
let cityCode = '4101';   //省代码
let currentLocation = '郑州大学***';   //当前实际所在地
let isReturn = '否';   //是否为当日返郑人员
let previousLocation = '';   //若是请填写返回前居住地和抵郑时间
let longitude = '***.******';   //经度
let latitude = '**.******';   //维度

let isPersistence = 1;   //是否持久化存储
/*
======================JS======================
*/
const $ = new Env('健康上报');
if (isPersistence) {
    username = $.getdata('username');
    password = $.getdata('password');
    provinceCode = $.getdata('provinceCode');
    cityCode = $.getdata('cityCode');
    currentLocation = $.getdata('currentLocation');
    isReturn = $.getdata('isReturn');
    previousLocation = $.getdata('previousLocation');
    longitude = $.getdata('longitude');
    latitude = $.getdata('latitude');
}
const notify = $.isNode() ? require("./sendNotify") : "";
let id;
!(async () => {
    for (let i=1; i<=3; i++) {
        id = await getId();
        if(id) {
            break;
        } else {
            console.log(`第${i}次登录失败！`);
            await $.wait(5000);
        }
    }
    if (!id){
        console.log("登录失败！")
        $.msg($.name, '', '登录失败！' + getDate());
        if ($.isNode()) {
            await notify.sendNotify(`${$.name}`, `登录失败！`);
        }
        return ;
    }
    
    await $.wait(getRandomInt(3000));
    let status = await isDone();

    if (!status[1]) {
        console.log("今天需要上传健康码！" + getDate());
        $.msg($.name, '', '今天需要上传健康码！' + getDate());
        if ($.isNode()) {
            await notify.sendNotify(`${$.name}`, `今天需要上传健康码！`);
        }
    } else {
        console.log("今天不需要上传健康码！" + getDate());
    }

    if (status[0]) {
        console.log("今天已完成填报！" + getDate());
        $.msg($.name, '', '今天已完成填报！' + getDate());
        if ($.isNode()) {
            await notify.sendNotify(`${$.name}`, `今天已完成填报！`);
        }
    } else {
        await $.wait(getRandomInt(3000));
        await postOverview();
        await $.wait(getRandomInt(3000));
        let flag = await postMain();
        if (flag) {
            console.log("填报成功！");
            $.msg($.name, '', '填报成功！' + getDate());
            if ($.isNode()) {
                await notify.sendNotify(`${$.name}`, `填报成功！`);
            }
        } else {
            console.log("填报失败！");
            $.msg($.name, '', '填报失败！' + getDate());
            if ($.isNode()) {
                await notify.sendNotify(`${$.name}`, `填报失败！`);
            }
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

function getId() {
    console.log("登录...");
    let urlLogin = {
        url: `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/login`,
        headers: {
            'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Origin': `https://jksb.v.zzu.edu.cn`,
            'Accept-Encoding': `gzip, deflate, br`,
            'Cookie': ``,
            'Content-Type': `application/x-www-form-urlencoded`,
            'Host': `jksb.v.zzu.edu.cn`,
            'Connection': `keep-alive`,
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1`,
            'Referer': `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/first0?fun2=&door=`,
            'Accept-Language': `zh-CN,zh-Hans;q=0.9`
        },
        body: `uid=${username}&upw=${password}&smbtn=%E8%BF%9B%E5%85%A5%E5%81%A5%E5%BA%B7%E7%8A%B6%E5%86%B5%E4%B8%8A%E6%8A%A5%E5%B9%B3%E5%8F%B0&hh28=`
    }
    return new Promise(resolve => {
        $.post(urlLogin, (err, resp, data) => {
            let result;
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    //console.log(data);
                    const re = /ptopid=(.*?)&sid=(.*?)"/g;
                    const reUserName = /未检索到用户账号/;
                    const rePassWord = /密码输入错误/;

                    result = re.exec(data);
                    if (result) {
                        console.log("登录成功！");
                    } else if (reUserName.test(data)) {
                        console.log("用户名输入错误！");
                    } else if (rePassWord.test(data)){
                        console.log("密码输入错误！");
                    } else {
                        console.log("登录时发生错误！");
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(result);
            }
        })
    })
}

function isDone() {
    console.log("判断是否完成填报和是否需要上传健康码...")
    let urlOverviewLogin = {
        url: `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb?ptopid=${id[1]}&sid=${id[2]}&fun2=`,
        headers: {
            'Cookie': ``,
            'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Connection': `keep-alive`,
            'Referer': `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/first6?ptopid=${id[1]}&sid=${id[2]}`,
            'Accept-Encoding': `gzip, deflate, br`,
            'Host': `jksb.v.zzu.edu.cn`,
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1`,
            'Accept-Language': `zh-CN,zh-Hans;q=0.9`
        }
    }
    return new Promise(resolve => {
        $.get(urlOverviewLogin, (err, resp, data) => {
            let result = [];
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    //console.log(resp.body);
                    const reIsDone = /已经填报过了/;
                    const reIsUpload = /已经上传过了/;
                    result[0] = reIsDone.test(data);
                    result[1] = reIsUpload.test(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(result);
            }
        })
    })
}

function postOverview() {
    console.log("post overview界面,进入主界面...");
    let urlOverview = {
        url: `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb`,
        headers: {
            'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Origin': `https://jksb.v.zzu.edu.cn`,
            'Accept-Encoding': `gzip, deflate, br`,
            'Cookie': ``,
            'Content-Type': `application/x-www-form-urlencoded`,
            'Host': `jksb.v.zzu.edu.cn`,
            'Connection': `keep-alive`,
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1`,
            'Referer': `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb?ptopid=${id[1]}&sid=${id[2]}&fun2=`,
            'Accept-Language': `zh-CN,zh-Hans;q=0.9`
        },
        body: `day6=b&did=1&door=&men6=a&ptopid=${id[1]}&sid=${id[2]}`
    }
    return new Promise(resolve => {
        $.post(urlOverview, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    console.log("成功进入主界面！");
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function postMain() {
    console.log("post Main界面,进入结果界面...");
    let urlMain = {
        url: `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb`,
        headers: {
            'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Origin': `https://jksb.v.zzu.edu.cn`,
            'Accept-Encoding': `gzip, deflate, br`,
            'Cookie': ``,
            'Content-Type': `application/x-www-form-urlencoded`,
            'Host': `jksb.v.zzu.edu.cn`,
            'Connection': `keep-alive`,
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1`,
            'Referer': `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb`,
            'Accept-Language': `zh-CN,zh-Hans;q=0.9`
        },
        body: parseParams()
    }
    return new Promise(resolve => {
        $.post(urlMain, (err, resp, data) => {
            let result;
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    console.log("成功进入主界面！");
                    const re = /感谢/;
                    result = re.test(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(result);
            }
        })
    })
}

function parseParams() {
    let data = {
        "myvs_1": "否",
        "myvs_2": "否",
        "myvs_3": "否",
        "myvs_4": "否",
        "myvs_5": "否",
        "myvs_6": "否",
        "myvs_7": "否",
        "myvs_8": "否",
        "myvs_9": "否",
        "myvs_10": "否",
        "myvs_11": "否",
        "myvs_12": "否",
        "myvs_13a": provinceCode,
        "myvs_13b": cityCode,
        "myvs_13c": currentLocation,
        "myvs_14": isReturn,
        "myvs_14b": previousLocation,
        "memo22": "成功获取",
        "did": "2",
        "door": "",
        "day6": "b",
        "men6": "a",
        "sheng6": "",
        "shi6": "",
        "fun3": "",
        "jingdu": longitude,
        "weidu": latitude,
        "ptopid": id[1],
        "sid": id[2]
    };
    try {
        let tempArr = [];
        for (let i in data) {
            let key = encodeURIComponent(i);
            let value = encodeURIComponent(data[i]);
            tempArr.push(key + '=' + value);
        }
        let urlParamsStr = tempArr.join('&');
        return urlParamsStr;
    } catch (err) {
        return '';
    }
}

function getDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 1 && day <= 9) {
        day = "0" + day;
    }
    if (hh >= 0 && hh <= 9) {
        hh = "0" + hh;
    }
    if (mm >= 0 && mm <= 9) {
        mm = "0" + mm;
    }
    if (ss >= 0 && ss <= 9) {
        ss = "0" + ss;
    }
    return year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function Env(t, e) {

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔 ${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "📣 ${this.name}, 通知:"];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `⚠️ ${this.name}, 错误!`, t.stack) : this.log("", `⚠️ ${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔 ${this.name}, 结束!\n⏰ 用时 ${s} 秒!`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}