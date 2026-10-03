import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface Options {
  title?: string
  confirmText?: string
}
type Ask = (message: string, options?: Options) => Promise<boolean>

const ConfirmContext = createContext<Ask>(async () => false)

export const useConfirm = () => useContext(ConfirmContext)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ open: false, message: '', title: '', confirmText: '' })
  const resolver = useRef<(v: boolean) => void>(() => {})

  const ask = useCallback<Ask>(
    (message, options) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve
        setState({
          open: true,
          message,
          title: options?.title ?? '확인',
          confirmText: options?.confirmText ?? '확인',
        })
      }),
    [],
  )

  const close = (value: boolean) => {
    resolver.current(value)
    setState((s) => ({ ...s, open: false }))
  }

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      <Dialog open={state.open} onClose={() => close(false)} fullWidth maxWidth="xs">
        <DialogTitle>{state.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{state.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => close(false)}>취소</Button>
          <Button color="error" onClick={() => close(true)}>
            {state.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
