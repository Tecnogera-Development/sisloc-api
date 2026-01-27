import z from "zod"

export const getGroupsSchema = z.object({
    search: z.string().optional(),
    lastUpdateDate: z.coerce.date().optional(),
    sortBy: z.enum(['asc', 'desc']).optional().default('asc')
})

export const getGroupSchema = z.object({
    slug: z.coerce.number().int().positive(),
})

export const postGroupSchema = z.object({
    nm_grupo: z.string().min(1, "Nome do grupo é obrigatório").toUpperCase(),
    fl_exibirfatura: z.boolean().optional().default(true),
    fl_equipto_pesado: z.boolean().optional().default(false),
    fl_desconsiderar_incid_seguro: z.boolean().optional().default(false),
    fl_ativo: z.boolean("fl_ativo é obrigatório.").optional().default(true)
})

export const putGroupsSchema = z.object({
    nm_grupo: z.string().min(1, "Nome do grupo deve ter pelo menos 1 caractere.").toUpperCase().optional(),
    fl_exibirfatura: z.boolean().optional(),
    fl_equipto_pesado: z.boolean().optional(),
    fl_desconsiderar_incid_seguro: z.boolean().optional(),
    fl_ativo: z.boolean().optional()
})