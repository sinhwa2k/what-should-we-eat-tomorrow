import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar,
  Card,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import Search from '@mui/icons-material/Search'
import RestaurantMenu from '@mui/icons-material/RestaurantMenu'
import { listDishes } from '../lib/api'
import type { Dish } from '../lib/types'

export default function DishesPage() {
  const [q, setQ] = useState('')
  const [dishes, setDishes] = useState<Dish[]>([])

  useEffect(() => {
    const t = setTimeout(() => listDishes(q).then(setDishes).catch(() => setDishes([])), 200)
    return () => clearTimeout(t)
  }, [q])

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
      {dishes.length === 0 ? (
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
    </div>
  )
}
