import { useEffect, useState } from "react";
import useAdminAuth from "../../hooks/useAdminAuth";
import AdminSidebar from "../../components/AdminSidebar";
import Link from "next/link";

export default function AdminDashboard() {
  // Validación de autenticación
  useAdminAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  // Datos de ejemplo para las métricas (posteriormente se conectarán a datos reales)
  const sampleMetrics = {
    usuarios: 120,
    postulaciones: 85,
    ofertas: 40,
    matchings: 30,
    propuestas: 25,
  };

  const sampleMatchings = {
    avanzadas: 5,
    enProceso: 3,
  };

  // Datos de ejemplo para logs
  const sampleLogs1 = [
    "Contacto: Juan Pérez - 2025-03-13 10:00",
    "Avance propuesta: Propuesta A actualizada",
    "Pago realizado: $200 - 2025-03-12",
    "Petición especial: Cambio de horario",
    "Integración API externa: Éxito",
    "Seguro: Renovado",
    "Entrevista con IA: Finalizada",
  ];

  const sampleLogs2 = [
    "Registro: María González",
    "Postulación: Oferta X por Carlos",
    "Nueva Oferta: Desarrollador React",
  ];

  // Simulamos la obtención de datos protegidos (ya que el login ya funcionó)
  useEffect(() => {
    // Aquí podrías realizar la petición real al endpoint protegido si lo deseas.
    // Para este ejemplo, simulamos la respuesta.
    setDashboardData({
      message:
        "Ruta protegida para administradores, bienvenido support@fapmendoza.com",
    });
  }, []);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        {/* AppBar mejorado */}
        <div className="appbar">
          <h1>Dashboard Administrativo</h1>
          <div className="appbar-actions">
            <Link href="/admin/logout">
              <a>Logout</a>
            </Link>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        {dashboardData ? (
          <>
            <p>{dashboardData.message}</p>
            {/* Tarjetas en dos columnas */}
            <div className="cards-container">
              <div className="card">
                <h2>Datos de la Base de Datos</h2>
                <ul>
                  <li>Usuarios: {sampleMetrics.usuarios}</li>
                  <li>Postulaciones: {sampleMetrics.postulaciones}</li>
                  <li>Ofertas: {sampleMetrics.ofertas}</li>
                  <li>Matchings: {sampleMetrics.matchings}</li>
                  <li>Propuestas: {sampleMetrics.propuestas}</li>
                </ul>
              </div>
              <div className="card">
                <h2>Matchings en Proceso</h2>
                <ul>
                  <li>Avanzadas: {sampleMatchings.avanzadas}</li>
                  <li>En Proceso: {sampleMatchings.enProceso}</li>
                </ul>
              </div>
            </div>
            {/* Secciones desplegables para logs */}
            <div className="accordion-container">
              <details>
                <summary>
                  Logs de Actividad - Contactos, Avances, Pagos, Peticiones y Más
                </summary>
                <ul>
                  {sampleLogs1.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary>
                  Logs de Actividad - Registro de Personas, Postulaciones y Ofertas
                </summary>
                <ul>
                  {sampleLogs2.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </details>
            </div>
          </>
        ) : (
          !error && <p>Cargando datos...</p>
        )}
      </div>
      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f0f2f5;
        }
        .admin-content {
          flex: 1;
          padding: 20px;
          background: #fff;
        }
        .appbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #2c3e50;
          color: #fff;
          padding: 10px 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .appbar h1 {
          margin: 0;
        }
        .appbar-actions a {
          color: #ecf0f1;
          text-decoration: none;
          font-weight: bold;
        }
        .cards-container {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .card {
          flex: 1;
          background: #ecf0f1;
          padding: 20px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .card h2 {
          margin-top: 0;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .card ul {
          list-style: none;
          padding: 0;
        }
        .card ul li {
          margin-bottom: 6px;
          font-size: 16px;
        }
        .accordion-container details {
          background: #ecf0f1;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .accordion-container summary {
          font-weight: bold;
          cursor: pointer;
          outline: none;
        }
        .accordion-container ul {
          margin: 10px 0 0 20px;
          padding: 0;
        }
        .error-message {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
