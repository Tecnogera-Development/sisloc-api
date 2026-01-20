import { db } from "../db/connection";
import sql from "mssql";
import { AppError } from "../utils/apperror";

type GetProductsParams = {
  page: number;
  limit: number;
  search?: string;
  lastUpdateDate?: Date;
  sortBy?: 'asc' | 'desc';
};

type InsertProductParams = {
  nm_equipto: string;
  vl_aqu_equipto: number;
  cd_grupo: number;
  cd_unidade: number;
  dt_pav_equipto?: Date | null;
  dt_mov?: Date | null;
  us_mov?: string | null;
  codigo?: string | null;
  vl_indenizacao?: number | null;
  cd_classfiscal?: number | null;
  lad_ins_user?: string | null;
  lad_upd_user?: string | null;
  cd_programa?: number | null;
  dt_inventario?: Date | null;
  cd_usuario_inv?: number | null;
  cd_fieldgroup?: number | null;
  cd_grupo_contabil?: number | null;
  obs_componentes?: string | null;
  codigo_erp?: string | null;
  cd_fieldgroup_ckl?: number | null;
  cd_oid?: number | null;
  cd_usuario_alteracao?: number | null;
  fl_origemalteracao_apv_equipto?: string;
  cd_usuarioalteracao_apv_equipto?: number | null;
  cd_tipoitem: number;
};

export const getProducts = async ({
  page,
  limit,
  search,
  lastUpdateDate,
  sortBy
}: GetProductsParams) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereConditions: string[] = [];

  const request = db.request();

  if (search) {
    whereConditions.push("nm_equipto LIKE @search");
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
      0
    );

    whereConditions.push("lad_upd_date >= @startDate");
    request.input("startDate", sql.DateTime2, startDate);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

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
      fl_ativo,
      peso_bruto,
      peso_liquido,
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
    ORDER BY cd_equipto ${sortBy?.toLowerCase()}
    OFFSET ${offset} ROWS
    FETCH NEXT ${limit} ROWS ONLY
  `);

  return {
    result: result.recordset,
  };
};

export const getProduct = async (cd_equipto: number) => {
  const request = db.request();

  request.input("id", sql.Int, cd_equipto);

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
      fl_ativo,
      peso_bruto,
      peso_liquido,
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
    WHERE cd_equipto = @id
  `);

  return {
    result: result.recordset,
  };
};

