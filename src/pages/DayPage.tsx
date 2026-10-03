import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Close from '@mui/icons-material/Close'
import Add from '@mui/icons-material/Add'
import { addItem, createDish, getDay, listDishes, removeItem } from '../lib/api'
import { label, shift, toISO } from '../lib/date'
import { useConfirm } from '../lib/confirm'
import { useQuery } from '../lib/cache'
import { Pager } from '../components'
import type { Dish, Slot } from '../lib/types'

const SLOTS: { slot: Slot; title: string }[] = [
  { slot: 'lunch', title: '🌞 점심' },
  { slot: 'dinner', title: '🌙 저녁' },
]

export default function DayPage() {
  const { date = '' } = useParams()
  const nav = useNavigate()
  const confirm = useConfirm()
  const { data: plans, error, reload: load } = useQuery(`day:${date}`, () => getDay(date))

  const today = toISO(new Date())

  return (
    <div>
      <Pager
        title={label(date)}
        onPrev={() => nav(`/day/${shift(date, -1)}`)}
        onNext={() => nav(`/day/${shift(date, 1)}`)}
        onToday={date !== today ? () => nav(`/day/${today}`) : undefined}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        {SLOTS.map(({ slot, title }) => {
          const items = plans?.find((p) => p.slot === slot)?.meal_items ?? []
          return (
            <Card key={slot} sx={{ bgcolor: 'primary.50', backgroundColor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {title}
                </Typography>
                <List disablePadding sx={{ '& > li': { mb: 1 } }}>
                  {items.map((it) => (
                    <ListItem
                      key={it.id}
                      disablePadding
                      sx={{ bgcolor: 'background.paper', borderRadius: 3 }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="삭제"
                          onClick={async () => {
                            if (!(await confirm(`'${it.label}'을(를) 식단에서 삭제할까요?`, { title: '메뉴 삭제', confirmText: '삭제' }))) return
                            await removeItem(it.id)
                            load()
                          }}
                        >
                          <Close />
                        </IconButton>
                      }
                    >
                      {it.dish_id ? (
                        <ListItemButton component={Link} to={`/dish/${it.dish_id}`} sx={{ borderRadius: 3 }}>
                          <ListItemText primary={it.label} slotProps={{ primary: { sx: { fontSize: 18 } } }} />
                        </ListItemButton>
                      ) : (
                        <ListItemText sx={{ px: 2, py: 1 }} primary={it.label} slotProps={{ primary: { sx: { fontSize: 18 } } }} />
                      )}
                    </ListItem>
                  ))}
                  {plans && items.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      비어 있음
                    </Typography>
                  )}
                </List>
                <AddItem date={date} slot={slot} onAdded={load} />
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </div>
  )
}

function AddItem({ date, slot, onAdded }: { date: string; slot: Slot; onAdded: () => void }) {
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<Dish[]>([])

  useEffect(() => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      try {
        setSuggestions(await listDishes(text))
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(t)
  }, [text])

  async function submit(name: string, dishId: string | null) {
    const n = name.trim()
    if (!n) return
    let id = dishId
    if (!id && n !== '외식') {
      const exact = (await listDishes(n)).find((d) => d.name === n)
      id = (exact ?? (await createDish(n))).id
    }
    await addItem(date, slot, n, id)
    setText('')
    setSuggestions([])
    onAdded()
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(text, null)
        }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            placeholder="메뉴 추가 (이전 메뉴 검색)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" variant="contained" startIcon={<Add />} sx={{ flexShrink: 0 }}>
            추가
          </Button>
        </Stack>
      </form>
      {suggestions.length > 0 && (
        <Stack direction="row" useFlexGap sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {suggestions.map((d) => (
            <Chip key={d.id} label={d.name} onClick={() => submit(d.name, d.id)} variant="outlined" sx={{ bgcolor: 'background.paper' }} />
          ))}
        </Stack>
      )}
    </div>
  )
}
