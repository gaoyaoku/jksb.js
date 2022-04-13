/*
pushplus

http://www.pushplus.plus
PUSH_PLUS_TOKEN：一对一推送的Token
PUSH_PLUS_USER： 一对多推送的群组编码

*/
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';

const axios = require('axios')

function pushplus(title, content) {
    return new Promise((resolve, reject) => {
        if (PUSH_PLUS_TOKEN) {
            content = content.replace(/[\n\r]/g, '<br>')
            axios({
                method: 'post',
                url: 'https://www.pushplus.plus/send',
                data: {
                    token: `${PUSH_PLUS_TOKEN}`,
                    title: `${title}`,
                    content: `${content}`,
                    topic: `${PUSH_PLUS_USER}`,
                },
                headers: {
                    'Content-Type': ' application/json',
                },
                timeout: 10000
            })
                .then(res => {
                    if (res.data.code === 200) {
                        console.log(`pushplus发送通知成功！`)
                        resolve()
                    } else {
                        console.log('pushplus发送通知失败！\n' + res)
                        reject(res)
                    }
                })
                .catch(err => {
                    console.log('pushplus发送通知失败！\n' + err)
                    reject(err)
                })
        } else {
            console.log('发送失败，未填写PUSH_PLUS_TOKEN！')
            resolve();
        }
    });
}

module.exports = {
    pushplus
}