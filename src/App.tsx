import { ThemeProvider } from "@/components/theme-provider"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { ExpandableTabs } from "@/components/expendable-tabs"
import { Newspaper, Settings, Wrench } from "lucide-react"
import { Grid, Row, Col } from "react-flexbox-grid"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

import HomePage from "@/pages/HomePage"
import { useState } from "react"
import { ExitDialog } from "@/components/exit-dialog"
import UtilityPage from "@/pages/UtilityPage"
import NewsPage from "@/pages/NewsPage"
import SettingsPage from "@/pages/SettingsPage"

type Props = {
  children?: React.ReactNode
}

function App({ children }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showExitDialog, setShowExitDialog] = useState(false)

  const handleExitPress = () => {
    setShowExitDialog(true)
  }

  const tabs = [
    {
      title: "Utilities",
      icon: Wrench,
      path: "/",
    },
    {
      title: "Update",
      icon: Newspaper,
      path: "/news",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ]

  const tabsHandler = ({ index }: { index: number }) => {
    const selectedTab = tabs[index]
    if (selectedTab?.path) {
      navigate(selectedTab.path)
    }
  }

  const activeIndex = tabs.findIndex((tab) => tab.path === location.pathname)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="relative">
        <Grid fluid>
          <Row>
            <Col xs={12}>
              {children}

              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/utility/:name" element={<UtilityPage />} />
              </Routes>
            </Col>
          </Row>
        </Grid>

        <ExpandableTabs
          tabs={tabs}
          activeColor="text-blue-500"
          defaultActiveIndex={activeIndex}
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
            "backdrop-blur-md bg-background/40",
            "border border-white/10 shadow-xl",
            "justify-center w-2xs px-4 py-2"
          )}
          onChange={(index) => {
            if (index !== null) tabsHandler({ index })
          }}
          onExitPressed={handleExitPress}
        />

        {showExitDialog && (
          <ExitDialog
            onCancel={() => {
              setShowExitDialog(false)
            }}
          />
        )}

        <Toaster />
      </main>
    </ThemeProvider>
  )
}

export default App
