const { z } = require('zod');

const scrapeSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    location: z.string().min(1, 'Location is required'),
    limit: z.number().int().min(1).max(500).optional().default(10)
});

const websiteSchema = z.object({
    url: z.string().url('Must provide a valid URL')
});

const contactSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    link: z.string().optional().nullable(),
    savedAt: z.string().optional().nullable()
});

const searchHistorySchema = z.object({
    id: z.string().min(1, 'History ID is required'),
    category: z.string().min(1, 'Category is required'),
    location: z.string().min(1, 'Location is required'),
    count: z.number().int().min(0),
    timestamp: z.string()
});

const outreachSchema = z.object({
    type: z.enum(['cold_call', 'email', 'linkedin'], { errorMap: () => ({ message: 'Type must be cold_call, email, or linkedin' }) }),
    businessName: z.string().min(1, 'Business name is required'),
    industry: z.string().optional().default('General Business'),
    location: z.string().optional().default(''),
    website: z.string().optional().default(''),
    customContext: z.string().optional().default(''),
    tone: z.string().optional().default('professional'),
    goal: z.string().optional().default('connect')
});

module.exports = {
    scrapeSchema,
    websiteSchema,
    contactSchema,
    searchHistorySchema,
    outreachSchema
};
