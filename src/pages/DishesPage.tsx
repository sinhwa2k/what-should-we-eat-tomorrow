import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Avatar,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Search from '@mui/icons-material/Search'
import RestaurantMenu from '@mui/icons-material/RestaurantMenu'
import { createDish, listDishes } from '../lib/api'
import { useQuery } from '../lib/cache'

export default function DishesPage() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [dq, setDq] = useState('')
  const { data } = useQuery(`dishes:${dq}`, () => listDishes(dq))
  const dishes = data

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 200)
    return () => clearTimeout(t)
  }, [q])

  async function add() {
    const n = name.trim()
    if (!n || busy) return
    setBusy(true)
    try {
      const exact = (await listDishes(n)).find((d) => d.name === n)
      const dish = exact ?? (await createDish(n))
      setOpen(false)
      setName('')
      nav(`/dish/${dish.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <TextField
        fullWidth
        placeholder="메뉴 검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          },
        }}
      />
      {dishes === undefined ? null : dishes.length === 0 ? (
        <Typography color="text.secondary">메뉴가 없어요.</Typography>
      ) : (
        <Card variant="outlined">
          <List disablePadding>
            {dishes.map((d) => (
              <ListItemButton key={d.id} component={Link} to={`/dish/${d.id}`}>
                <ListItemAvatar>
                  <Avatar src={d.photo_url ?? undefined} variant="rounded" sx={{ bgcolor: 'primary.light' }}>
                    <RestaurantMenu />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={d.name} secondary={d.recipe ? '레시피 있음' : undefined} />
              </ListItemButton>
            ))}
          </List>
        </Card>
      )}
      <Fab
        color="primary"
        aria-label="메뉴 추가"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', right: 20, bottom: 24 }}
      >
        <Add />
      </Fab>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <DialogTitle>메뉴 추가</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="메뉴 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>취소</Button>
            <Button type="submit" variant="contained" disabled={!name.trim() || busy}>
              추가
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
