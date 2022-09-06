/*
=======================简介=======================
A JavaScript program for you to have a good sleep!
====================个人信息填写====================
*/
const username = '2019********';   // 用户名
const password = '******';   // 密码
const provinceCode = '**';   // 省代码
const cityCode = '****';   // 市代码
const currentLocation = '******';   // 当前所在地
const longitude = '***.******';   // 经度
const latitude = '**.******';   // 维度
const vaccinationState = 5;   // 疫苗接种情况 1：已接种第一针；2：已接种第二针；3：尚未接种；4：因禁忌症无法接种；5：已接种第三针；

const OCR = '*******'   // https://ocr.space API key 用于验证码识别

/*
=======================代码=======================
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
    let code = ''
    for (let i = 0; i < 5; i++) {
        code = await getCode(ptopid)
        if (code) {
            break
        }
    }
    if(!code) {
        $.notify("填报失败", "获取验证码失败！")
        return
    }
    const submitFormResult = await submitForm(ptopid, code)
    console.log(submitFormResult)
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
            "ptopid": ptopid,
            "sid": "",
        }
        $.http.post({
            url: '/jksb',
            body: urlEncode(data)
        })
            .then(res => resolve(res.body))
            .catch(err => reject(err))
    })
}

function getCode(ptopid) {
    return new Promise((resolve, reject) => {
        const url = `https://jksb.v.zzu.edu.cn/vls6sss/zzjlogin3d.dll/getonemencode?p2p=${ptopid}`
        const ocrUrl = `https://api.ocr.space/parse/imageurl?apikey=${OCR}&language=chs&url=${url}`

        $.http.get(ocrUrl)
            .then(res => {
                const ocrResult = JSON.parse(res.body)
                if (ocrResult.IsErroredOnProcessing) {
                    $.log('OCR IsErroredOnProcessing\n' + ocrResult)
                    reject(0)
                }
                let chars = ocrResult.ParsedResults[0].ParsedText.match(/[\u4e00-\u9fa5]/g);
                if (chars?.length !== 4) {
                    $.log(chars)
                    reject(0)
                }
                const map = {
                    "零": "0",
                    "壹": "1",
                    "贰": "2",
                    "叁": "3",
                    "肆": "4",
                    "伍": "5",
                    "陆": "6",
                    "柒": "7",
                    "捌": "8",
                    "玖": "9"
                }
                let code = ''
                chars.forEach(char => {
                    if (map[char]) {
                        code += map[char]
                    }
                })
                if (code.length !== 4) {
                    $.log(code)
                    reject(0)
                }
                resolve(code)
            }).catch(err => {
            $.log(err)
        })
    })
}

function submitForm(ptopid, code) {
    return new Promise((resolve, reject) => {
        const data = {
            "myvs_94c": code,
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



function ENV() {
    const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
    return {
        isQX: typeof $task !== "undefined",
        isLoon: typeof $loon !== "undefined",
        isSurge: typeof $httpClient !== "undefined" && typeof $utils !== "undefined",
        isBrowser: typeof document !== "undefined",
        isNode: typeof require == "function" && !isJSBox,
        isJSBox,
        isRequest: typeof $request !== "undefined",
        isScriptable: typeof importModule !== "undefined",
    };
}

function HTTP(defaultOptions = {
    baseURL: ""
}) {
    const {
        isQX,
        isLoon,
        isSurge,
        isScriptable,
        isNode,
        isBrowser
    } = ENV();
    const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
    const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

    function send(method, options) {
        options = typeof options === "string" ? {
            url: options
        } : options;
        const baseURL = defaultOptions.baseURL;
        if (baseURL && !URL_REGEX.test(options.url || "")) {
            options.url = baseURL ? baseURL + options.url : options.url;
        }
        if (options.body && options.headers && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
        options = {
            ...defaultOptions,
            ...options
        };
        const timeout = options.timeout;
        const events = {
            ...{
                onRequest: () => {
                },
                onResponse: (resp) => resp,
                onTimeout: () => {
                },
            },
            ...options.events,
        };

        events.onRequest(method, options);

        let worker;
        if (isQX) {
            worker = $task.fetch({
                method,
                ...options
            });
        } else if (isLoon || isSurge || isNode) {
            worker = new Promise((resolve, reject) => {
                const request = isNode ? require("request") : $httpClient;
                request[method.toLowerCase()](options, (err, response, body) => {
                    if (err) reject(err);
                    else
                        resolve({
                            statusCode: response.status || response.statusCode,
                            headers: response.headers,
                            body,
                        });
                });
            });
        } else if (isScriptable) {
            const request = new Request(options.url);
            request.method = method;
            request.headers = options.headers;
            request.body = options.body;
            worker = new Promise((resolve, reject) => {
                request
                    .loadString()
                    .then((body) => {
                        resolve({
                            statusCode: request.response.statusCode,
                            headers: request.response.headers,
                            body,
                        });
                    })
                    .catch((err) => reject(err));
            });
        } else if (isBrowser) {
            worker = new Promise((resolve, reject) => {
                fetch(options.url, {
                    method,
                    headers: options.headers,
                    body: options.body,
                })
                    .then(response => response.json())
                    .then(response => resolve({
                        statusCode: response.status,
                        headers: response.headers,
                        body: response.data,
                    })).catch(reject);
            });
        }

        let timeoutid;
        const timer = timeout ?
            new Promise((_, reject) => {
                timeoutid = setTimeout(() => {
                    events.onTimeout();
                    return reject(
                        `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
                    );
                }, timeout);
            }) :
            null;

        return (timer ?
                Promise.race([timer, worker]).then((res) => {
                    clearTimeout(timeoutid);
                    return res;
                }) :
                worker
        ).then((resp) => events.onResponse(resp));
    }

    const http = {};
    methods.forEach(
        (method) =>
            (http[method.toLowerCase()] = (options) => send(method, options))
    );
    return http;
}

function API(name = "untitled", debug = false) {
    const {
        isQX,
        isLoon,
        isSurge,
        isNode,
        isJSBox,
        isScriptable
    } = ENV();
    return new (class {
        constructor(name, debug) {
            this.name = name;
            this.debug = debug;

            this.http = HTTP();
            this.env = ENV();

            this.node = (() => {
                if (isNode) {
                    const fs = require("fs");

                    return {
                        fs,
                    };
                } else {
                    return null;
                }
            })();
            this.initCache();

            const delay = (t, v) =>
                new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, v), t);
                });

            Promise.prototype.delay = function (t) {
                return this.then(function (v) {
                    return delay(t, v);
                });
            };
        }

        // persistence
        // initialize cache
        initCache() {
            if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
            if (isLoon || isSurge)
                this.cache = JSON.parse($persistentStore.read(this.name) || "{}");

            if (isNode) {
                // create a json for root cache
                let fpath = "root.json";
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}), {
                            flag: "wx"
                        },
                        (err) => console.log(err)
                    );
                }
                this.root = {};

                // create a json file with the given name if not exists
                fpath = `${this.name}.json`;
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}), {
                            flag: "wx"
                        },
                        (err) => console.log(err)
                    );
                    this.cache = {};
                } else {
                    this.cache = JSON.parse(
                        this.node.fs.readFileSync(`${this.name}.json`)
                    );
                }
            }
        }

        // store cache
        persistCache() {
            const data = JSON.stringify(this.cache, null, 2);
            if (isQX) $prefs.setValueForKey(data, this.name);
            if (isLoon || isSurge) $persistentStore.write(data, this.name);
            if (isNode) {
                this.node.fs.writeFileSync(
                    `${this.name}.json`,
                    data, {
                        flag: "w"
                    },
                    (err) => console.log(err)
                );
                this.node.fs.writeFileSync(
                    "root.json",
                    JSON.stringify(this.root, null, 2), {
                        flag: "w"
                    },
                    (err) => console.log(err)
                );
            }
        }

        write(data, key) {
            this.log(`SET ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.write(data, key);
                }
                if (isQX) {
                    return $prefs.setValueForKey(data, key);
                }
                if (isNode) {
                    this.root[key] = data;
                }
            } else {
                this.cache[key] = data;
            }
            this.persistCache();
        }

        read(key) {
            this.log(`READ ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.read(key);
                }
                if (isQX) {
                    return $prefs.valueForKey(key);
                }
                if (isNode) {
                    return this.root[key];
                }
            } else {
                return this.cache[key];
            }
        }

        delete(key) {
            this.log(`DELETE ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.write(null, key);
                }
                if (isQX) {
                    return $prefs.removeValueForKey(key);
                }
                if (isNode) {
                    delete this.root[key];
                }
            } else {
                delete this.cache[key];
            }
            this.persistCache();
        }

        // notification
        notify(title, subtitle = "", content = "", options = {}) {
            const openURL = options["open-url"];
            const mediaURL = options["media-url"];

            if (isQX) $notify(title, subtitle, content, options);
            if (isSurge) {
                $notification.post(
                    title,
                    subtitle,
                    content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`, {
                        url: openURL,
                    }
                );
            }
            if (isLoon) {
                let opts = {};
                if (openURL) opts["openUrl"] = openURL;
                if (mediaURL) opts["mediaUrl"] = mediaURL;
                if (JSON.stringify(opts) === "{}") {
                    $notification.post(title, subtitle, content);
                } else {
                    $notification.post(title, subtitle, content, opts);
                }
            }
            if (isNode || isScriptable) {
                const content_ =
                    content +
                    (openURL ? `\n点击跳转: ${openURL}` : "") +
                    (mediaURL ? `\n多媒体: ${mediaURL}` : "");
                if (isJSBox) {
                    const push = require("push");
                    push.schedule({
                        title: title,
                        body: (subtitle ? subtitle + "\n" : "") + content_,
                    });
                } else {
                    console.log(`${title}\n${subtitle}\n${content_}\n\n`);
                }
            }
        }

        // other helper functions
        log(msg) {
            if (this.debug) console.log(`[${this.name}] LOG: ${this.stringify(msg)}`);
        }

        info(msg) {
            console.log(`[${this.name}] INFO: ${this.stringify(msg)}`);
        }

        error(msg) {
            console.log(`[${this.name}] ERROR: ${this.stringify(msg)}`);
        }

        wait(millisec) {
            return new Promise((resolve) => setTimeout(resolve, millisec));
        }

        done(value = {}) {
            if (isQX || isLoon || isSurge) {
                $done(value);
            } else if (isNode && !isJSBox) {
                if (typeof $context !== "undefined") {
                    $context.headers = value.headers;
                    $context.statusCode = value.statusCode;
                    $context.body = value.body;
                }
            }
        }

        stringify(obj_or_str) {
            if (typeof obj_or_str === 'string' || obj_or_str instanceof String)
                return obj_or_str;
            else
                try {
                    return JSON.stringify(obj_or_str, null, 2);
                } catch (err) {
                    return "[object Object]";
                }
        }
    })(name, debug);
}
