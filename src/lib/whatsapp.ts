import twilio from 'twilio';

// Use environment variables for Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_dummy_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'dummy_auth_token';
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number as default

const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to: string, messageBody: string) {
    // If no real credentials, simulate successful send for local testing
    if (process.env.NODE_ENV !== 'production' && accountSid.startsWith('AC_dummy')) {
        console.log(`\n===========================================`);
        console.log(`[WHATSAPP DEV MODE] Message simulated:`);
        console.log(`To: ${to}`);
        console.log(`Message: ${messageBody}`);
        console.log(`===========================================\n`);
        return { success: true, dummy: true };
    }

    try {
        const message = await client.messages.create({
            body: messageBody,
            from: fromWhatsAppNumber,
            // Twilio requires numbers to be prefixed with 'whatsapp:'
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
        });
        console.log(`WhatsApp message sent successfully: ${message.sid}`);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Failed to send WhatsApp message via Twilio:', error);
        return { success: false, error };
    }
}
