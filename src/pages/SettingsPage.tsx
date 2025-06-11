import { Card, CardContent } from "@/components/ui/card"
import { openUrl } from "@tauri-apps/plugin-opener"

const SettingsPage = () => {
  const goto = (url: string) => {
      openUrl(url)
    }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardContent>
          <p>
            This feature is currently under development. You can contribute to
            this project by visiting the project repository at{" "}
            <span
              className="hover:cursor-pointer hover:text-blue-400 text-blue-500"
              onClick={() => goto("https://github.com/decryptable")}
            >
              @decryptable/utility-app
            </span>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
