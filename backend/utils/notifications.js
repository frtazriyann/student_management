const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[SMS Stub] To: ${to}, Message: ${message}`);
      return { success: true, stub: true };
    }
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const result = await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS Error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendWhatsApp = async (to, message) => {
  try {
    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      console.log(`[WhatsApp Stub] To: ${to}, Message: ${message}`);
      return { success: true, stub: true };
    }
    const fetch = globalThis.fetch;
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        }),
      }
    );
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('WhatsApp Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS, sendWhatsApp };
