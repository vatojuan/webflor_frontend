// pages/admin/configuraciones.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Paper,
  Box,
  Snackbar,
  Alert
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

const BASE = process.env.NEXT_PUBLIC_API_URL;
const ENDPOINT = `${BASE}/api/admin/config`;

export default function Configuraciones({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();
  const [config, setConfig] = useState({
    show_expired_admin_offers: false,
    show_expired_employer_offers: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Helper para hacer fetch probando con/sin slash final
  async function fetchWithFallback(path, opts) {
    let res = await fetch(path, opts);
    if (res.status === 404 && !path.endsWith("/")) {
      res = await fetch(path + "/", opts);
    }
    return res;
  }

  /* ──── Obtener configuración ──── */
  useEffect(() => {
    if (loading || !user) return;
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setSnackbar({ open: true, message: "No autorizado", severity: "error" });
      return;
    }
    const opts = { headers: { Authorization: `Bearer ${token}` } };

    fetchWithFallback(ENDPOINT, opts)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setConfig({
          show_expired_admin_offers: data.show_expired_admin_offers === true || data.show_expired_admin_offers === "true",
          show_expired_employer_offers: data.show_expired_employer_offers === true || data.show_expired_employer_offers === "true"
        });
      })
      .catch(err => {
        console.error("Error cargando config:", err);
        setSnackbar({ open: true, message: "Error cargando configuración", severity: "error" });
      });
  }, [loading, user]);

  /* ──── Handlers ──── */
  const toggleKey = key => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setSnackbar({ open: true, message: "No autorizado", severity: "error" });
      return;
    }
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ settings: config })
    };

    fetchWithFallback(ENDPOINT, opts)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSnackbar({ open: true, message: "Configuración guardada", severity: "success" });
      })
      .catch(err => {
        console.error("Error guardando config:", err);
        setSnackbar({ open: true, message: "Error al guardar", severity: "error" });
      });
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Cargando…</Typography>;
  if (!user)   return null;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Configuraciones</Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={config.show_expired_admin_offers}
                onChange={() => toggleKey("show_expired_admin_offers")}
              />
            }
            label="Mostrar ofertas expiradas del administrador"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.show_expired_employer_offers}
                onChange={() => toggleKey("show_expired_employer_offers")}
              />
            }
            label="Mostrar ofertas expiradas de empleadores"
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={save}>
              Guardar cambios
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
