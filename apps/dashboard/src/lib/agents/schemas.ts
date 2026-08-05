import { z } from "zod";

export const DEFAULT_AGENT_MODEL = "llama3.1";
export const DEFAULT_AGENT_TEMPERATURE = 0.2;

export const DEFAULT_AGENT_SYSTEM_PROMPT = `You are a helpful customer support agent for this business.

Your goals:
- Answer customer questions clearly, accurately, and politely
- Use the provided knowledge base when available
- If you are unsure or the answer is not in your knowledge, say so honestly
- Offer to connect the customer with a human agent when needed

Style:
- Be concise, friendly, and professional
- Prefer short paragraphs and bullet points for clarity
- Never invent policies, pricing, or guarantees`;

export const createAgentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description must be at most 500 characters" })
    .optional(),
  systemPrompt: z
    .string()
    .trim()
    .max(10000, { message: "System prompt must be at most 10000 characters" })
    .optional(),
});

export type CreateAgentValues = z.infer<typeof createAgentSchema>;
