import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  TextField,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function PropuestasPage() {
  const { user, loading } = useAdminAuth();
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [refresh, setRefresh] = useState(false);

  // Forzamos siempre HTTPS
  const API_URL = "https://api.fapmendoza.online";

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/proposals`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setProposals(data.proposals))
      .catch((err) => {
        console.error("Error al obtener propuestas:", err);
        setSnackbar({ open: true, message: "Error al obtener propuestas", severity: "error" });
      });
  }, [user, refresh]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProposals = proposals.filter((p) =>
    p.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendProposal = async (proposalId) => {
    try {
      const res = await fetch(`${API_URL}/api/proposals/${proposalId}/send`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || res.statusText);
      }
      setSnackbar({ open: true, message: "Propuesta enviada", severity: "success" });
      setRefresh((r) => !r);
    } catch (error) {
      console.error("Error al enviar propuesta:", error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: "error" });
    }
  };

  const handleOpenDetail = (proposal) => {
    setSelectedProposal(proposal);
    setOpenDetailDialog(true);
  };
  const handleCloseDetail = () => {
    setSelectedProposal(null);
    setOpenDetailDialog(false);
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Cargando...</Typography>;
  if (!user) return null;

  return (
    <DashboardLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Propuestas</Typography>
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <TextField
            label="Buscar por oferta o postulante"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
          />
        </Box>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Oferta</TableCell>
                <TableCell>Postulante</TableCell>
                <TableCell>Etiqueta</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProposals.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.job_title}</TableCell>
                  <TableCell>{p.applicant_name}</TableCell>
                  <TableCell>{p.label}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleOpenDetail(p)} sx={{ mr: 1 }}>
                      Ver Detalle
                    </Button>
                    {p.label === "manual" && p.status === "pending" && (
                      <Button size="small" variant="contained" onClick={() => handleSendProposal(p.id)}>
                        Enviar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredProposals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No se encontraron propuestas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      <Dialog open={openDetailDialog} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle>Detalle de la Propuesta</DialogTitle>
        <DialogContent dividers>
          {selectedProposal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography><strong>ID:</strong> {selectedProposal.id}</Typography>
              <Typography><strong>Oferta:</strong> {selectedProposal.job_title}</Typography>
              <Typography><strong>Postulante:</strong> {selectedProposal.applicant_name} ({selectedProposal.applicant_email})</Typography>
              <Typography><strong>Etiqueta de la Oferta:</strong> {selectedProposal.job_label}</Typography>
              <Typography><strong>Fuente de la Oferta:</strong> {selectedProposal.source}</Typography>
              <Typography><strong>Estado de la Propuesta:</strong> {selectedProposal.status}</Typography>
              <Typography><strong>Fecha de Creación:</strong> {new Date(selectedProposal.created_at).toLocaleString()}</Typography>
              {selectedProposal.sent_at && (
                <Typography><strong>Enviada el:</strong> {new Date(selectedProposal.sent_at).toLocaleString()}</Typography>
              )}
              {selectedProposal.notes && (
                <Typography><strong>Notas:</strong> {selectedProposal.notes}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
