const { getActiveWhatsappPhones } = require('./whatsappSubscriberStore');

function whatsappConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_TEMPLATE_NAME
  );
}

function stripHtml(message) {
  return String(message || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function makeTemplatePayload(phone, values) {
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG || 'az';
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const variableName = process.env.WHATSAPP_TEMPLATE_VARIABLE_NAME;
  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  if (templateName !== 'hello_world') {
    const bodyValues = values.length ? values : ['İqtisadi bildiriş'];
    payload.template.components = [
      {
        type: 'body',
        parameters: bodyValues.map(value => {
          const parameter = { type: 'text', text: String(value).slice(0, 900) };
          if (variableName) parameter.parameter_name = variableName;
          return parameter;
        }),
      },
    ];
  }

  return payload;
}

function messageToTemplateValues(message) {
  const text = stripHtml(message).replace(/\s+/g, ' ').slice(0, 900);
  return [text];
}

async function sendWhatsappTemplate(phone, values) {
  if (!whatsappConfigured()) {
    console.log(`[WhatsApp] API not configured. To=${phone} Values=${JSON.stringify(values)}`);
    return { ok: false, configured: false };
  }

  try {
    const resp = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makeTemplatePayload(phone, values)),
    });

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => '');
      throw new Error(`WhatsApp HTTP ${resp.status}: ${errorText.slice(0, 300)}`);
    }
    return { ok: true, configured: true };
  } catch (err) {
    console.error('[WhatsApp] Send error:', err.message);
    return { ok: false, configured: true, error: err.message };
  }
}

async function sendWhatsappMessage(phone, message) {
  return sendWhatsappTemplate(phone, messageToTemplateValues(message));
}

async function sendWhatsappBroadcast(message, phones = getActiveWhatsappPhones()) {
  const uniquePhones = [...new Set(phones.filter(Boolean))];
  if (!uniquePhones.length) return { ok: false, configured: whatsappConfigured() };

  const results = await Promise.all(uniquePhones.map(phone => sendWhatsappMessage(phone, message)));
  return {
    ok: results.some(result => result.ok),
    configured: results.some(result => result.configured),
    total: uniquePhones.length,
  };
}

module.exports = {
  messageToTemplateValues,
  sendWhatsappBroadcast,
  sendWhatsappMessage,
  sendWhatsappTemplate,
  whatsappConfigured,
};
