export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }

    try {
        const { to, message } = await req.json();

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return new Response(JSON.stringify({
                message: "Twilio configuration missing on server"
            }), { status: 500 });
        }

        // Twilio REST API URL
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        // Basic Auth for Twilio
        const auth = btoa(`${accountSid}:${authToken}`);

        const formData = new URLSearchParams();
        formData.append('To', to);
        formData.append('From', fromNumber);
        formData.append('Body', message);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Twilio Error:", data);
            return new Response(JSON.stringify({
                message: "Twilio API error",
                details: data.message
            }), { status: response.status });
        }

        return new Response(JSON.stringify({ success: true, sid: data.sid }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("SMS API Error:", error);
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
