// /frontend/pages/admin/dashboard.js
import React from "react";
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";
import Link from "next/link";

export default function AdminDashboard() {
  // Validar autenticación de administrador
  useAdminAuth();

  // Definimos las secciones que se mostrarán como tarjetas
  const sections = [
    { title: "Editar BD", path: "/admin/editar_db" },
    { title: "Agregar CV", path: "/admin/agregar_cv" },
    { title: "Agregar Oferta", path: "/admin/agregar_oferta" },
    { title: "Mis Ofertas", path: "/admin/mis_ofertas" },
    { title: "Matchings", path: "/admin/matchings" },
    { title: "Propuestas", path: "/admin/propuestas" },
    { title: "Postear en Blog", path: "/admin/postear_blog" },
    { title: "Configuraciones", path: "/admin/configuraciones" },
  ];

  // Datos de ejemplo para logs (puedes adaptarlos o eliminarlos en el futuro)
  const logsGroup1 = [
    "Contacto: Juan Pérez - 2025-03-13 10:00",
    "Avance propuesta: Propuesta A actualizada",
    "Pago realizado: $200 - 2025-03-12",
    "Petición especial: Cambio de horario",
    "Integración API externa: Éxito",
    "Seguro: Renovado",
    "Entrevista con IA: Finalizada",
  ];

  const logsGroup2 = [
    "Registro: María González",
    "Postulación: Oferta X por Carlos",
    "Nueva Oferta: Desarrollador React",
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Administrativo
        </Typography>
        <Typography variant="subtitle1">
          Ruta protegida para administradores, bienvenido support@fapmendoza.com
        </Typography>
      </Box>
      {/* Grid de secciones en tarjetas */}
      <Grid container spacing={2}>
        {sections.map((section) => (
          <Grid item xs={12} sm={6} md={3} key={section.title}>
            <Link href={section.path} passHref>
              <Card sx={{ cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "scale(1.02)" } }}>
                <CardActionArea>
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {section.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
      {/* Secciones desplegables para logs */}
      <Box sx={{ mt: 4 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="logs1-content" id="logs1-header">
            <Typography variant="h6">Logs - Contactos, Avances, Pagos, Peticiones y Más</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {logsGroup1.map((log, index) => (
                <ListItem key={index}>
                  <Typography variant="body2">{log}</Typography>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="logs2-content" id="logs2-header">
            <Typography variant="h6">Logs - Registro, Postulaciones y Ofertas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {logsGroup2.map((log, index) => (
                <ListItem key={index}>
                  <Typography variant="body2">{log}</Typography>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    </DashboardLayout>
  );
}
