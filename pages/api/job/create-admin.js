import { Pool } from "pg";

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Asegúrate de definir esto en tu .env
  ssl: { rejectUnauthorized: false }, // Importante si usas Supabase o una DB remota con SSL
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title, description, requirements, expirationDate, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const client = await pool.connect();

    const query = `
      INSERT INTO jobs (title, description, requirements, "expirationDate", "userId") 
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `;

    const values = [title, description, requirements, expirationDate ? new Date(expirationDate) : null, userId];

    const result = await client.query(query, values);

    client.release();

    return res.status(200).json({ message: "Oferta creada", jobId: result.rows[0].id });
  } catch (error) {
    console.error("❌ Error creando oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}
