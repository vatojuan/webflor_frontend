import { useEffect } from "react";
import { useRouter } from "next/router";

export default function useAdminAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);
}
