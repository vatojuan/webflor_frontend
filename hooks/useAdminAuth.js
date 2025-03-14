import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function useAdminAuth() {
  const [admin, setAdmin] = useState({ user: null });
  const router = useRouter();

  useEffect(() => {
    // Verifica que se ejecute en el cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
      } else {
        // Aquí puedes realizar validaciones adicionales o extraer info del token
        // Por ejemplo, podrías decodificar el token y obtener el id del usuario administrador
        setAdmin({ user: { id: "adminId", token } });
      }
    }
  }, [router]);

  return admin; // Siempre retorna un objeto, aunque inicialmente user es null
}
