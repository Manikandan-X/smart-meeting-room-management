import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/DashboardOutlined'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoomOutlined'
import EventIcon from '@mui/icons-material/EventAvailableOutlined'
import InventoryIcon from '@mui/icons-material/InventoryOutlined'
import LinkIcon from '@mui/icons-material/LinkOutlined'
import ApartmentIcon from '@mui/icons-material/ApartmentOutlined'
import PeopleIcon from '@mui/icons-material/PeopleOutlined'
import BadgeIcon from '@mui/icons-material/BadgeOutlined'
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined'
import SummarizeIcon from '@mui/icons-material/SummarizeOutlined'
import LogoutIcon from '@mui/icons-material/LogoutOutlined'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from '@/components/layout/NotificationBell'
import NavLinkItem from '@/components/layout/NavLinkItem'

const DRAWER_WIDTH = 260

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
  },
  {
    label: 'Bookings',
    path: '/bookings',
    icon: <EventIcon />,
  },
  {
    label: 'Meeting Rooms',
    path: '/rooms',
    icon: <MeetingRoomIcon />,
  },
  {
    label: 'Resources',
    path: '/resources',
    icon: <InventoryIcon />,
    adminOnly: true,
  },
  {
    label: 'Room Resources',
    path: '/room-resources',
    icon: <LinkIcon />,
    adminOnly: true,
  },
  {
    label: 'Departments',
    path: '/departments',
    icon: <ApartmentIcon />,
    adminOnly: true,
  },
  {
    label: 'Users',
    path: '/users',
    icon: <PeopleIcon />,
    adminOnly: true,
  },
  {
    label: 'Roles',
    path: '/roles',
    icon: <BadgeIcon />,
    adminOnly: true,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: <SummarizeIcon />,
    adminOnly: true,
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: <AssignmentIcon />,
    adminOnly: true,
  },
]

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(
    theme.breakpoints.up('md'),
  )

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null)

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin,
  )

  const handleLogout = async () => {
    setAnchorEl(null)
    await logout()
    navigate('/login', { replace: true })
  }

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar sx={{ px: 2.5, py: 2 }}>
        <MeetingRoomIcon
          color="primary"
          sx={{ mr: 1.2, fontSize: 28 }}
        />
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            lineHeight={1.1}
          >
            MeetSpace
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Room & Resource Manager
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {visibleItems.map((item) => (
          <NavLinkItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Chip
          label={isAdmin ? 'Admin Access' : 'Employee Access'}
          color={isAdmin ? 'primary' : 'default'}
          size="small"
          variant="outlined"
          sx={{ width: '100%' }}
        />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: {
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {!isDesktop && (
              <IconButton
                edge="start"
                onClick={() =>
                  setMobileOpen(true)
                }
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              {isAdmin
                ? 'Admin Dashboard'
                : 'My Workspace'}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <NotificationBell />
            <IconButton
              onClick={(e) =>
                setAnchorEl(e.currentTarget)
              }
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: 'primary.main',
                  fontSize: 14,
                }}
              >
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                >
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {user?.email}
                </Typography>
                <br />
                <Chip
                  label={user?.role_name}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight:
                '1px solid rgba(0,0,0,0.06)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
