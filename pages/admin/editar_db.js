// pages/admin/editar_db.js
import React, { useState, useEffect } from "react";
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
  Box
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

  // Obtenemos el token del admin desde localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // Carga de usuarios al montar el componente
  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [loading]);

  // Función para obtener la lista de usuarios desde el backend
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users);
        setFilteredUsers(data.users);
      } else {
        setSnackbar({ open: true, message: "Error al cargar usuarios", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al cargar usuarios", severity: "error" });
    }
  };

  // Filtrar usuarios según el término de búsqueda
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(usersList);
    } else {
      setFilteredUsers(
        usersList.filter(u =>
          (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, usersList]);

  // Abrir el diálogo de edición y cargar datos del usuario seleccionado
  const handleEditClick = (userItem) => {
    setSelectedUser(userItem);
    setEditedName(userItem.name || "");
    setEditedPhone(userItem.phone || "");
    setEditedDescription(userItem.description || "");
    // Se asume que el objeto usuario incluye un array "files" con sus archivos
    setEditedFiles(userItem.files || []);
    setOpenEditDialog(true);
  };

  // Cerrar diálogo de edición
  const handleDialogClose = () => {
    setSelectedUser(null);
    setOpenEditDialog(false);
    setNewFile(null);
  };

  // Actualizar datos del usuario (nombre, teléfono, descripción)
  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedName,
          phone: editedPhone,
          description: editedDescription
        })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Usuario actualizado", severity: "success" });
        fetchUsers();
        handleDialogClose();
      } else {
        setSnackbar({ open: true, message: "Error al actualizar usuario", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al actualizar usuario", severity: "error" });
    }
  };

  // Eliminar usuario y sus datos (archivos y embeddings)
  const handleDeleteUser = async (userId) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Se eliminarán su cuenta, archivos y embeddings.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Usuario eliminado", severity: "success" });
        fetchUsers();
      } else {
        setSnackbar({ open: true, message: "Error al eliminar usuario", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al eliminar usuario", severity: "error" });
    }
  };

  // Manejar selección de nuevo archivo para agregar
  const handleNewFileChange = (e) => {
    if (e.target.files.length > 0) {
      setNewFile(e.target.files[0]);
    }
  };

  // Subir nuevo archivo para el usuario
  const handleUploadFile = async () => {
    if (!newFile) return;
    const formData = new FormData();
    formData.append("file", newFile);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/files`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Archivo subido", severity: "success" });
        // Se espera que el endpoint devuelva el usuario actualizado con su array de archivos
        const updatedUser = await res.json();
        setEditedFiles(updatedUser.files);
        setNewFile(null);
      } else {
        setSnackbar({ open: true, message: "Error al subir archivo", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al subir archivo", severity: "error" });
    }
  };

  // Eliminar un archivo del usuario
  const handleDeleteFile = async (fileId) => {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/files/${fileId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Archivo eliminado", severity: "success" });
        // Se espera que el endpoint devuelva el usuario actualizado con su array de archivos
        const updatedUser = await res.json();
        setEditedFiles(updatedUser.files);
      } else {
        setSnackbar({ open: true, message: "Error al eliminar archivo", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al eliminar archivo", severity: "error" });
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Editar Base de Datos
        </Typography>
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
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(u)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(u.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Diálogo para editar usuario */}
      <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            margin="normal"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <TextField
            label="Teléfono"
            variant="outlined"
            fullWidth
            margin="normal"
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
          />
          <TextField
            label="Descripción"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Archivos Subidos</Typography>
            {editedFiles && editedFiles.length > 0 ? (
              editedFiles.map((file) => (
                <Box
                  key={file.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    my: 1
                  }}
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {file.filename}
                  </a>
                  <Box>
                    <IconButton onClick={() => window.open(file.url, "_blank")}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteFile(file.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No hay archivos subidos.</Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                Agregar Archivo
                <input type="file" hidden onChange={handleNewFileChange} />
              </Button>
              {newFile && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {newFile.name}
                </Typography>
              )}
              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={handleUploadFile}
                disabled={!newFile}
              >
                Subir
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
