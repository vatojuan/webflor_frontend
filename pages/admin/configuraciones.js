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

export default function Configuraciones({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();
  const [config, setConfig] = useState({
    show_expired_admin_offers: false,
    show_expired_employer_offers: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Carga la configuración al montar
  useEffect(() => {
    if (!loading && user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("No autorizado");
          return res.json();
        })
        .then(data => {
          setConfig({
            show_expired_admin_offers: !!data.show_expired_admin_offers,
            show_expired_employer_offers: !!data.show_expired_employer_offers
          });
        })
        .catch(err => {
          console.error("Error cargando config:", err);
          setSnackbar({ open: true, message: "Error cargando configuración", severity: "error" });
        });
    }
  }, [loading, user]);

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
      },
      body: JSON.stringify({ settings: config })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setSnackbar({ open: true, message: "Guardado exitoso", severity: "success" });
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Error al guardar configuración", severity: "error" });
      });
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Cargando...</Typography>;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Configuraciones</Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={config.show_expired_admin_offers}
                onChange={() => handleToggle("show_expired_admin_offers")}
              />
            }
            label="Mostrar ofertas expiradas del administrador"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.show_expired_employer_offers}
                onChange={() => handleToggle("show_expired_employer_offers")}
              />
            }
            label="Mostrar ofertas expiradas de empleadores"
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleSave}>Guardar cambios</Button>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
