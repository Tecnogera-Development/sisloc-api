import { db } from "../db/connection";
import sql from "mssql";
import { AppError } from "../utils/apperror";
import { parseBooleanRows } from "../utils/parseBoolean";

type GetGroupsParams = {
  search?: string;
  lastUpdateDate?: Date;
  sortBy?: "asc" | "desc";
};

export const getGroups = async ({
  search,
  lastUpdateDate,
  sortBy,
}: GetGroupsParams) => {
  const whereConditions: string[] = [
   // "fl_ativo = 'S'",
  ];

  const request = db.request();

  if (search) {
    whereConditions.push("nm_grupo LIKE @search");
    request.input("search", sql.VarChar, `${search}%`);
  }

  if (lastUpdateDate) {
    const startDate = new Date(
      lastUpdateDate.getFullYear(),
      lastUpdateDate.getMonth(),
      lastUpdateDate.getDate(),
      0,
      0,
      0,
      0,
    );

    whereConditions.push("lad_upd_date >= @startDate");
    request.input("startDate", sql.DateTime2, startDate);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const result = await request.query(`
        SELECT
            cd_grupo,
            nm_grupo,
            fl_ativo,
            lad_upd_date
        FROM dbsisloc_tecnogera.dbo.grupo
        ${whereClause}
        ORDER BY cd_grupo ${sortBy?.toLowerCase()}    
    `);

    parseBooleanRows(result.recordset);
    
  /*
  const result = await request.query(`
    SELECT
        cd_grupo,
        nm_grupo,
        dt_mov,
        tp_mov,
        us_mov,
        cd_fatordiaria,
        fl_calculo,
        fl_retencao_inss,
        fl_retencao_ir,
        pr_iss_locacao,
        fl_medidor,
        lad_ins_user,
        lad_ins_date,
        lad_upd_user,
        lad_upd_date,
        nr_mapafatur,
        cod_nfsebh_serv,
        fl_ativo,
        fl_exibirfatura,
        fl_equipto_pesado,
        fl_desconsiderar_incid_seguro,
        tp_grupo,
        ds_cnae,
        fl_prefixo,
        fl_tamcodprod,
        cd_oid,
        fl_retencao_pis,
        fl_retencao_cofins,
        fl_retencao_csll
    FROM dbsisloc_tecnogera.dbo.grupo
    ${whereClause}
    ORDER BY cd_grupo ${sortBy?.toLowerCase()}
  `);
  */

  return {
    result: result.recordset,
  };
};

export const getGroup = async (cd_grupo: number) => {
  const request = db.request();

  request.input("id", sql.Int, cd_grupo);

  const result = await request.query(`
    SELECT
      cd_grupo,
      nm_grupo
    FROM dbsisloc_tecnogera.dbo.grupo
    WHERE cd_grupo = @id
  `);

  return {
    result: result.recordset,
  };
};