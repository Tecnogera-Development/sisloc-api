import sql from 'mssql';
import { db } from '../db/connection';


export const execWithAuditTx = async (
  dsTrans: string,
  run: (req: sql.Request) => Promise<any>
) => {
  const tx = new sql.Transaction(db);

  try {
    await tx.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

    const auditReq = new sql.Request(tx);

    await auditReq.query(`
        DECLARE @Inserted TABLE (id_trans INT);
        INSERT INTO dbsisloc_tecnogeraai.dbo.transacao (dt_trans, dt_fim, cd_usuario, nm_dbaudit_data, ds_trans) OUTPUT inserted.id_trans INTO @Inserted(id_trans)
        VALUES (Getdate(), Getdate(), 0, 'SISLOC-API', '${dsTrans.replace("'", "''")}');

        DECLARE @id_trans INT =
        (SELECT TOP 1 id_trans
        FROM @Inserted);

        DECLARE @user CHAR(16) = 'SALESFORCE-API';

        DECLARE @ctx VARBINARY(128) = Cast(@id_trans AS BINARY(4))
        + Cast(0x00000000 AS BINARY(4))
        + Cast(@user AS BINARY(16))
        + Cast(Replicate(Cast(0x00 AS VARBINARY(1)), 104) AS VARBINARY(104));
        
        SET context_info @ctx;
    `);

    const dmlReq = new sql.Request(tx);
    const result = await run(dmlReq);

    const clearReq = new sql.Request(tx);
    await clearReq.query(`SET CONTEXT_INFO 0x;`);

    await tx.commit();
    return result;
  } catch (e) {
    try {
      const clearReq = new sql.Request(tx);
      await clearReq.query(`SET CONTEXT_INFO 0x;`);
    } catch {}
    try { await tx.rollback(); } catch {}
    throw e;
  }
};
