// /frontend/components/DashboardLayout.js
import React, { useState } from "react";
import { useTheme, styled } from "@mui/material/styles";
import { AppBar, Toolbar, Box, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PostAddIcon from "@mui/icons-material/PostAdd";
import WorkIcon from "@mui/icons-material/Work";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import MuiDrawer from "@mui/material/Drawer";

const drawerWidth = 260;
const collapsedWidth = 72;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  width: collapsedWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open, drawerbg }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    position: "fixed",
    height: "100vh",
    "& .MuiDrawer-paper": {
      backgroundColor: drawerbg,
      color: "#fff",
      ...(open ? openedMixin(theme) : closedMixin(theme)),
    },
  })
);

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    marginLeft: open ? drawerWidth : collapsedWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  })
);

export default function DashboardLayout({ children, toggleDarkMode, currentMode }) {
  const theme = useTheme();
  const router = useRouter();
  
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
  };

  const drawerBg = theme.palette.mode === "dark" ? "#4E342E" : theme.palette.primary.main;
  const appBarBg = theme.palette.mode === "dark" ? "#3E2723" : theme.palette.primary.dark;

  // Definir items del menú del sidebar para el área administrativa
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, href: "/admin/dashboard" },
    { text: "Logs", icon: <ListAltIcon />, href: "/admin/logs" },
    { text: "Matchings", icon: <PostAddIcon />, href: "/admin/matchings" },
    { text: "Propuestas", icon: <ListAltIcon />, href: "/admin/propuestas" },
    { text: "Ofertas", icon: <WorkIcon />, href: "/admin/ofertas" },
    // Puedes agregar más según sea necesario
  ];

  return (
    <Box sx={{ display: "flex", backgroundColor: theme.palette.background.default }}>
      <Drawer variant="permanent" open={open} drawerbg={drawerBg}>
        <DrawerHeader>
          {open && (
            <Link href="/" passHref>
              <a>
                <Image
                  src={drawerBg === "#4E342E" ? "/images/Fap rrhh-marca-naranja(chico).png" : "/images/Fap rrhh-marca-blanca(chico).png"}
                  alt="Logo"
                  width={200}
                  height={90}
                  priority
                />
              </a>
            </Link>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
        <List>
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <ListItem button key={item.text} component={Link} href={item.href} sx={{ background: isActive ? theme.palette.action.selected : "none" }}>
                <ListItemIcon sx={{ color: "#fff", minWidth: 0, mr: open ? 2 : "auto", justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} primaryTypographyProps={{ color: "#fff" }} />}
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Main open={open}>
        <AppBar position="static" sx={{ backgroundColor: appBarBg }}>
          <Toolbar>
            {!open && (
              <Link href="/" passHref>
                <a>
                  <Image
                    src={theme.palette.mode === "dark" ? "/images/Fap-marca-naranja(chico).png" : "/images/Fap-marca-blanca(chico).png"}
                    alt="Logo AppBar"
                    width={100}
                    height={50}
                    priority
                  />
                </a>
              </Link>
            )}
            {toggleDarkMode && (
              <IconButton onClick={toggleDarkMode} color="inherit" sx={{ marginLeft: "auto" }}>
                {currentMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3, flexGrow: 1 }}>{children}</Box>
      </Main>
    </Box>
  );
}
