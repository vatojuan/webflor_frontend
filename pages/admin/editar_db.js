// pages/admin/editar_db.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function EditarDB() {
  const { user, loading } = useAdminAuth();
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedFiles, setEditedFiles] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users);
        setFilteredUsers(data.users);
      } else {
        setSnackbar({ open: true, message: "Error al cargar usuarios", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error de red al cargar usuarios", severity: "error" });
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [loading, fetchUsers]);

  useEffect(() => {
    const results = usersList.filter(u =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(results);
  }, [searchTerm, usersList]);

  const handleEditClick = (userItem) => {
    setSelectedUser(userItem);
    setEditedName(userItem.name || "");
    setEditedPhone(userItem.phone || "");
    setEditedDescription(userItem.description || "");
    setEditedFiles(userItem.files || []);
    setOpenEditDialog(true);
  };

  const handleDialogClose = () => {
    setSelectedUser(null);
    setOpenEditDialog(false);
    setNewFile(null);
  };

  const handleDownloadFile = async (file) => {
    const token = getToken();
    if (!token || !selectedUser) return;
    
    // --- ¡CORRECCIÓN FINAL! ---
    // Esta es la URL completa y correcta que coincide con el nuevo endpoint del backend.
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/files/${file.id}/signed-url`;

    try {
      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
        } else {
          throw new Error("La respuesta del servidor no contiene una URL.");
        }
      } else {
        const errorData = await res.json();
        setSnackbar({ open: true, message: errorData.detail || `Error ${res.status}`, severity: "error" });
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      setSnackbar({ open: true, message: "Error de red al descargar el archivo", severity: "error" });
    }
  };


  // ... (El resto de las funciones de manejo como handleUpdateUser, etc., sin cambios)

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* ... (El resto del JSX de la tabla sin cambios) ... */}
      </Container>

      {selectedUser && (
        <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Usuario: {selectedUser.name}</DialogTitle>
          <DialogContent>
              {/* ... (Campos de texto) ... */}
              <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Archivos Subidos</Typography>
                  {editedFiles && editedFiles.length > 0 ? (
                      editedFiles.map((file) => (
                      <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 1, p: 1, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' }}}>
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>{file.filename}</Typography>
                          <Box>
                              {/* El botón de descarga ahora llama a la función corregida */}
                              <IconButton onClick={() => handleDownloadFile(file)}><DownloadIcon /></IconButton>
                              {/* <IconButton onClick={() => handleDeleteFile(file.id)}><DeleteIcon color="error" /></IconButton> */}
                          </Box>
                      </Box>
                      ))
                  ) : (<Typography variant="body2">No hay archivos subidos.</Typography>)}
                  {/* ... (Lógica de subida de archivos) ... */}
              </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancelar</Button>
            {/* <Button onClick={handleUpdateUser} variant="contained" color="primary">Guardar Cambios</Button> */}
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
