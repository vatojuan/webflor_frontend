import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function AdminSidebar() {
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Logs", path: "/admin/logs" },
    { name: "Matchings", path: "/admin/matchings" },
    { name: "Propuestas", path: "/admin/propuestas" },
    { name: "Ofertas", path: "/admin/ofertas" },
    { name: "Agregar CV", path: "/admin/agregar_cv" },
    { name: "Editar DB", path: "/admin/editar_db" },
    { name: "Configuración", path: "/admin/configuracion" },
  ];

  return (
    <nav className="admin-sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul>
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <li key={item.path} className={`menu-item ${isActive ? "active" : ""}`}>
              <Link href={item.path}>
                <a aria-current={isActive ? "page" : undefined}>{item.name}</a>
              </Link>
            </li>
          );
        })}
      </ul>
      <style jsx>{`
        .admin-sidebar {
          padding: 20px;
          background: #2c3e50;
          color: #fff;
          min-height: 100vh;
        }
        .sidebar-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        .menu-item {
          margin-bottom: 0.75rem;
        }
        .menu-item a {
          color: #ecf0f1;
          text-decoration: none;
          font-size: 1.1rem;
          transition: color 0.3s ease;
        }
        .menu-item a:hover {
          color: #1abc9c;
        }
        .menu-item.active a {
          font-weight: bold;
          color: #1abc9c;
        }
      `}</style>
    </nav>
  );
}
