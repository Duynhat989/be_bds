const connect = require('./autoBank/acb/openConnectAndBox')
const payLoop = async () => {
    const EMAIL = process.env.PAYMENT_EMAIL
    const PASSWORD = process.env.PAYMENT_PAW
    // xin chào
    let NUM_EMAILS = 20;
    let LIMIT_DELAY = 100;
    connect.startChecking(EMAIL,PASSWORD,NUM_EMAILS,LIMIT_DELAY)
}
module.exports = {
    payLoop
}