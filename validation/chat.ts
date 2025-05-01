import { z } from "zod";

export const chatSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    created_by_account_id: z.string(),
    inserted_at: z.string(),
    updated_at: z.string(),
});

export type IChat = z.infer<typeof chatSchema>;