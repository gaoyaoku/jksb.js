/*
====================简介=====================
A JavaScript program for you to have a good sleep!

  This version is specifically for Quantumult X.

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

(async () => {
    console.log('登录...');
    const loginResult = await login()
    if (loginResult.indexOf('对不起') > -1) {
        console.log('用户名或密码填写错误！');
        $notify("登录失败", "用户名或密码填写错误！");
        $done();
    }    
    const [, ptopid] = loginResult.match(/ptopid=(.*?)&sid=/)
    if (!ptopid) {
        console.log('登录失败！');
        $notify("失败", "登录失败！");
        $done();
    }
    console.log('登录成功！');
    console.log('查看今天填报情况...');
    const getIndexResult = await getIndex(ptopid)
    if (/已经填报过了/.test(getIndexResult)) {
        console.log('今天已经填报过了！');
        $notify("成功", '今天已经填报过了！');
        $done();
    }
    console.log('今天还未填报！');
    console.log('填报中...');
    // 可能是虽然显示填报成功了，但没有打卡记录的原因
    await submitIndex(ptopid)
    const submitFormResult = await submitForm(ptopid)
    if (/感谢/.test(submitFormResult)) {
        console.log('填报成功！');
        $notify("成功", '填报成功！');
        $done();
    } else {
        console.log('填报失败！');
        $notify("失败", '填报失败！');
        $done();
    }

})()


function login() {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.append('uid', username);
        params.append('upw', password);

        const myRequest = {
            url: "https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/login",
            method: "POST",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        };

        $task.fetch(myRequest).then(response => {
            resolve(response.body)
        }, reason => {
            reject(reason.error)
        });
    })
}

function getIndex(ptopid) {
    return new Promise((resolve, reject) => {
        const myRequest = {
            url: `https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb?ptopid=${ptopid}`,
            method: "GET",
        };

        $task.fetch(myRequest).then(response => {
            resolve(response.body)
        }, reason => {
            reject(reason.error)
        });
    })
}

function submitIndex(ptopid) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.append('did', 1);
        params.append('door', '');
        params.append('men6', 'a');
        params.append("ptopid", ptopid)
        params.append("sid", "")

        const myRequest = {
            url: "https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb",
            method: "POST",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        };

        $task.fetch(myRequest).then(response => {
            resolve(response.body)
        }, reason => {
            reject(reason.error)
        });
    })
}

function submitForm(ptopid) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams()
        params.append("myvs_1", "否")
        params.append("myvs_2", "否")
        params.append("myvs_3", "否")
        params.append("myvs_4", "否")
        params.append("myvs_5", "否")
        params.append("myvs_6", "否")
        params.append("myvs_7", "否")
        params.append("myvs_8", "否")
        params.append("myvs_9", "否")
        params.append("myvs_10", "否") 
        params.append("myvs_11", "否") 
        params.append("myvs_12", "否") 
        params.append("myvs_13", "g") 
        params.append("myvs_13a", provinceCode)
        params.append("myvs_13b", cityCode)
        params.append("myvs_13c", currentLocation)
        params.append("myvs_24", "否")
        params.append("myvs_26", vaccinationState)
        params.append("memo22", "成功获取")
        params.append("did", "2")
        params.append("door", "") 
        params.append("day6", "") 
        params.append("men6", "a") 
        params.append("sheng6", "")
        params.append("shi6", "") 
        params.append("fun3", "") 
        params.append("jingdu", longitude) 
        params.append("weidu", latitude) 
        params.append("ptopid", ptopid)
        params.append("sid", "")

        const myRequest = {
            url: "https://jksb.v.zzu.edu.cn/vls6sss/zzujksb.dll/jksb",
            method: "POST",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        };

        $task.fetch(myRequest).then(response => {
            resolve(response.body)
        }, reason => {
            reject(reason.error)
        });
    })
    
}