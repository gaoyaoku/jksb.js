/*
====================简介=====================
A JavaScript program for you to have a good sleep!

    This version is specifically for Nodejs.

=================个人信息填写=================
*/
const username = '2019********';   //用户名
const password = '********';   //密码
const provinceCode = '41';   //省代码
const cityCode = '4101';   //市代码
const currentLocation = '郑州大学***';   //当前所在地
const longitude = '***.******';   //经度
const latitude = '**.******';   //维度
const vaccinationState = 5;   //疫苗接种情况。1：已接种第一针；2：已接种第二针；3：尚未接种；4：因禁忌症无法接种；5：已接种第三针；


const axios = require('axios')
const querystring = require('querystring')
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';

axios.defaults.baseURL = 'https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';

(async () => {
    console.log('登录...');
    const loginResult = await login()
    if (loginResult.indexOf('对不起') > -1) {
        console.log('用户名或密码填写错误！');
        return
    }
    const [, ptopid] = loginResult.match(/ptopid=(.*?)&sid=/)
    if (!ptopid) {
        console.log('登录失败！');
        return
    }
    console.log('登录成功！');
    console.log('查看今天填报情况...');
    const getIndexResult = await getIndex(ptopid)
    if (/已经填报过了ba/.test(getIndexResult)) {
        console.log('今天已经填报过了');
        return
    }
    console.log('今天还未填报！');
    console.log('填报中...');
    const submitFormResult = await submitForm(ptopid)
    if(/感谢/.test(submitFormResult)) {
        console.log('填报成功！');
        
    } else {
        console.log('填报失败！');
        
    }
})()




function login() {
    return new Promise((reslove, reject) => {
        const data = {
            uid: username,
            upw: password
        }
        axios.post('/login', querystring.stringify(data))
            .then(res => reslove(res.data))
            .catch(err => reject(err))
    })
}

function getIndex(ptopid) {
    return new Promise((resolve, reject) => {
        axios.get('/jksb', {
            params: {
                ptopid: ptopid
            }
        })
            .then(res => resolve(res.data))
            .catch(err => {
                reject(err)
            })
    })
}

function submitForm(ptopid) {
    return new Promise((reslove, reject) => {
        const data = { 
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
            "myvs_13": "g", 
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
            "fun3": "", 
            "jingdu": longitude, 
            "weidu": latitude, 
            "ptopid": ptopid,
            "sid": ""
        }
        axios.post('/jksb', querystring.stringify(data))
            .then(res => reslove(res.data))
            .catch(err => reject(err))
    })
}