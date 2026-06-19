import { useEffect } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useProfileStore } from '../store/profileStore'
import { useAssetStore } from '../store/assetStore'
import { useLocaleStore } from '../store/localeStore'
import { useUIStore } from '../store/uiStore'
import { fetchExchangeRate } from '../server/portfolio'
import Toaster from '../components/ui/Toaster'

const queryClient = new QueryClient()

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'WealthMind · Investment portfolio manager',
      },
      {
        name: 'description',
        content:
          'Track your investment portfolio — stocks, REITs, crypto, ETFs and more — with allocation charts and JSON export/import.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

// Fetches exchange rate once per session (10-min stale) and syncs to locale store
function ExchangeRateSync() {
  const { data } = useQuery({
    queryKey: ['exchange-rate'],
    queryFn: () => fetchExchangeRate(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (data?.rate) useLocaleStore.getState().setExchangeRate(data.rate)
  }, [data])

  return null
}

function RootLayout() {
  const { theme } = useUIStore()

  useEffect(() => {
    useProfileStore.getState().load()
    useAssetStore.getState().load()
  }, [])

  // Apply theme attribute on mount and whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <ExchangeRateSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
