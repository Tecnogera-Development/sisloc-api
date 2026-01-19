import z from "zod"

export const getProductsSchema = z.object({
    limit: z.coerce.number().min(1, "O limite mínimo deve ser 1").max(100, "O limite máximo deve ser 100").optional().default(20),
    page: z.coerce.number().min(1, "Página deve ser maior que 0").optional().default(1),
    search: z.string().optional(),
    lastUpdateDate: z.coerce.date().optional()
})

export const getProductSchema = z.object({
    slug: z.coerce.number().int().positive(),
})