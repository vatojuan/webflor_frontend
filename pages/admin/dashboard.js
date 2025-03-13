import { useEffect, useState } from "react";
import useAdminAuth from "../../hooks/useAdminAuth";
import AdminSidebar from "../../components/AdminSidebar"; // Importamos la barra lateral
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"; // Para gráficos

export default function AdminDashboard() {
  useAdminAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    fetch("https://api.fapmendoza.online/admin/protected", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Token inválido o sesión expirada");
        return response.json();
      })
      .then((data) => setDashboardData(data))
      .catch((err) => setError(err.message));
  }, []);

  // Datos de prueba para gráficos
  const sampleMetrics = [
    { name: "Usuarios", total: 120 },
    { name: "Postulaciones", total: 85 },
    { name: "Ofertas", total: 40 },
    { name: "Matchings", total: 30 },
    { name: "Propuestas", total: 25 },
  ];

  return (
    <div className="admin-container">
      <AdminSidebar /> {/* Agregamos la barra lateral */}
      <div className="admin-content">
        <h1>Dashboard Administrativo</h1>
        {error && <p className="error-message">{error}</p>}
        {dashboardData ? (
          <div>
            <p>{dashboardData.message}</p>
            <section>
              <h2>Métricas Generales</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleMetrics}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        ) : (
          !error && <p>Cargando datos...</p>
        )}
      </div>
    </div>
  );
}
