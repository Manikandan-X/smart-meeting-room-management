import { useEffect, useState } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 400,
}: Props) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => onChange(local), debounceMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local])

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 260 }}
    />
  )
}
