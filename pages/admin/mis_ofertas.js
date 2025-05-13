// pages/admin/mis_ofertas.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function MisOfertas({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Prepara headers incluyendo el token
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // 1️⃣ Carga las ofertas (ya filtradas por el backend)
  useEffect(() => {
    if (!user || !token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/admin_offers`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Asegúrate de que venga un array
        setOffers(Array.isArray(data.offers) ? data.offers : []);
      })
      .catch(err => {
        console.error("Error al obtener ofertas:", err);
        setSnackbar({ open: true, message: "No se pudieron cargar las ofertas", severity: "error" });
      });
  }, [user, token]);

  // 2️⃣ Acciones de editar / eliminar
  const handleEdit    = o  => { setSelectedOffer(o); setOpenEditDialog(true); };
  const handleDelete  = async id => {
    if (!window.confirm("¿Eliminar esta oferta?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/delete-admin`, {
        method: "DELETE", headers, body: JSON.stringify({ jobId: id })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOffers(prev => prev.filter(o => o.id !== id));
      setSnackbar({ open: true, message: "Oferta eliminada", severity: "success" });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "Error al eliminar", severity: "error" });
    }
  };

  // 3️⃣ Edit form
  const handleEditChange = (field, val) => {
    setSelectedOffer(prev => ({ ...prev, [field]: val }));
  };
  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/update-admin`, {
        method: "PUT", headers, body: JSON.stringify(selectedOffer)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setOffers(prev => prev.map(o => o.id === updated.id ? updated : o));
      setSnackbar({ open: true, message: "Oferta actualizada", severity: "success" });
      setOpenEditDialog(false);
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "Error al actualizar", severity: "error" });
    }
  };

  if (loading) return <Typography sx={{ mt: 4 }} align="center">Cargando…</Typography>;
  if (!user || !token) return null;

  // Helpers de presentación
  const fmtLabel  = lbl => lbl === "manual" ? "Manual" : "Automático";
  const fmtSource = (src, uid) => {
    if (src === "employer")  return "Empleador";
    if (src === "admin")     return "Administrador";
    if (src)                  return src.charAt(0).toUpperCase() + src.slice(1);
    return uid === user.id ? "Administrador" : "Empleador";
  };

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Mis Ofertas de Trabajo</Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {["Título","Descripción","Requisitos","Expiración","Etiqueta","Fuente","Acciones"].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No hay ofertas</TableCell>
                </TableRow>
              )}
              {offers.map(o => (
                <TableRow
                  key={o.id}
                  sx={{ backgroundColor: o.userId === user.id ? "#FFF9C4" : "inherit" }}
                >
                  <TableCell>{o.title}</TableCell>
                  <TableCell>{o.description}</TableCell>
                  <TableCell>{o.requirements}</TableCell>
                  <TableCell>
                    {o.expirationDate
                      ? new Date(o.expirationDate).toLocaleDateString()
                      : "Sin expiración"}
                  </TableCell>
                  <TableCell>{fmtLabel(o.label)}</TableCell>
                  <TableCell>{fmtSource(o.source, o.userId)}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEdit(o)}>
                      Editar
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(o.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* — Diálogo de edición — */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth>
        <DialogTitle>Editar Oferta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Título" fullWidth
              value={selectedOffer?.title || ""}
              onChange={e => handleEditChange("title", e.target.value)}
            />
            <TextField
              label="Descripción" fullWidth multiline rows={4}
              value={selectedOffer?.description || ""}
              onChange={e => handleEditChange("description", e.target.value)}
            />
            <TextField
              label="Requisitos" fullWidth multiline rows={3}
              value={selectedOffer?.requirements || ""}
              onChange={e => handleEditChange("requirements", e.target.value)}
            />
            <TextField
              label="Fecha Expiración" type="date" fullWidth InputLabelProps={{ shrink: true }}
              value={selectedOffer?.expirationDate?.split("T")[0] || ""}
              onChange={e => handleEditChange("expirationDate", e.target.value)}
            />
            <TextField
              select label="Etiqueta" fullWidth SelectProps={{ native: true }}
              value={selectedOffer?.label || "automatic"}
              onChange={e => handleEditChange("label", e.target.value)}
            >
              <option value="automatic">Automático</option>
              <option value="manual">Manual</option>
            </TextField>
            <TextField
              select label="Fuente" fullWidth SelectProps={{ native: true }}
              value={selectedOffer?.source || "admin"}
              onChange={e => handleEditChange("source", e.target.value)}
            >
              <option value="employer">Empleador</option>
              <option value="admin">Administrador</option>
              <option value="instagram">Instagram</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* — Notificaciones — */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
