import z from "zod"

export const getGroupsSchema = z.object({
    search: z.string().optional(),
    lastUpdateDate: z.coerce.date().optional(),
    sortBy: z.enum(['asc', 'desc']).optional().default('asc')
})

export const getGroupSchema = z.object({
    slug: z.coerce.number().int().positive(),
})