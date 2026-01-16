import sql from 'mssql';

const connectionString = `Server=${process.env.DB_SERVER},${process.env.DB_PORT};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PWD};Encrypt=true;TrustServerCertificate=true;`;

const db = await sql.connect(connectionString);

export { db }