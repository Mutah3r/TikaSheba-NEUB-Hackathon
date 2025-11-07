const axios = require('axios');

async function sendSms(number, message) {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;
  if (!apiKey || !senderId) {
    throw new Error('BulkSMSBD API configuration missing');
  }
  const url = 'http://bulksmsbd.net/api/smsapi';
  const params = new URLSearchParams({
    api_key: apiKey,
    type: 'text',
    number: number,
    senderid: senderId,
    message: message,
  });
  const fullUrl = `${url}?${params.toString()}`;
  const res = await axios.get(fullUrl, { timeout: 10000 });
  return res.data;
}

module.exports = { sendSms };