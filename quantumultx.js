/*
====================简介===========================
A JavaScript program for you to have a good sleep!

    This is a QuantumultX-only version.

=================个人信息填写=======================
*/
const username = '2019********';   //用户名
const password = '********';   //密码
const provinceCode = '41';   //省代码
const cityCode = '4101';   //市代码
const currentLocation = '郑州大学***';   //当前所在地
const longitude = '***.******';   //经度
const latitude = '***.******';   //维度
const vaccinationState = 5;   //疫苗接种情况。1：已接种第一针；2：已接种第二针；3：尚未接种；4：因禁忌症无法接种；5：已接种第三针；

(async () => {
    console.log("开始执行...")
    console.log('登录中...');
    const loginResult = await login()
    if (loginResult.indexOf('对不起') > -1) {
        const error = loginResult.match(/(对不起.*?)</)
        notify("登录失败", error[1] || loginResult)
        $done();
    }
    const [, ptopid] = loginResult.match(/ptopid=(.*?)&sid=(.*?)/)
    if (!ptopid) {
        notify("登录失败", loginResult)
        $done();
    }
    console.log('登录成功！');
    console.log('查看今天填报情况...');
    const getIndexResult = await getIndex(ptopid)
    if (/已经填报过了/.test(getIndexResult)) {
        notify("填报成功", "今天已经填报过了！")
        $done();
    }
    console.log('今天还未填报！');
    console.log('填报中...');
    let fun18 = getIndexResult.match(/name="fun18"\s+value="(.*?)"/)
    fun18 = parseInt(fun18[1])
    if (!fun18) {
        notify("填报失败", "平台验证失败！")
        $done();
    }
    await submitIndex(ptopid, fun18)
    const submitFormResult = await submitForm(ptopid, fun18)
    if (/感谢/.test(submitFormResult)) {
        notify("填报成功")
        $done();
    } else if (submitFormResult.indexOf('提交失败') > -1){
        const error = submitFormResult.match(/提交失败.*?<li>(.*?)<\/li>/)
        notify("填报失败", error[1] || error[0] || submitFormResult)
        $done();
    } else {
        notify("填报失败", submitFormResult)
        $done();
    }
})().catch(err => {
    notify("填报失败", err)
    $done();
}).finally(() => {
    $done();
})


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

function submitIndex(ptopid, fun18) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.append('did', 1);
        params.append('door', '');
        params.append('fun18', fun18);
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

function submitForm(ptopid, fun18) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams()
        params.append("myvs_1", "否")
        params.append("myvs_2", "否")
        params.append("myvs_3", "否")
        params.append("myvs_4", "否")
        params.append("myvs_5", "否")
        // params.append("myvs_6", "否")
        params.append("myvs_7", "否")
        params.append("myvs_8", "否")
        params.append("myvs_9", "y")
        // params.append("myvs_10", "否")
        params.append("myvs_11", "否")
        params.append("myvs_12", "否")
        params.append("myvs_13", "否")
        params.append("myvs_15", "否")
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
        params.append("fun18", fun18)
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

function notify(title, description = '') {
    console.log(title + '\n' + description)
    $notify(title, description);
}
