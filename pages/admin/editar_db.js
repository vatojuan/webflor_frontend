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
  CircularProgress // Importar para el indicador de carga
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

  const fetchUsers = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) {
      console.warn("No se encontró el token de administrador. Omitiendo la carga de usuarios.");
      return;
    }
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
      console.error("Error fetching users:", error);
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

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const handleUpdateUser = async () => {
    const token = getToken();
    if (!token || !selectedUser) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: editedName, phone: editedPhone, description: editedDescription })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Usuario actualizado", severity: "success" });
        fetchUsers();
        handleDialogClose();
      } else {
        setSnackbar({ open: true, message: "Error al actualizar usuario", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error de red al actualizar", severity: "error" });
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = getToken();
    if (!token || !window.confirm("¿Estás seguro? Se eliminarán la cuenta, archivos y embeddings.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Usuario eliminado", severity: "success" });
        fetchUsers();
      } else {
        setSnackbar({ open: true, message: "Error al eliminar usuario", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error de red al eliminar", severity: "error" });
    }
  };

  const handleNewFileChange = (e) => {
    if (e.target.files.length > 0) setNewFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    const token = getToken();
    if (!newFile || !selectedUser) return;
    const formData = new FormData();
    formData.append("file", newFile);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/files`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setEditedFiles(updatedUser.files);
        setNewFile(null);
        setSnackbar({ open: true, message: "Archivo subido", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "Error al subir archivo", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error de red al subir", severity: "error" });
    }
  };

  const handleDeleteFile = async (fileId) => {
    const token = getToken();
    if (!token || !selectedUser || !window.confirm("¿Seguro que quieres eliminar este archivo?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/files/${fileId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setEditedFiles(updatedUser.files);
        setSnackbar({ open: true, message: "Archivo eliminado", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "Error al eliminar archivo", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error de red al eliminar archivo", severity: "error" });
    }
  };

  const handleDownloadFile = async (file) => {
    const token = getToken();
    if (!token || !selectedUser) return;
    try {
      // ATENCIÓN: Esta URL debe coincidir con tu endpoint en el backend.
      // El error 404 indica que esta ruta no existe.
      // Revisa tu API y ajústala si es necesario.
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/files/${file.id}/signed-url`;
      
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
        setSnackbar({ open: true, message: errorData.message || "Error 404: Endpoint no encontrado", severity: "error" });
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      setSnackbar({ open: true, message: "Error de red al descargar el archivo", severity: "error" });
    }
  };

  // SOLUCIÓN AL ERROR DE HIDRATACIÓN: Mostrar un cargador mientras se verifica el auth.
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
        <Typography variant="h4" gutterBottom>Editar Base de Datos</Typography>
        <TextField
          label="Buscar cliente"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(u)}><EditIcon color="primary" /></IconButton>
                    <IconButton onClick={() => handleDeleteUser(u.id)}><DeleteIcon color="error" /></IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">No se encontraron clientes.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {selectedUser && (
        <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Usuario: {selectedUser.name}</DialogTitle>
          <DialogContent>
              <TextField label="Nombre" fullWidth margin="normal" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
              <TextField label="Teléfono" fullWidth margin="normal" value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} />
              <TextField label="Descripción" fullWidth margin="normal" multiline rows={3} value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
              <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Archivos Subidos</Typography>
                  {editedFiles && editedFiles.length > 0 ? (
                      editedFiles.map((file) => (
                      <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 1, p: 1, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' }}}>
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>{file.filename}</Typography>
                          <Box>
                              <IconButton onClick={() => handleDownloadFile(file)}><DownloadIcon /></IconButton>
                              <IconButton onClick={() => handleDeleteFile(file.id)}><DeleteIcon color="error" /></IconButton>
                          </Box>
                      </Box>
                      ))
                  ) : (<Typography variant="body2">No hay archivos subidos.</Typography>)}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                      Agregar Archivo
                      <input type="file" hidden onChange={handleNewFileChange} />
                    </Button>
                    {newFile && (<Typography variant="body2" sx={{ ml: 2 }}>{newFile.name}</Typography>)}
                    <Button variant="outlined" sx={{ ml: 2 }} onClick={handleUploadFile} disabled={!newFile}>Subir</Button>
                  </Box>
              </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancelar</Button>
            <Button onClick={handleUpdateUser} variant="contained" color="primary">Guardar Cambios</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}