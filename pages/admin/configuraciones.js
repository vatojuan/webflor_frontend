import React, { useState, useEffect } from "react";
import {
  Container, Typography, FormControlLabel, Switch,
  Button, Paper, Box, Snackbar, Alert
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

const CONFIG_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/config/`;

export default function Configuraciones({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();
  const [config, setConfig] = useState({
    show_expired_admin_offers: false,
    show_expired_employer_offers: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  /* ─────── GET config ─────── */
  useEffect(() => {
    if (!loading && user) {
      fetch(CONFIG_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      })
        .then(r => {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(data => {
          setConfig({
            show_expired_admin_offers: !!data.show_expired_admin_offers,
            show_expired_employer_offers: !!data.show_expired_employer_offers
          });
        })
        .catch(() =>
          setSnackbar({ open: true, message: "Error cargando configuración", severity: "error" })
        );
    }
  }, [loading, user]);

  /* ─────── handlers ─────── */
  const toggleKey = key => setConfig(p => ({ ...p, [key]: !p[key] }));

  const save = () => {
    fetch(CONFIG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
      },
      body: JSON.stringify({ settings: config })
    })
      .then(r => {
        if (!r.ok) throw new Error();
        setSnackbar({ open: true, message: "Guardado", severity: "success" });
      })
      .catch(() =>
        setSnackbar({ open: true, message: "Error al guardar", severity: "error" })
      );
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Cargando…</Typography>;

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
            <Button variant="contained" onClick={save}>Guardar cambios</Button>
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
