import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function MisOfertas() {
  const { user, loading } = useAdminAuth();
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (user) {
      // Se asume que existe un endpoint que devuelve todas las ofertas para administradores
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/admin_offers`)
        .then((res) => res.json())
        .then((data) => {
          // Se separan las ofertas del admin (aquellas cuyo userId coincide con el id del admin) y las demás
          const adminOffers = data.offers.filter((offer) => offer.userId === user.id);
          const otherOffers = data.offers.filter((offer) => offer.userId !== user.id);
          // Se muestran primero las ofertas del administrador
          setOffers([...adminOffers, ...otherOffers]);
        })
        .catch((err) => console.error("Error al obtener las ofertas:", err));
    }
  }, [user]);

  // Al editar, se conserva el userId original de la oferta, sin modificarlo
  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setOpenEditDialog(true);
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta oferta?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/delete-admin`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: offerId })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Oferta eliminada", severity: "success" });
        setOffers(offers.filter((o) => o.id !== offerId));
      } else {
        setSnackbar({ open: true, message: "Error al eliminar la oferta", severity: "error" });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: "Error al eliminar la oferta", severity: "error" });
    }
  };

  const handleEditChange = (field, value) => {
    // Actualiza el campo sin modificar el userId existente
    setSelectedOffer({ ...selectedOffer, [field]: value });
  };

  const handleEditSubmit = async () => {
    try {
      // En la edición, se mantiene el userId original de la oferta
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/update-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedOffer)
      });
      if (res.ok) {
        const updatedOffer = await res.json();
        setOffers(offers.map((o) => (o.id === updatedOffer.id ? updatedOffer : o)));
        setSnackbar({ open: true, message: "Oferta actualizada", severity: "success" });
        setOpenEditDialog(false);
      } else {
        setSnackbar({ open: true, message: "Error al actualizar la oferta", severity: "error" });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: "Error al actualizar la oferta", severity: "error" });
    }
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Cargando...</Typography>;
  if (!user) return null;

  return (
    <DashboardLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mis Ofertas de Trabajo
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Requisitos</TableCell>
                <TableCell>Expiración</TableCell>
                <TableCell>Etiqueta</TableCell>
                <TableCell>Fuente</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.map((offer) => (
                <TableRow
                  key={offer.id}
                  sx={{
                    backgroundColor: offer.userId === user.id ? "#FFF9C4" : "inherit"
                  }}
                >
                  <TableCell>{offer.title}</TableCell>
                  <TableCell>{offer.description}</TableCell>
                  <TableCell>{offer.requirements}</TableCell>
                  <TableCell>
                    {offer.expirationDate ? new Date(offer.expirationDate).toLocaleDateString() : "Sin expiración"}
                  </TableCell>
                  <TableCell>{offer.label || "automatic"}</TableCell>
                  <TableCell>{offer.source || "N/A"}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(offer)} variant="outlined" size="small" sx={{ mr: 1 }}>
                      Editar
                    </Button>
                    <Button onClick={() => handleDelete(offer.id)} variant="outlined" size="small" color="error">
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      
      {/* Diálogo para editar la oferta */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth>
        <DialogTitle>Editar Oferta</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              value={selectedOffer?.title || ""}
              onChange={(e) => handleEditChange("title", e.target.value)}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              value={selectedOffer?.description || ""}
              onChange={(e) => handleEditChange("description", e.target.value)}
            />
            <TextField
              label="Requisitos"
              fullWidth
              multiline
              rows={3}
              value={selectedOffer?.requirements || ""}
              onChange={(e) => handleEditChange("requirements", e.target.value)}
            />
            <TextField
              label="Fecha de Expiración"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedOffer?.expirationDate ? selectedOffer.expirationDate.split("T")[0] : ""}
              onChange={(e) => handleEditChange("expirationDate", e.target.value)}
            />
            {/* Selector para modificar la etiqueta (label) */}
            <TextField
              select
              label="Etiqueta"
              fullWidth
              value={selectedOffer?.label || "automatic"}
              onChange={(e) => handleEditChange("label", e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="automatic">Automático</option>
              <option value="manual">Manual</option>
            </TextField>
            {/* Selector para modificar la fuente (source) */}
            <TextField
              select
              label="Fuente"
              fullWidth
              value={selectedOffer?.source || "admin"}
              onChange={(e) => handleEditChange("source", e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="employer">Empleador</option>
              <option value="admin">Administrador</option>
              <option value="instagram">Instagram</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