export const insertProduct = async (productData: InsertProductParams) => {
  const transaction = new sql.Transaction(db);

  try {
    await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

    if (productData.codigo) {
      const checkCodigoRequest = new sql.Request(transaction);
      checkCodigoRequest.input("codigo", sql.VarChar(60), productData.codigo);

      const existingCodigo = await checkCodigoRequest.query(`
        SELECT cd_equipto 
        FROM dbsisloc_tecnogera.dbo.equipto 
        WHERE codigo = @codigo
      `);

      if (existingCodigo.recordset.length > 0) {
        throw new AppError(`Produto com código '${productData.codigo}' já existe`);
      }
    }

    const checkGrupoRequest = new sql.Request(transaction);
    checkGrupoRequest.input("cd_grupo", sql.Int, productData.cd_grupo);

    const grupoExists = await checkGrupoRequest.query(`
      SELECT 1 
      FROM dbsisloc_tecnogera.dbo.grupo 
      WHERE cd_grupo = @cd_grupo
    `);

    if (grupoExists.recordset.length === 0) {
      throw new AppError(`Grupo com código ${productData.cd_grupo} não encontrado`);
    }

    const checkUnidadeRequest = new sql.Request(transaction);
    checkUnidadeRequest.input("cd_unidade", sql.Int, productData.cd_unidade);

    const unidadeExists = await checkUnidadeRequest.query(`
      SELECT 1 
      FROM dbsisloc_tecnogera.dbo.unidade 
      WHERE cd_unidade = @cd_unidade
    `);

    if (unidadeExists.recordset.length === 0) {
      throw new AppError(`Unidade com código ${productData.cd_unidade} não encontrada`);
    }

    const getNextIdRequest = new sql.Request(transaction);
    const nextIdResult = await getNextIdRequest.query(`
      SELECT ISNULL(MAX(cd_equipto), 0) + 1 AS next_id
      FROM dbsisloc_tecnogera.dbo.equipto WITH (TABLOCKX)
    `);

    const nextCdEquipto = nextIdResult.recordset[0].next_id;

    const insertRequest = new sql.Request(transaction);

    const user = 'SISLOC-API';

    insertRequest.input("cd_equipto", sql.Int, nextCdEquipto);
    insertRequest.input("nm_equipto", sql.VarChar(120), productData.nm_equipto);
    insertRequest.input("vl_aqu_equipto", sql.Float, productData.vl_aqu_equipto);
    insertRequest.input("cd_grupo", sql.Int, productData.cd_grupo);
    insertRequest.input("cd_unidade", sql.Int, productData.cd_unidade);
    insertRequest.input("dt_pav_equipto", sql.DateTime, productData.dt_pav_equipto || null);
    insertRequest.input("dt_mov", sql.DateTime, productData.dt_mov || null);
    insertRequest.input("us_mov", sql.VarChar(10), productData.us_mov || null);
    insertRequest.input("codigo", sql.VarChar(60), productData.codigo || null);
    insertRequest.input("vl_indenizacao", sql.Float, productData.vl_indenizacao || null);
    insertRequest.input("cd_classfiscal", sql.Int, productData.cd_classfiscal || null);
    insertRequest.input("lad_ins_user", sql.VarChar(16), user);
    insertRequest.input("lad_upd_user", sql.VarChar(16), user);
    insertRequest.input("cd_programa", sql.Int, productData.cd_programa || null);
    insertRequest.input("dt_inventario", sql.DateTime, productData.dt_inventario || null);
    insertRequest.input("cd_usuario_inv", sql.Int, productData.cd_usuario_inv || null);
    insertRequest.input("cd_fieldgroup", sql.Int, productData.cd_fieldgroup || null);
    insertRequest.input("cd_grupo_contabil", sql.Int, productData.cd_grupo_contabil || null);
    insertRequest.input("obs_componentes", sql.Text, productData.obs_componentes || null);
    insertRequest.input("codigo_erp", sql.VarChar(60), productData.codigo_erp || null);
    insertRequest.input("cd_fieldgroup_ckl", sql.Int, productData.cd_fieldgroup_ckl || null);
    insertRequest.input("cd_oid", sql.Int, productData.cd_oid || null);
    insertRequest.input("cd_usuario_alteracao", sql.Int, productData.cd_usuario_alteracao || null);
    insertRequest.input("fl_origemalteracao_apv_equipto", sql.VarChar(1), productData.fl_origemalteracao_apv_equipto || '*');
    insertRequest.input("cd_usuarioalteracao_apv_equipto", sql.Int, productData.cd_usuarioalteracao_apv_equipto || null);
    insertRequest.input("cd_tipoitem", sql.Int, productData.cd_tipoitem);

    insertRequest.input("fl_impsr", sql.VarChar(1), 'S');
    insertRequest.input("fl_impfat", sql.VarChar(1), 'S');
    insertRequest.input("vl_pav_equipto", sql.Float, 0);
    insertRequest.input("vl_apv_equipto", sql.Float, 0);
    insertRequest.input("fl_detalhe_equipto", sql.VarChar(1), 'N');
    insertRequest.input("fl_inflamavel", sql.VarChar(1), 'N');
    insertRequest.input("fl_origem", sql.Int, 0);
    insertRequest.input("fl_fabricacao_propria", sql.VarChar(1), 'N');
    insertRequest.input("cd_icms", sql.Int, 1);
    insertRequest.input("vl_custo_medio_operacao", sql.Float, 0);
    insertRequest.input("fl_gera_controleativo", sql.VarChar(1), 'N');
    insertRequest.input("fl_origem_alteracao", sql.VarChar(1), 'N');
    insertRequest.input("fl_basepatrimonio", sql.VarChar(1), 'N');
    insertRequest.input("qt_dias_garantia", sql.Int, 0);
    insertRequest.input("fl_restricao_reqmat", sql.Int, 40);
    insertRequest.input("fl_aplicacao_direta", sql.VarChar(1), 'N');
    insertRequest.input("fl_op_com_if", sql.VarChar(1), 'S');
    insertRequest.input("fl_controlaestoque", sql.VarChar(1), 'S');
    insertRequest.input("fl_status_estrutura", sql.Int, 20);
    insertRequest.input("fl_rfid", sql.VarChar(1), 'N');
    insertRequest.input("cd_icms_indust", sql.Int, 1);
    insertRequest.input("cd_icms_revend", sql.Int, 1);
    insertRequest.input("fl_prmt_trc", sql.VarChar(1), 'N');

    await insertRequest.query(`
      INSERT INTO dbsisloc_tecnogeraai.dbo.transacao (dt_trans, dt_fim, cd_usuario, nm_dbaudit_data, ds_trans)
      VALUES (GETDATE(), GETDATE(), 0, 'SISLOC-API', 'INSERT EQUIPAMENTO');

      DECLARE @id_trans INT;
      SET @id_trans = SCOPE_IDENTITY();

      DECLARE @context VARBINARY(128);
      SET @context = CAST(@id_trans AS BINARY(4));
      SET CONTEXT_INFO @context;

      DECLARE @next_cd_equipto INT;
      SELECT @next_cd_equipto = ISNULL(MAX(cd_equipto), 0) + 1
      FROM dbsisloc_tecnogera.dbo.equipto WITH (UPDLOCK, HOLDLOCK);

      INSERT INTO dbsisloc_tecnogera.dbo.equipto (
      cd_equipto,
      nm_equipto,
      vl_aqu_equipto,
      cd_grupo,
      cd_unidade,
      dt_pav_equipto,
      dt_mov,
      us_mov,
      codigo,
      vl_indenizacao,
      cd_classfiscal,
      lad_ins_user,
      lad_upd_user,
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
      cd_tipoitem,
      fl_impsr,
      fl_impfat,
      vl_pav_equipto,
      vl_apv_equipto,
      fl_detalhe_equipto,
      fl_inflamavel,
      fl_origem,
      fl_fabricacao_propria,
      cd_icms,
      vl_custo_medio_operacao,
      fl_gera_controleativo,
      fl_origem_alteracao,
      fl_basepatrimonio,
      qt_dias_garantia,
      fl_restricao_reqmat,
      fl_aplicacao_direta,
      fl_op_com_if,
      fl_controlaestoque,
      fl_status_estrutura,
      fl_rfid,
      cd_icms_indust,
      cd_icms_revend,
      fl_prmt_trc
    )
    VALUES (
      @cd_equipto,
      @nm_equipto,
      @vl_aqu_equipto,
      @cd_grupo,
      @cd_unidade,
      @dt_pav_equipto,
      @dt_mov,
      @us_mov,
      @codigo,
      @vl_indenizacao,
      @cd_classfiscal,
      @lad_ins_user,
      @lad_upd_user,
      @cd_programa,
      @dt_inventario,
      @cd_usuario_inv,
      @cd_fieldgroup,
      @cd_grupo_contabil,
      @obs_componentes,
      @codigo_erp,
      @cd_fieldgroup_ckl,
      @cd_oid,
      @cd_usuario_alteracao,
      @fl_origemalteracao_apv_equipto,
      @cd_usuarioalteracao_apv_equipto,
      @cd_tipoitem,
      @fl_impsr,
      @fl_impfat,
      @vl_pav_equipto,
      @vl_apv_equipto,
      @fl_detalhe_equipto,
      @fl_inflamavel,
      @fl_origem,
      @fl_fabricacao_propria,
      @cd_icms,
      @vl_custo_medio_operacao,
      @fl_gera_controleativo,
      @fl_origem_alteracao,
      @fl_basepatrimonio,
      @qt_dias_garantia,
      @fl_restricao_reqmat,
      @fl_aplicacao_direta,
      @fl_op_com_if,
      @fl_controlaestoque,
      @fl_status_estrutura,
      @fl_rfid,
      @cd_icms_indust,
      @cd_icms_revend,
      @fl_prmt_trc
    );

    SET CONTEXT_INFO 0x;

    SELECT @next_cd_equipto AS cd_equipto, @id_trans AS id_trans;
`);

    await transaction.commit();

    return {
      error: false,
      data: {
        cd_equipto: nextCdEquipto,
      }
    };

  } catch (error) {
    try {
      if (transaction) {
        await transaction.rollback();
      }
    } catch (rollbackError) {
      console.error("Erro ao fazer rollback:", rollbackError instanceof Error ? rollbackError.message : rollbackError);
    }

    throw error;
  }
};