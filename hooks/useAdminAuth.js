// frontend/hooks/useAdminAuth.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function useAdminAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);
}
