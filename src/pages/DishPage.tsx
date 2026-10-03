import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, AppBar, Box, Button, Card, CardContent, CardMedia, Container, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Edit from '@mui/icons-material/Edit'
import Save from '@mui/icons-material/Save'
import AddAPhoto from '@mui/icons-material/AddAPhoto'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import { deleteDish, getDish, updateDish, uploadPhoto } from '../lib/api'
import { useConfirm } from '../lib/confirm'
import { readCache, writeCache } from '../lib/cache'
import type { Dish } from '../lib/types'

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

  useEffect(() => {
    getDish(id)
      .then((d) => {
        writeCache(key, d)
        setDish(d)
      })
      .catch((e) => setError(e.message))
  }, [id, key])

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
            <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
              내일뭐먹지
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
        {editing ? (
          <TextField
            fullWidth
            label="메뉴 이름"
            value={dish.name}
            onChange={(e) => setDish({ ...dish, name: e.target.value })}
          />
        ) : (
          <Typography variant="h4" sx={{ flex: 1, wordBreak: 'break-word' }}>
            {dish.name}
          </Typography>
        )}
        {editing ? (
          <Button variant="contained" startIcon={<Save />} onClick={save} sx={{ flexShrink: 0 }}>
            저장
          </Button>
        ) : (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)} sx={{ flexShrink: 0 }}>
            편집
          </Button>
        )}
      </Stack>

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
                  {dish[key] || <Typography color="text.disabled">없음</Typography>}
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
