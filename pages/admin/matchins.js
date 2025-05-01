// pages/admin/matchins.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Box
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import useAdminAuth from '../../hooks/useAdminAuth';

export default function MatchinsPage({ toggleDarkMode, currentMode }) {
  const { user, loading: authLoading } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      (async () => {
        try {
          const token = localStorage.getItem('adminToken');
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/matchings`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          setRows(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [authLoading, user]);

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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidato</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Oferta</TableCell>
                  <TableCell align="right">Puntaje</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.user_name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.job_title}</TableCell>
                    <TableCell align="right">
                      {(row.score * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </DashboardLayout>
  );
}
