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

  // Forzamos que la URL tenga "https://" 
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const apiUrl = rawApiUrl.startsWith("https://") ? rawApiUrl : `https://${rawApiUrl}`;
  console.log("API URL utilizada:", apiUrl);

  useEffect(() => {
    if (user) {
      fetch(`${apiUrl}/api/proposals`, {
        method: "GET",
        credentials: "include", // Se envían las credenciales para autenticación
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setProposals(data.proposals))
        .catch((err) => {
          console.error("Error al obtener propuestas:", err);
          setSnackbar({ open: true, message: "Error al obtener propuestas", severity: "error" });
        });
    }
  }, [user, refresh, apiUrl]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProposals = proposals.filter((p) =>
    p.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendProposal = async (proposalId) => {
    try {
      const res = await fetch(`${apiUrl}/api/proposals/${proposalId}/send`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Propuesta enviada", severity: "success" });
        setRefresh(!refresh);
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: "Error: " + data.detail, severity: "error" });
      }
    } catch (error) {
      console.error("Error al enviar propuesta:", error);
      setSnackbar({ open: true, message: "Error al enviar propuesta", severity: "error" });
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
        <Typography variant="h4" gutterBottom>
          Propuestas
        </Typography>
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
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>{proposal.id}</TableCell>
                  <TableCell>{proposal.job_title}</TableCell>
                  <TableCell>{proposal.applicant_name}</TableCell>
                  <TableCell>{proposal.label}</TableCell>
                  <TableCell>{proposal.status}</TableCell>
                  <TableCell>{new Date(proposal.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDetail(proposal)}
                      sx={{ mr: 1 }}
                    >
                      Ver Detalle
                    </Button>
                    {/* El botón Enviar aparece para propuestas manuales que están en estado pending */}
                    {proposal.label === "manual" && proposal.status === "pending" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSendProposal(proposal.id)}
                      >
                        Enviar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredProposals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron propuestas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      {/* Modal de Detalle de Propuesta */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle>Detalle de la Propuesta</DialogTitle>
        <DialogContent dividers>
          {selectedProposal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography><strong>ID:</strong> {selectedProposal.id}</Typography>
              <Typography><strong>Oferta:</strong> {selectedProposal.job_title}</Typography>
              <Typography>
                <strong>Postulante:</strong> {selectedProposal.applicant_name} ({selectedProposal.applicant_email})
              </Typography>
              <Typography><strong>Etiqueta de la Oferta:</strong> {selectedProposal.job_label}</Typography>
              <Typography><strong>Fuente de la Oferta:</strong> {selectedProposal.source}</Typography>
              <Typography><strong>Estado de la Propuesta:</strong> {selectedProposal.status}</Typography>
              <Typography>
                <strong>Fecha de Creación:</strong> {new Date(selectedProposal.created_at).toLocaleString()}
              </Typography>
              {selectedProposal.sent_at && (
                <Typography>
                  <strong>Enviada el:</strong> {new Date(selectedProposal.sent_at).toLocaleString()}
                </Typography>
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
