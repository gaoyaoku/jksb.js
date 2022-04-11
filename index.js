/**
 * Used as tecent cloud serverless functions' entrypoint 
 */

exports.main_handler = async (event, context, callback) => {
    try {
        require("./node.js");
    } catch (e) {
        console.error(e)
    }
}


