import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        try {
          // Se asume que el token es un JSON con la información del usuario
          const parsedUser = JSON.parse(token);
          setUser(parsedUser);
        } catch (error) {
          // Si el token no es un JSON, se puede asignar un objeto básico
          setUser({ id: "admin123", email: token });
        }
      }
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Solo redirigimos si ya se terminó de cargar y no hay usuario
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [loading, user, router]);

  return { user, loading };
}
