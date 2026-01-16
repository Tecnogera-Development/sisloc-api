import { db } from "../db/connection";

type GetProductsParams = {
  page: number;
  limit: number;
  search?: string;
  lastUpdateDate?: string;
};

export const getProducts = async ({
  page,
  limit,
  search,
  lastUpdateDate,
}: GetProductsParams) => {
  const offset = (page - 1) * limit;

  let whereConditions: string[] = [];
  const params: Record<string, any> = {};

  if (search) {
    whereConditions.push("nm_equipto LIKE @search");
    params.search = `${search}%`;
  }

  if (lastUpdateDate) {
    whereConditions.push("lad_upd_date >= @lastUpdateDate");
    params.lastUpdateDate = lastUpdateDate;
  }

  const whereClause =
    whereConditions.length > 0
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

  const result = await db
    .request()
    .input("search", params.search)
    .input("lastUpdateDate", params.lastUpdateDate)
    .query(`
      SELECT
        cd_equipto,
        nm_equipto,
        dt_pav_equipto,
        vl_aqu_equipto,
        dt_mov,
        us_mov,
        cd_grupo,
        cd_unidade,
        codigo,
        vl_indenizacao,
        cd_classfiscal,
        id_row,
        lad_ins_user,
        lad_ins_date,
        lad_upd_user,
        lad_upd_date,
        cd_programa,
        dt_inventario,
        cd_usuario_inv,
        cd_fieldgroup,
        cd_grupo_contabil,
        obs_componentes,
        codigo_erp,
        cd_fieldgroup_ckl,
        cd_oid,
        cd_usuario_alteracao,
        fl_origemalteracao_apv_equipto,
        cd_usuarioalteracao_apv_equipto,
        cd_tipoitem
      FROM dbsisloc_tecnogera.dbo.equipto
      ${whereClause}
      ORDER BY cd_equipto
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `);

  const countRecords = await db.query<{ total: number }>`
    SELECT COUNT(*) AS total
    FROM dbsisloc_tecnogera.dbo.equipto
  `;

  return {
    total: countRecords.recordset[0].total,
    result: result.recordset,
  };
};
