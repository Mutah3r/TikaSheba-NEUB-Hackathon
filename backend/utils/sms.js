const axios = require('axios');

async function sendSms(number, message) {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;
  if (!apiKey || !senderId) {
    throw new Error('BulkSMSBD API configuration missing');
  }
  const url = 'http://bulksmsbd.net/api/smsapi';
  // POST body (no query params). Supports single or comma-separated numbers.
  const body = new URLSearchParams({
    api_key: apiKey,
    senderid: senderId,
    number: number,
    message: message,
  });
  const res = await axios.post(url, body.toString(), {
    timeout: 10000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  console.log(res.data)
  return res.data;
}

module.exports = { sendSms };