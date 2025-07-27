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

  // Se quita la constante 'token' de aquí para evitar usar un valor obsoleto.
  // Cada función obtendrá el token directamente de localStorage.

  const fetchUsers = useCallback(async () => {
    // Se obtiene el token actualizado justo antes de la llamada a la API
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) {
      console.warn("No se encontró el token de administrador. Omitiendo la carga de usuarios.");
      return;
    }
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
      console.error("Error fetching users:", error);
      setSnackbar({ open: true, message: "Error de red al cargar usuarios", severity: "error" });
    }
  }, []); // El array de dependencias está vacío, la función es estable.

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [loading, fetchUsers]);

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

  const handleUpdateUser = async () => {
    // NOTA: Asegúrate de que esta función también obtenga el token de localStorage
    // como se hizo en fetchUsers y handleDownloadFile.
  };

  const handleDeleteUser = async (userId) => {
    // NOTA: Asegúrate de que esta función también obtenga el token de localStorage.
  };

  const handleNewFileChange = (e) => {
    if (e.target.files.length > 0) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    // NOTA: Asegúrate de que esta función también obtenga el token de localStorage.
  };

  const handleDeleteFile = async (fileId) => {
    // NOTA: Asegúrate de que esta función también obtenga el token de localStorage.
  };

  const handleDownloadFile = async (file) => {
    if (!selectedUser) {
        setSnackbar({ open: true, message: "No hay un usuario seleccionado.", severity: "error" });
        return;
    }
    // Se obtiene el token actualizado justo antes de la llamada a la API
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) {
        setSnackbar({ open: true, message: "Sesión de administrador no encontrada. Por favor, inicie sesión de nuevo.", severity: "error" });
        return;
    }

    try {
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/files/${file.id}/signed-url`;
        
        const res = await fetch(endpoint, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
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
            setSnackbar({ open: true, message: errorData.message || "Error al obtener la URL de descarga", severity: "error" });
        }
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
        setSnackbar({ open: true, message: "Error de red al descargar el archivo", severity: "error" });
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
              {filteredUsers.length === 0 && !loading && (
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
                            my: 1,
                            p: 1,
                            borderRadius: 1,
                            "&:hover": { backgroundColor: 'action.hover' }
                        }}
                    >
                        <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {file.filename}
                        </Typography>
                        
                        <Box>
                            <IconButton onClick={() => handleDownloadFile(file)}>
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
