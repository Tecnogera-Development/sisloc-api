import z from "zod"

export const getProductsSchema = z.object({
    limit: z.coerce.number().min(1, "O limite mínimo deve ser 1").max(100, "O limite máximo deve ser 100").optional().default(5),
    page: z.coerce.number().min(1, "Página deve ser maior que 0").optional().default(1),
    search: z.string().optional(),
    lastUpdateDate: z.coerce.date().optional(),
    sortBy: z.enum(['asc', 'desc']).optional().default('asc')
})

export const getProductSchema = z.object({
    slug: z.coerce.number().int().positive(),
})

export const addProductSchema = z.object({
  nm_equipto: z.string().trim().min(1, "Campo não pode ser vazio").max(120, "Campo deve ter no máximo 120 caracteres"),
  vl_aqu_equipto: z.coerce.number(),
  cd_grupo: z.coerce.number().int(),
  cd_unidade: z.coerce.number().int(),

  dt_pav_equipto: z.coerce.date().optional().nullable(),
  dt_mov: z.coerce.date().optional().nullable(),
  us_mov: z.string().max(10).optional().nullable(),

  codigo: z.string().max(60).optional().nullable(),
  vl_indenizacao: z.coerce.number().optional().nullable(),
  cd_classfiscal: z.coerce.number().int().optional().nullable(),

  lad_ins_user: z.string().max(16).optional().nullable(),
  lad_upd_user: z.string().max(16).optional().nullable(),

  cd_programa: z.coerce.number().int().optional().nullable(),
  dt_inventario: z.coerce.date().optional().nullable(),
  cd_usuario_inv: z.coerce.number().int().optional().nullable(),

  cd_fieldgroup: z.coerce.number().int().optional().nullable(),
  cd_grupo_contabil: z.coerce.number().int().optional().nullable(),

  obs_componentes: z.string().optional().nullable(),
  codigo_erp: z.string().max(60).optional().nullable(),
  cd_fieldgroup_ckl: z.coerce.number().int().optional().nullable(),

  cd_oid: z.coerce.number().int().optional().nullable(),
  cd_usuario_alteracao: z.coerce.number().int().optional().nullable(),

  fl_origemalteracao_apv_equipto: z.string().max(1).optional(),
  cd_usuarioalteracao_apv_equipto: z.coerce.number().int().optional().nullable(),

  cd_tipoitem: z.coerce.number().int(),
});