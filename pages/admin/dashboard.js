// frontend/pages/admin/dashboard.js
import { useEffect, useState } from "react";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function AdminDashboard() {
  // Este hook redirige al login si no hay token
  useAdminAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return; // Debería redirigir gracias al hook

    // Realiza una petición a un endpoint protegido del backend
    fetch("https://api.fapmendoza.com/admin/protected", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Token inválido o sesión expirada");
        return response.json();
      })
      .then((data) => setDashboardData(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard Administrativo</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {dashboardData ? (
        <div>
          <p>{dashboardData.message}</p>
          {/* Aquí podrás agregar más componentes, gráficos o secciones de logs */}
          <section>
            <h2>Métricas Generales</h2>
            {/* Ejemplo: Estadísticas de usuarios, ofertas, matchings, etc. */}
          </section>
          <section>
            <h2>Logs y Actividad</h2>
            {/* Ejemplo: Logs de contactos, propuestas, etc. */}
          </section>
        </div>
      ) : (
        !error && <p>Cargando datos...</p>
      )}
    </div>
  );
}
