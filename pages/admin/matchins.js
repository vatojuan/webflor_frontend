// pages/admin/matchins.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Container, Typography, Snackbar, Alert, Chip, Box,
  CircularProgress, Button
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Matchins() {
  useAdminAuth();
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({open:false,msg:"",sev:"success"});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/match/admin`);
      const data = await res.json();
      // Map to DataGrid rows
      setRows(data.map(m => ({
        id: m.id,
        job: m.job.title,
        user: m.user.email,
        score: (m.score*100).toFixed(1)+" %",
        sentAt: new Date(m.sent_at).toLocaleString("es-AR"),
        status: m.status
      })));
    } catch (e) {
      setSnack({open:true,msg:"Error cargando matchings",sev:"error"});
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const columns = useMemo(()=>[
    { field:"job", headerName:"Oferta", flex:1 },
    { field:"user", headerName:"Empleado", flex:1 },
    { field:"score", headerName:"Score", width:120,
      renderCell:(p)=><Chip label={p.value} color={+p.value.replace('%','')>85?"success":"default"} /> },
    { field:"sentAt", headerName:"Enviado", width:180 },
    { field:"status", headerName:"Estado", width:120 },
    {
      field:"actions", headerName:"Acciones", width:200,
      renderCell:({row})=>(
        <Box sx={{display:"flex",gap:1}}>
          <Button size="small" variant="outlined"
            onClick={()=>window.open(`/admin/ofertas/${row.jobId}`,'_blank')}>Ver oferta</Button>
          <Button size="small" variant="contained"
            onClick={()=>resendEmail(row.id)}>Reenviar</Button>
        </Box>
      )
    }
  ],[]);

  const resendEmail = async (matchId) => {
    try {
      const res = await fetch(`${API}/api/match/resend/${matchId}`, {method:"POST"});
      if(res.ok) setSnack({open:true,msg:"Email reenviado",sev:"success"});
      else throw new Error();
    } catch {
      setSnack({open:true,msg:"Error al reenviar",sev:"error"});
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{mt:3}}>
        <Typography variant="h4" gutterBottom>Matchings</Typography>
        {loading
          ? <CircularProgress/>
          : <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              pageSize={20}
              rowsPerPageOptions={[20,50,100]}
              disableSelectionOnClick
            />}
      </Container>
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={()=>setSnack({...snack,open:false})}>
        <Alert severity={snack.sev}>{snack.msg}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
