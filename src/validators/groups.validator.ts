import z from "zod"

export const getGroupsSchema = z.object({
    search: z.string().optional(),
    lastUpdateDate: z.coerce.date().optional(),
    sortBy: z.enum(['asc', 'desc']).optional().default('asc')
})

export const getGroupSchema = z.object({
    slug: z.coerce.number().int().positive(),
})

export const putGroupsSchema = z.object({
    nm_grupo: z.string().min(1, "Nome do grupo é obrigatório").toUpperCase().optional(),
    fl_ativo: z.boolean().optional()
})