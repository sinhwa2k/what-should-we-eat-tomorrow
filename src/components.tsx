import { Button, IconButton, Stack, Typography } from '@mui/material'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Today from '@mui/icons-material/Today'

export function Pager({
  title,
  onPrev,
  onNext,
  onToday,
}: {
  title: string
  onPrev: () => void
  onNext: () => void
  onToday?: () => void
}) {
  return (
    <Stack spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
      <Stack direction="row" sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={onPrev} aria-label="이전">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {title}
        </Typography>
        <IconButton onClick={onNext} aria-label="다음">
          <ChevronRight />
        </IconButton>
      </Stack>
      {onToday && (
        <Button size="small" variant="outlined" startIcon={<Today />} onClick={onToday}>
          오늘로
        </Button>
      )}
    </Stack>
  )
}
