import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { app } from "@tauri-apps/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { exitApp } from "tauri-plugin-app-exit-api"

export interface IExitDialogProps {
  onCancel?: () => void
}

export function ExitDialog({ onCancel }: IExitDialogProps) {
  const [appName, setAppName] = useState("")
  const [openDialog, setOpenDialog] = useState<boolean>(true)

  useEffect(() => {
    app.getName().then((result) => {
      setAppName(result)
    })
  }, [])

  return (
    <AlertDialog open={openDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{appName}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure want to exit?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setOpenDialog(false)
              toast.loading("closing app...", {
                dismissible: false,
              })
              setTimeout(() => {
                exitApp(0)
              }, 2000)
            }}
          >
            Exit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
