import { Pool } from "pg";

require("dotenv").config();

console.log(process.env.DB_PORT);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
