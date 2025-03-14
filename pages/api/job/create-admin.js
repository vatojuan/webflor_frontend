import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extraemos los campos necesarios desde el body
  const { title, description, requirements, expirationDate, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    // Construir el objeto de datos para la oferta de trabajo
    const jobData = {
      title,
      description,
      requirements,
      userId: Number(userId), // Id del administrador que crea la oferta
    };

    // Si se proporciona una fecha de expiración, la convertimos a Date
    if (expirationDate) {
      jobData.expirationDate = new Date(expirationDate);
    }

    // Insertar la nueva oferta en la base de datos
    const job = await prisma.job.create({ data: jobData });
    console.log("✅ Oferta creada exitosamente:", job);
    return res.status(200).json({ message: "Oferta creada", job });
  } catch (error) {
    console.error("❌ Error creando oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}
