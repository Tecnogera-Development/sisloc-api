import { db } from "../db/connection";
import sql from "mssql";
import { AppError } from "../utils/apperror";
import { parseBooleanRows } from "../utils/parseBoolean";
import { execWithAuditTx } from "../utils/execQueryAudit";
import { globalUser } from "../utils/global-user";

type GetGroupsParams = {
  search?: string;
  lastUpdateDate?: Date;
  sortBy?: "asc" | "desc";
};

type PutGroupsParams = {
  nm_grupo?: string;
  fl_ativo?: boolean;
  lad_upd_user?: string;
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
            lad_upd_user,
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
      nm_grupo,
      fl_ativo,
      lad_upd_user,
      lad_upd_date
    FROM dbsisloc_tecnogera.dbo.grupo
    WHERE cd_grupo = @id
  `);

  parseBooleanRows(result.recordset);

  return {
    result: result.recordset,
  };
};

export const putGroup = async (
  { nm_grupo, fl_ativo }: PutGroupsParams,
  cd_grupo: number,
) => {
  const lad_upd_user = globalUser;

  const sets: string[] = [];

  if (typeof nm_grupo === "string" && nm_grupo.trim().length > 0) {
    sets.push("nm_grupo = @nm_grupo");
  }

  if (typeof fl_ativo === "boolean") {
    sets.push("fl_ativo = @fl_ativo");
  }

  if (typeof lad_upd_user === "string" && lad_upd_user.trim().length > 0) {
    sets.push("lad_upd_user = @lad_upd_user");
  }

  sets.push("lad_upd_date = SYSUTCDATETIME()");

  const result = await execWithAuditTx("ATUALIZAÇÃO DE GRUPO", async (req) => {
    req.input("cd_grupo", sql.Int, cd_grupo);

    if (typeof nm_grupo === "string" && nm_grupo.trim().length > 0) {
      req.input("nm_grupo", sql.VarChar(120), nm_grupo.trim());
    }

    if (typeof fl_ativo === "boolean") {
      req.input("fl_ativo", sql.VarChar(1), fl_ativo ? "S" : "N");
    }

    if (typeof lad_upd_user === "string" && lad_upd_user.trim().length > 0) {
      req.input("lad_upd_user", sql.VarChar(16), lad_upd_user.trim());
    }

    await req.query(`
      UPDATE dbsisloc_tecnogera.dbo.grupo
      SET ${sets.join(", ")}
      WHERE cd_grupo = @cd_grupo;
    `);

    return req.query(`
      SELECT cd_grupo, nm_grupo, fl_ativo, lad_upd_user, lad_upd_date
      FROM dbsisloc_tecnogera.dbo.grupo
      WHERE cd_grupo = @cd_grupo;
    `);
  });

  return { result: result.recordset };
};
