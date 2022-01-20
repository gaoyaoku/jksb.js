// node --tls-min-v1.0 jksb.js
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';

exports.main_handler = async (event, context, callback) => {
    try {
        // require("./jksb.js");
    } catch (e) {
        console.error(e)
    }
}


