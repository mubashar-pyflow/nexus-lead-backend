const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
};

const SYSTEM_PROMPTS = {
    cold_call: `You are an elite B2B sales strategist. Generate a professional cold call script. 
The script MUST include:
- A confident opening hook (first 10 seconds are critical)  
- A value proposition tied to the prospect's industry
- 2-3 discovery questions to uncover pain points
- A natural objection handling block
- A clear call-to-action close
Format it with clear sections using **bold headers**. Keep it conversational, not robotic. 
The total length should be roughly 200-300 words.`,

    email: `You are a world-class cold email copywriter. Generate a high-converting cold outreach email.
The email MUST include:
- A subject line that gets >40% open rates (personalized, curiosity-driven)
- A compelling first line referencing the prospect specifically (no generic intros)
- A concise value proposition (2-3 sentences max)
- Social proof or a specific result/stat
- A low-friction CTA (no "book a 30 min call" — something easier)
Format: Subject Line first, then the email body. Keep it under 150 words. No fluff.`,

    linkedin: `You are a LinkedIn outreach specialist. Generate a LinkedIn connection message and a follow-up.
Rules:
- Connection request message must be under 300 characters (LinkedIn limit)
- Follow-up message should be 50-100 words, sent 2-3 days after connection
- Tone: professional but human, not salesy
- Reference something specific about their business
- End with a soft question, not a hard pitch
Format: First the "Connection Request" then the "Follow-Up Message" clearly separated.`
};

exports.generateOutreach = async (req, res) => {
    const { type, businessName, industry, location, website, customContext, tone, goal } = req.body;

    if (!SYSTEM_PROMPTS[type]) {
        return res.status(400).json({ success: false, error: 'Invalid outreach type. Use: cold_call, email, or linkedin' });
    }

    try {
        const model = getModel();

        const userPrompt = `Generate outreach for this prospect:
- Business Name: ${businessName || 'Unknown'}
- Industry: ${industry || 'General Business'}
- Location: ${location || 'Not specified'}
- Website: ${website || 'None'}
- Required Tone: ${tone}
- Ultimate Goal / Call to Action: ${goal}
${customContext ? `- Additional Context: ${customContext}` : ''}

Generate the ${type.replace('_', ' ')} now.`;

        const combinedPrompt = SYSTEM_PROMPTS[type] + '\n\n' + userPrompt;
        const result = await model.generateContent(combinedPrompt);

        const response = result.response;
        const text = response.text();

        res.json({ success: true, data: { content: text, type } });
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate AI content' 
        });
    }
};
