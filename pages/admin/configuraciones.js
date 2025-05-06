import React, { useState, useEffect } from "react";
import {
  Container, Typography, FormControlLabel, Switch,
  Button, Paper, Box, Snackbar, Alert
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function Configuraciones({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();
  const [config, setConfig] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      })
        .then(res => res.json())
        .then(data => {
          setConfig({
            show_expired_admin_offers: data.show_expired_admin_offers === 'true',
            show_expired_employer_offers: data.show_expired_employer_offers === 'true'
          });
        });
    }
  }, [user]);

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
      },
      body: JSON.stringify({ settings: {
        show_expired_admin_offers: config.show_expired_admin_offers,
        show_expired_employer_offers: config.show_expired_employer_offers
      } })
    })
      .then(res => {
        if (res.ok) setSnackbar({ open: true, message: "Guardado!", severity: "success" });
        else throw new Error();
      })
      .catch(() => setSnackbar({ open: true, message: "Error al guardar", severity: "error" }));
  };

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Configuraciones</Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={config.show_expired_admin_offers}
                onChange={() => handleToggle("show_expired_admin_offers")}
              />
            }
            label="Mostrar ofertas expiradas del admin"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.show_expired_employer_offers}
                onChange={() => handleToggle("show_expired_employer_offers")}
              />
            }
            label="Ocultar ofertas expiradas de empleadores"
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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