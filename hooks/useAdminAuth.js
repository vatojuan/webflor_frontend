import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function useAdminAuth() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Asegurarse de que se ejecuta en el cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
      } else {
        try {
          // Supongamos que el token es un JSON que contiene la info del usuario
          const parsedUser = JSON.parse(token);
          setUser(parsedUser);
        } catch (error) {
          // Si no es JSON, puedes asignar un objeto por defecto o decodificarlo si es JWT
          setUser({ id: "admin123", email: "support@fapmendoza.com" });
        }
      }
    }
  }, [router]);

  return { user }; // Siempre devuelve un objeto, aunque inicialmente user es null
}
