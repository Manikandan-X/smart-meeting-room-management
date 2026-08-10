import { NavLink } from 'react-router-dom'
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'

interface Props {
  to: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
}

export default function NavLinkItem({ to, label, icon, onClick }: Props) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to === '/'}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        '&.active': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '& .MuiListItemIcon-root': {
            color: 'primary.contrastText',
          },
          '&:hover': { bgcolor: 'primary.dark' },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
      />
    </ListItemButton>
  )
}
