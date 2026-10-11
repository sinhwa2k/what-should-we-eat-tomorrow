import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, AppBar, Box, Button, Card, CardContent, CardMedia, Chip, Container, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Edit from '@mui/icons-material/Edit'
import Save from '@mui/icons-material/Save'
import AddAPhoto from '@mui/icons-material/AddAPhoto'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import { deleteDish, getDish, updateDish, uploadPhoto } from '../lib/api'
import { useConfirm } from '../lib/confirm'
import { Linkify } from '../components'
import { readCache, writeCache } from '../lib/cache'
import type { Dish } from '../lib/types'

const DEFAULT_TAGS = ['요리', '외식']

const FIELDS: { key: 'ingredients' | 'recipe' | 'memo'; title: string; rows: number }[] = [
  { key: 'ingredients', title: '재료', rows: 5 },
  { key: 'recipe', title: '레시피', rows: 12 },
  { key: 'memo', title: '메모', rows: 3 },
]

export default function DishPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const confirm = useConfirm()
  const key = `dish:${id}`
  const [dish, setDish] = useState<Dish | null>(() => readCache<Dish>(key) ?? null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    getDish(id)
      .then((d) => {
        writeCache(key, d)
        setDish(d)
      })
      .catch((e) => setError(e.message))
  }, [id, key])

  const tagOptions = [...new Set([...DEFAULT_TAGS, ...(readCache<Dish[]>('dishes:all') ?? []).flatMap((d) => d.tags ?? [])])]

  if (!dish && error) return <Alert severity="error">{error}</Alert>
  if (!dish) return <Typography>불러오는 중…</Typography>

  async function save() {
    if (!dish) return
    try {
      await updateDish(dish.id, {
        name: dish.name,
        ingredients: dish.ingredients,
        recipe: dish.recipe,
        memo: dish.memo,
        tags: dish.tags,
      })
      writeCache(key, dish)
      setEditing(false)
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="sm" disableGutters>
          <Toolbar>
            <IconButton edge="start" aria-label="뒤로" onClick={() => (window.history.state?.idx > 0 ? nav(-1) : nav('/'))}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flex: 1, mx: 1 }}>
              {dish.name}
            </Typography>
            {editing ? (
              <Button variant="contained" startIcon={<Save />} onClick={save}>
                저장
              </Button>
            ) : (
              <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)}>
                편집
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 12 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {editing ? (
        <TagEditor
          options={tagOptions}
          value={dish.tags ?? []}
          onChange={(tags) => setDish({ ...dish, tags })}
        />
      ) : (
        (dish.tags ?? []).length > 0 && (
          <Stack direction="row" useFlexGap sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {dish.tags.map((t) => (
              <Chip key={t} label={t} color="primary" variant="outlined" />
            ))}
          </Stack>
        )
      )}
      {editing && (
        <TextField
          fullWidth
          label="메뉴 이름"
          value={dish.name}
          onChange={(e) => setDish({ ...dish, name: e.target.value })}
          sx={{ mb: 2 }}
        />
      )}

      {dish.photo_url && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardMedia component="img" image={dish.photo_url} alt={dish.name} sx={{ maxHeight: 360, objectFit: 'cover' }} />
        </Card>
      )}
      {editing && (
        <Button component="label" variant="outlined" fullWidth startIcon={<AddAPhoto />} sx={{ mb: 2 }}>
          {dish.photo_url ? '사진 바꾸기' : '사진 추가 (촬영/앨범)'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                const url = await uploadPhoto(dish.id, f)
                const next = { ...dish, photo_url: url }
                writeCache(key, next)
                setDish(next)
              } catch (err) {
                setError((err as Error).message)
              }
            }}
          />
        </Button>
      )}

      <Stack spacing={2}>
        {FIELDS.map(({ key, title, rows }) => (
          <Card key={key} variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {title}
              </Typography>
              {editing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={rows}
                  value={dish[key] ?? ''}
                  onChange={(e) => setDish({ ...dish, [key]: e.target.value })}
                />
              ) : (
                <Box sx={{ whiteSpace: 'pre-wrap', fontSize: 18, lineHeight: 1.7 }}>
                  {dish[key] ? <Linkify text={dish[key]} /> : <Typography color="text.disabled">없음</Typography>}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {editing && (
        <Button
          color="error"
          startIcon={<DeleteOutlined />}
          sx={{ mt: 3 }}
          onClick={async () => {
            if (await confirm('이 메뉴를 삭제할까요? 식단에는 이름만 남습니다.', { title: '메뉴 삭제', confirmText: '삭제' })) {
              await deleteDish(dish.id)
              nav('/dishes')
            }
          }}
        >
          메뉴 삭제
        </Button>
      )}
      </Container>
    </>
  )
}

function TagEditor({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [text, setText] = useState('')
  const all = [...new Set([...options, ...value])]

  const toggle = (t: string) => onChange(value.includes(t) ? value.filter((v) => v !== t) : [...value, t])

  function add() {
    const t = text.trim()
    if (!t) return
    if (!value.includes(t)) onChange([...value, t])
    setText('')
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        태그
      </Typography>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        {all.map((t) => (
          <Chip
            key={t}
            label={t}
            color={value.includes(t) ? 'primary' : 'default'}
            variant={value.includes(t) ? 'filled' : 'outlined'}
            onClick={() => toggle(t)}
          />
        ))}
      </Stack>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="새 태그 이름"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={add}
            slotProps={{ htmlInput: { enterKeyHint: 'done' } }}
          />
          <Button type="submit" variant="outlined" disabled={!text.trim()} sx={{ flexShrink: 0 }}>
            태그 추가
          </Button>
        </Stack>
      </form>
    </Box>
  )
}
