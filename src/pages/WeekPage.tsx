import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Card, CardActionArea, CardContent, Typography } from '@mui/material'
import { getRange } from '../lib/api'
import { fromISO, label, shift, toISO } from '../lib/date'
import { Pager } from '../components'
import { useQuery } from '../lib/cache'
import type { Slot } from '../lib/types'

const SLOTS: { slot: Slot; icon: string }[] = [
  { slot: 'lunch', icon: '🌞' },
  { slot: 'dinner', icon: '🌙' },
]

export default function WeekPage() {
  const nav = useNavigate()
  const { date } = useParams()
  const today = toISO(new Date())
  const base = date ?? today
  const start = shift(base, -fromISO(base).getDay())
  const end = shift(start, 6)
  const days = Array.from({ length: 7 }, (_, i) => shift(start, i))
  const { data: plans, error } = useQuery(`range:${start}`, () => getRange(start, end))
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [start])

  return (
    <div>
      <Pager
        title={`${label(start)} ~ ${label(end)}`}
        onPrev={() => nav(`/week/${shift(start, -7)}`)}
        onNext={() => nav(`/week/${shift(start, 7)}`)}
        onToday={start !== shift(today, -fromISO(today).getDay()) ? () => nav('/week') : undefined}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', mx: -2, px: 2, pb: 1, scrollSnapType: 'x proximity' }}>
        {days.map((d) => {
          const isToday = d === today
          return (
            <Card
              key={d}
              ref={isToday ? todayRef : undefined}
              variant={isToday ? 'elevation' : 'outlined'}
              sx={{ width: 132, flexShrink: 0, scrollSnapAlign: 'start', bgcolor: isToday ? '#fff3e0' : 'background.paper' }}
            >
              <CardActionArea component={Link} to={`/day/${d}`} sx={{ height: '100%', alignItems: 'flex-start' }}>
                <CardContent>
                  <Typography
                    color={isToday ? 'primary' : 'text.primary'}
                    sx={{ fontWeight: 700, textAlign: 'center', pb: 1, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
                  >
                    {label(d)}
                  </Typography>
                  {SLOTS.map(({ slot, icon }) => {
                    const items = plans?.find((p) => p.date === d && p.slot === slot)?.meal_items ?? []
                    return (
                      <Box key={slot} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                        <Typography variant="caption">{icon}</Typography>
                        {items.length ? (
                          items.map((it) => (
                            <Typography key={it.id} variant="body2" sx={{ py: 0.25, wordBreak: 'break-word' }}>
                              {it.label}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>
    </div>
  )
}
