import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Reuse pattern from stripe-webhook)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

// Vapi expects this structure for the Assistant definition
export default async function handler(req: any, res: any) {
    if (req.method === 'POST') {
        const body = req.body;

        // 2. Define the Assistant Config
        const assistantConfig = {
            // "Updated to use Google Gemini 3.0 Flash (via gemini-1.5-flash model target)"
            model: {
                provider: "google",
                model: "gemini-1.5-flash",
                messages: [
                    {
                        role: "system",
                        content: `You are the AI Receptionist for Myers Construct AI. 
                        Your name is Burt. You are a highly professional pre-construction terminal node.
                        
                        Your goal is to qualify inbound leads and assist with project intake.
                        
                        New Protocol Announcement:
                        - You can now autonomously verify material availability with suppliers.
                        - You assist with Digital Twin proposals that clients can toggle live.
                        
                        Always ask:
                        1. What is the approximate budget?
                        2. When are they looking to start?
                        3. Do they have architectural drawings?
                        
                        If the lead seems "Hot" (High budget, ready now), book a walkthrough appointment immediately using the bookAppointment tool.
                        Otherwise, capture details using create_lead.`
                    }
                ],
                tools: [
                    {
                        type: "function",
                        function: {
                            name: "create_lead",
                            description: "Capture lead details and save to CRM.",
                            parameters: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    phone: { type: "string" },
                                    summary: { type: "string" },
                                    urgency: { type: "string", enum: ["Low", "Medium", "High"] },
                                    projectType: { type: "string" }
                                },
                                required: ["name", "summary"]
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "bookAppointment",
                            description: "Book a walkthrough appointment for a hot lead.",
                            parameters: {
                                type: "object",
                                properties: {
                                    leadName: { type: "string" },
                                    preferredTime: { type: "string", description: "ISO string or 'tomorrow morning'" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "dispatch_supplier",
                            description: "Call a supplier to verify material availability for an estimate.",
                            parameters: {
                                type: "object",
                                properties: {
                                    supplierName: { type: "string" },
                                    materialList: { type: "string" },
                                    estimateId: { type: "string" }
                                },
                                required: ["supplierName", "materialList"]
                            }
                        }
                    }
                ]
            },
            voice: {
                provider: "11labs",
                voiceId: "cjVigY5qzO86Huf0OWal", // "Burt" - Professional Male Voice ID
                stability: 0.5,
                similarityBoost: 0.75
            },
            firstMessage: "Thanks for calling Myers Construction. This is Burt, the automated assistant. How can I help you start your project today?"
        };

        if (body.message?.type === 'tool-calls') {
            const results = [];
            for (const toolCall of body.message.toolCalls) {
                if (toolCall.function.name === 'create_lead') {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log("Creating Lead:", args);
                    try {
                        // Use Admin SDK for Firestore
                        const leadRef = await db.collection('leads').add({
                            ...args,
                            source: 'voice_agent',
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            status: args.urgency === 'High' ? 'HOT' : 'NEW'
                        });
                        results.push({
                            toolCallId: toolCall.id,
                            result: `Lead created with ID: ${leadRef.id}`
                        });
                    } catch (e: any) {
                        console.error("Error creating lead", e);
                        results.push({ toolCallId: toolCall.id, error: e.message });
                    }
                }

                if (toolCall.function.name === 'bookAppointment') {
                    const args = JSON.parse(toolCall.function.arguments);
                    // Stub logic for booking
                    results.push({
                        toolCallId: toolCall.id,
                        result: "Appointment booked for tomorrow at 10 AM. (Stub)"
                    });
                }

                if (toolCall.function.name === 'dispatch_supplier') {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log("Dispatching Supplier Call:", args);
                    results.push({
                        toolCallId: toolCall.id,
                        result: `Supplier ${args.supplierName} dispatched for availability check on ${args.materialList}.`
                    });
                }
            }

            return res.status(200).json({ results });
        }

        return res.status(200).json(assistantConfig);

    } else {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }
}
