/*
====================简介=====================
A JavaScript program for you to have a good sleep!
        Last modified time: 2021-9-7

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
let longitude = '***.******';   //经度
let latitude = '**.******';   //维度

let isPersistence = 0;   //是否持久化存储
/*
======================JS======================
*/
const $ = new Env('健康上报');
if ($.getdata('isPersistence') || isPersistence) {
    username = $.getdata('username');
    password = $.getdata('password');
    provinceCode = $.getdata('provinceCode');
    cityCode = $.getdata('cityCode');
    currentLocation = $.getdata('currentLocation');
    longitude = $.getdata('longitude');
    latitude = $.getdata('latitude');
}
const notify = $.isNode() ? require("./notify").notify : "";

!(async () => {
    for (let i=1; i<=3; i++) {
        $.id = await getId();
        if($.id) {
            break;
        } else {
            console.log(`第${i}次登录失败！`);
            if(i === 3) {
                console.log("登录失败！");
                await message('登录失败！');
                return ;
            }
            await $.wait(10000);
        }
    }
    
    await $.wait(getRandomInt(5000));
    let status = await isDone();

    if (!status[1]) {
        console.log("今天需要上传健康码！");
        await message("今天需要上传健康码！");
    } else {
        console.log("今天不需要上传健康码！");
    }

    if (status[0]) {
        console.log("今天已完成填报！");
        await message("今天已完成填报！");
    } else {
        await $.wait(getRandomInt(5000));
        await postOverview();
        await $.wait(getRandomInt(5000));

        for(let i = 1; i <= 3; i++) {
            $.flag = await postMain();
            if($.flag) {
                console.log("填报成功！");
                await message("填报成功！");
                return ;
            } else {
                console.log(`第${i}次填报失败！`);
                if(i === 3) {
                    console.log("填报失败！");
                    await message("填报失败！");
                    return ;
                }
                await $.wait(10000)
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
        url: `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb?ptopid=${$.id[1]}&sid=${$.id[2]}&fun2=`,
        headers: {
            'Cookie': ``,
            'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Connection': `keep-alive`,
            'Referer': `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/first6?ptopid=${$.id[1]}&sid=${$.id[2]}`,
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
    console.log("Post Overview界面,进入主界面...");
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
            'Referer': `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb?ptopid=${$.id[1]}&sid=${$.id[2]}&fun2=`,
            'Accept-Language': `zh-CN,zh-Hans;q=0.9`
        },
        body: `day6=b&did=1&door=&men6=a&ptopid=${$.id[1]}&sid=${$.id[2]}`
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
    console.log("Post Main界面,进入结果界面...");
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
                    console.log("成功进入结果界面！");
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
        "myvs_13":  "g",
        "myvs_13a": provinceCode,
        "myvs_13b": cityCode,
        "myvs_13c": currentLocation,
        "myvs_24": '否',
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
        "ptopid": $.id[1],
        "sid": $.id[2]
    };
    try {
        let array = [];
        for (let i in data) {
            let key = encodeURIComponent(i);
            let value = encodeURIComponent(data[i]);
            array.push(key + '=' + value);
        }
        return array.join('&');
    } catch (err) {
        console.log("bodyEncode发生错误！");
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

async function message(description) {
    $.msg($.name, '', description + getDate());
    if ($.isNode()) {
        await notify(`${$.name}`, description);
    }
}

function Env(name, opts) {
    class Http {
      constructor(env) {
        this.env = env
      }
  
      send(opts, method = 'GET') {
        opts = typeof opts === 'string' ? { url: opts } : opts
        let sender = this.get
        if (method === 'POST') {
          sender = this.post
        }
        return new Promise((resolve, reject) => {
          sender.call(this, opts, (err, resp, body) => {
            if (err) reject(err)
            else resolve(resp)
          })
        })
      }
  
      get(opts) {
        return this.send.call(this.env, opts)
      }
  
      post(opts) {
        return this.send.call(this.env, opts, 'POST')
      }
    }
  
    return new (class {
      constructor(name, opts) {
        this.name = name
        this.http = new Http(this)
        this.data = null
        this.dataFile = 'box.dat'
        this.logs = []
        this.isMute = false
        this.isNeedRewrite = false
        this.logSeparator = '\n'
        this.encoding = 'utf-8'
        this.startTime = new Date().getTime()
        Object.assign(this, opts)
        this.log('', `🔔${this.name}, 开始!`)
      }
  
      isNode() {
        return 'undefined' !== typeof module && !!module.exports
      }
  
      isQuanX() {
        return 'undefined' !== typeof $task
      }
  
      isSurge() {
        return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
      }
  
      isLoon() {
        return 'undefined' !== typeof $loon
      }
  
      isShadowrocket() {
        return 'undefined' !== typeof $rocket
      }
  
      toObj(str, defaultValue = null) {
        try {
          return JSON.parse(str)
        } catch {
          return defaultValue
        }
      }
  
      toStr(obj, defaultValue = null) {
        try {
          return JSON.stringify(obj)
        } catch {
          return defaultValue
        }
      }
  
      getjson(key, defaultValue) {
        let json = defaultValue
        const val = this.getdata(key)
        if (val) {
          try {
            json = JSON.parse(this.getdata(key))
          } catch { }
        }
        return json
      }
  
      setjson(val, key) {
        try {
          return this.setdata(JSON.stringify(val), key)
        } catch {
          return false
        }
      }
  
      getScript(url) {
        return new Promise((resolve) => {
          this.get({ url }, (err, resp, body) => resolve(body))
        })
      }
  
      runScript(script, runOpts) {
        return new Promise((resolve) => {
          let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
          httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
          let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
          httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
          httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
          const [key, addr] = httpapi.split('@')
          const opts = {
            url: `http://${addr}/v1/scripting/evaluate`,
            body: { script_text: script, mock_type: 'cron', timeout: httpapi_timeout },
            headers: { 'X-Key': key, 'Accept': '*/*' }
          }
          this.post(opts, (err, resp, body) => resolve(body))
        }).catch((e) => this.logErr(e))
      }
  
      loaddata() {
        if (this.isNode()) {
          this.fs = this.fs ? this.fs : require('fs')
          this.path = this.path ? this.path : require('path')
          const curDirDataFilePath = this.path.resolve(this.dataFile)
          const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
          const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
          const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
          if (isCurDirDataFile || isRootDirDataFile) {
            const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
            try {
              return JSON.parse(this.fs.readFileSync(datPath))
            } catch (e) {
              return {}
            }
          } else return {}
        } else return {}
      }
  
      writedata() {
        if (this.isNode()) {
          this.fs = this.fs ? this.fs : require('fs')
          this.path = this.path ? this.path : require('path')
          const curDirDataFilePath = this.path.resolve(this.dataFile)
          const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
          const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
          const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
          const jsondata = JSON.stringify(this.data)
          if (isCurDirDataFile) {
            this.fs.writeFileSync(curDirDataFilePath, jsondata)
          } else if (isRootDirDataFile) {
            this.fs.writeFileSync(rootDirDataFilePath, jsondata)
          } else {
            this.fs.writeFileSync(curDirDataFilePath, jsondata)
          }
        }
      }
  
      lodash_get(source, path, defaultValue = undefined) {
        const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
        let result = source
        for (const p of paths) {
          result = Object(result)[p]
          if (result === undefined) {
            return defaultValue
          }
        }
        return result
      }
  
      lodash_set(obj, path, value) {
        if (Object(obj) !== obj) return obj
        if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
        path
          .slice(0, -1)
          .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
          path[path.length - 1]
        ] = value
        return obj
      }
  
      getdata(key) {
        let val = this.getval(key)
        // 如果以 @
        if (/^@/.test(key)) {
          const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
          const objval = objkey ? this.getval(objkey) : ''
          if (objval) {
            try {
              const objedval = JSON.parse(objval)
              val = objedval ? this.lodash_get(objedval, paths, '') : val
            } catch (e) {
              val = ''
            }
          }
        }
        return val
      }
  
      setdata(val, key) {
        let issuc = false
        if (/^@/.test(key)) {
          const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
          const objdat = this.getval(objkey)
          const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
          try {
            const objedval = JSON.parse(objval)
            this.lodash_set(objedval, paths, val)
            issuc = this.setval(JSON.stringify(objedval), objkey)
          } catch (e) {
            const objedval = {}
            this.lodash_set(objedval, paths, val)
            issuc = this.setval(JSON.stringify(objedval), objkey)
          }
        } else {
          issuc = this.setval(val, key)
        }
        return issuc
      }
  
      getval(key) {
        if (this.isSurge() || this.isLoon()) {
          return $persistentStore.read(key)
        } else if (this.isQuanX()) {
          return $prefs.valueForKey(key)
        } else if (this.isNode()) {
          this.data = this.loaddata()
          return this.data[key]
        } else {
          return (this.data && this.data[key]) || null
        }
      }
  
      setval(val, key) {
        if (this.isSurge() || this.isLoon()) {
          return $persistentStore.write(val, key)
        } else if (this.isQuanX()) {
          return $prefs.setValueForKey(val, key)
        } else if (this.isNode()) {
          this.data = this.loaddata()
          this.data[key] = val
          this.writedata()
          return true
        } else {
          return (this.data && this.data[key]) || null
        }
      }
  
      initGotEnv(opts) {
        this.got = this.got ? this.got : require('got')
        this.cktough = this.cktough ? this.cktough : require('tough-cookie')
        this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
        if (opts) {
          opts.headers = opts.headers ? opts.headers : {}
          if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
            opts.cookieJar = this.ckjar
          }
        }
      }
  
      get(opts, callback = () => { }) {
        if (opts.headers) {
          delete opts.headers['Content-Type']
          delete opts.headers['Content-Length']
        }
        if (this.isSurge() || this.isLoon()) {
          if (this.isSurge() && this.isNeedRewrite) {
            opts.headers = opts.headers || {}
            Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
          }
          $httpClient.get(opts, (err, resp, body) => {
            if (!err && resp) {
              resp.body = body
              resp.statusCode = resp.status
            }
            callback(err, resp, body)
          })
        } else if (this.isQuanX()) {
          if (this.isNeedRewrite) {
            opts.opts = opts.opts || {}
            Object.assign(opts.opts, { hints: false })
          }
          $task.fetch(opts).then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp
              callback(null, { status, statusCode, headers, body }, body)
            },
            (err) => callback(err)
          )
        } else if (this.isNode()) {
          let iconv = require('iconv-lite')
          this.initGotEnv(opts)
          this.got(opts)
            .on('redirect', (resp, nextOpts) => {
              try {
                if (resp.headers['set-cookie']) {
                  const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                  if (ck) {
                    this.ckjar.setCookieSync(ck, null)
                  }
                  nextOpts.cookieJar = this.ckjar
                }
              } catch (e) {
                this.logErr(e)
              }
              // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
            })
            .then(
              (resp) => {
                const { statusCode: status, statusCode, headers, rawBody } = resp
                callback(null, { status, statusCode, headers, rawBody }, iconv.decode(rawBody, this.encoding))
              },
              (err) => {
                const { message: error, response: resp } = err
                callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
              }
            )
        }
      }
  
      post(opts, callback = () => { }) {
        const method = opts.method ? opts.method.toLocaleLowerCase() : 'post'
        // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
        if (opts.body && opts.headers && !opts.headers['Content-Type']) {
          opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
        if (opts.headers) delete opts.headers['Content-Length']
        if (this.isSurge() || this.isLoon()) {
          if (this.isSurge() && this.isNeedRewrite) {
            opts.headers = opts.headers || {}
            Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
          }
          $httpClient[method](opts, (err, resp, body) => {
            if (!err && resp) {
              resp.body = body
              resp.statusCode = resp.status
            }
            callback(err, resp, body)
          })
        } else if (this.isQuanX()) {
          opts.method = method
          if (this.isNeedRewrite) {
            opts.opts = opts.opts || {}
            Object.assign(opts.opts, { hints: false })
          }
          $task.fetch(opts).then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp
              callback(null, { status, statusCode, headers, body }, body)
            },
            (err) => callback(err)
          )
        } else if (this.isNode()) {
          let iconv = require('iconv-lite')
          this.initGotEnv(opts)
          const { url, ..._opts } = opts
          this.got[method](url, _opts).then(
            (resp) => {
              const { statusCode: status, statusCode, headers, rawBody } = resp
              callback(null, { status, statusCode, headers, rawBody }, iconv.decode(rawBody, this.encoding))
            },
            (err) => {
              const { message: error, response: resp } = err
              callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
            }
          )
        }
      }
      /**
       *
       * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
       *    :$.time('yyyyMMddHHmmssS')
       *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
       *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
       * @param {string} fmt 格式化参数
       * @param {number} 可选: 根据指定时间戳返回格式化日期
       *
       */
      time(fmt, ts = null) {
        const date = ts ? new Date(ts) : new Date()
        let o = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'H+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds(),
          'q+': Math.floor((date.getMonth() + 3) / 3),
          'S': date.getMilliseconds()
        }
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (let k in o)
          if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
        return fmt
      }
  
      /**
       * 系统通知
       *
       * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
       *
       * 示例:
       * $.msg(title, subt, desc, 'twitter://')
       * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
       * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
       *
       * @param {*} title 标题
       * @param {*} subt 副标题
       * @param {*} desc 通知详情
       * @param {*} opts 通知参数
       *
       */
      msg(title = name, subt = '', desc = '', opts) {
        const toEnvOpts = (rawopts) => {
          if (!rawopts) return rawopts
          if (typeof rawopts === 'string') {
            if (this.isLoon()) return rawopts
            else if (this.isQuanX()) return { 'open-url': rawopts }
            else if (this.isSurge()) return { url: rawopts }
            else return undefined
          } else if (typeof rawopts === 'object') {
            if (this.isLoon()) {
              let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
              let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
              return { openUrl, mediaUrl }
            } else if (this.isQuanX()) {
              let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
              let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
              return { 'open-url': openUrl, 'media-url': mediaUrl }
            } else if (this.isSurge()) {
              let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
              return { url: openUrl }
            }
          } else {
            return undefined
          }
        }
        if (!this.isMute) {
          if (this.isSurge() || this.isLoon()) {
            $notification.post(title, subt, desc, toEnvOpts(opts))
          } else if (this.isQuanX()) {
            $notify(title, subt, desc, toEnvOpts(opts))
          }
        }
        if (!this.isMuteLog) {
          let logs = ['', `📣${this.name}, 通知!`]
          logs.push('---')
          logs.push(title)
          subt ? logs.push(subt) : ''
          desc ? logs.push(desc) : ''
          logs.push('---')
          console.log(logs.join('\n'))
          this.logs = this.logs.concat(logs)
        }
      }
  
      log(...logs) {
        if (logs.length > 0) {
          this.logs = [...this.logs, ...logs]
        }
        console.log(logs.join(this.logSeparator))
      }
  
      logErr(err, msg) {
        const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
        if (!isPrintSack) {
          this.log('', `⚠️${this.name}, 错误!`, err)
        } else {
          this.log('', `⚠️${this.name}, 错误!`, err.stack)
        }
      }
  
      wait(time) {
        return new Promise((resolve) => setTimeout(resolve, time))
      }
  
      done(val = {}) {
        const endTime = new Date().getTime()
        const costTime = (endTime - this.startTime) / 1000
        this.log('', `🔔${this.name}, 结束!`)
        this.log('', `⏱${this.name}, ${costTime} 秒!`)
        if (this.isSurge() || this.isQuanX() || this.isLoon()) {
          $done(val)
        }
      }
    })(name, opts)
  }