// pages/admin/matchins.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function MatchinsPage({ toggleDarkMode, currentMode }) {
  const { user, loading: authLoading } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      const fetchMatchings = async () => {
        const token = localStorage.getItem("adminToken");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/matchings`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error("Error cargando matchings");
          const data = await res.json();
          setRows(
            data.map((item) => ({
              id: item.id,
              candidate: item.user_name,
              email: item.email,
              offer: item.job_title,
              score: Number(item.score.toFixed(3)),
            }))
          );
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMatchings();
    }
  }, [authLoading, user]);

  const columns = [
    {
      field: "candidate",
      headerName: "Candidato",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "offer",
      headerName: "Oferta",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "score",
      headerName: "Puntaje",
      type: "number",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {params.value}
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              height: 8,
              backgroundColor: '#e0e0e0',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${params.value * 100}%`,
                height: '100%',
                backgroundColor:
                  params.value > 0.8
                    ? 'success.main'
                    : params.value > 0.5
                    ? 'warning.main'
                    : 'error.main',
              }}
            />
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Matchings Profesionales
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              components={{ Toolbar: GridToolbar }}
              sx={{
                '& .MuiDataGrid-toolbarContainer': { mb: 1 },
                '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
            />
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
}
