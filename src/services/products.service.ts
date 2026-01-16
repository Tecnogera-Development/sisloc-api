import { db } from "../db/connection";
import sql from "mssql";

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
  const offset = (Number(page) - 1) * Number(limit)
  const whereConditions: string[] = [];

  if (search) {
    whereConditions.push("nm_equipto LIKE @search");
  }

  if (lastUpdateDate) {
    whereConditions.push(
      "CAST(lad_upd_date AS date) >= CAST(@lastUpdateDate AS date)"
    );
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const request = db.request();

  if (search) {
    request.input("search", sql.VarChar, `${search}%`);
  }

  if (lastUpdateDate) {
    request.input("lastUpdateDate", sql.Date, lastUpdateDate);
  }

  const result = await request.query(`
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

  return {
    result: result.recordset,
  };
};


export const getProduct = async (cd_equipto: number) => {
  const request = db.request();

  const result = await request.query(`
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
    WHERE cd_equipto = ${cd_equipto}
  `);

  return {
    result: result.recordset,
  };
}