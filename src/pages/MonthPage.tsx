import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Paper, Typography } from '@mui/material'
import { getRange } from '../lib/api'
import { toISO } from '../lib/date'
import { Pager } from '../components'
import type { MealPlan } from '../lib/types'

const HEAD = ['일', '월', '화', '수', '목', '금', '토']

export default function MonthPage() {
  const nav = useNavigate()
  const { ym } = useParams()
  const now = new Date()
  const [y, m] = (ym ?? `${now.getFullYear()}-${now.getMonth() + 1}`).split('-').map(Number)
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [error, setError] = useState('')

  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0)
  const from = toISO(first)
  const to = toISO(last)

  useEffect(() => {
    getRange(from, to)
      .then((p) => {
        setPlans(p)
        setError('')
      })
      .catch((e) => setError(e.message))
  }, [from, to])

  const go = (delta: number) => {
    const d = new Date(y, m - 1 + delta, 1)
    nav(`/month/${d.getFullYear()}-${d.getMonth() + 1}`)
  }

  const cells: (number | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: last.getDate() }, (_, i) => i + 1),
  ]
  const today = toISO(now)
  const isCurrent = y === now.getFullYear() && m === now.getMonth() + 1

  return (
    <div>
      <Pager title={`${y}년 ${m}월`} onPrev={() => go(-1)} onNext={() => go(1)} onToday={isCurrent ? undefined : () => nav('/month')} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper
        variant="outlined"
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '1px', bgcolor: 'divider', overflow: 'hidden' }}
      >
        {HEAD.map((h, i) => (
          <Box key={h} sx={{ bgcolor: 'grey.100', py: 0.5, textAlign: 'center', typography: 'caption', fontWeight: 700, color: i === 0 ? 'error.main' : 'text.primary' }}>
            {h}
          </Box>
        ))}
        {cells.map((day, i) => {
          if (!day) return <Box key={i} sx={{ bgcolor: 'background.paper' }} />
          const date = toISO(new Date(y, m - 1, day))
          const isToday = date === today
          const names = (slot: string) =>
            plans.find((p) => p.date === date && p.slot === slot)?.meal_items.map((it) => it.label) ?? []
          return (
            <Box
              key={i}
              component={Link}
              to={`/day/${date}`}
              sx={{ minHeight: 96, minWidth: 0, p: 0.5, bgcolor: isToday ? '#fff3e0' : 'background.paper', color: 'text.primary', textDecoration: 'none' }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }} color={isToday ? 'primary' : 'text.primary'}>
                {day}
              </Typography>
              <Box sx={{ fontSize: 11, lineHeight: 1.25, color: 'text.secondary' }}>
                {(['lunch', 'dinner'] as const).map((slot) =>
                  names(slot).length > 0 ? (
                    <Box key={slot} sx={{ mt: 0.5 }}>
                      <span>{slot === 'lunch' ? '🌞' : '🌙'}</span>
                      {names(slot).map((n, k) => (
                        <Box key={k} sx={{ wordBreak: 'break-word' }}>
                          {n}
                        </Box>
                      ))}
                    </Box>
                  ) : null,
                )}
              </Box>
            </Box>
          )
        })}
      </Paper>
    </div>
  )
}
