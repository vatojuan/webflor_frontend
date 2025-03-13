import Link from "next/link";
import { useRouter } from "next/router";

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
    <div className="admin-sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul>
        {menuItems.map((item) => (
          <li key={item.path} className={router.pathname === item.path ? "active" : ""}>
            <Link href={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
