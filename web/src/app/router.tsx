import { createBrowserRouter, Navigate } from 'react-router'
import { getListings } from '../api/listings'
import { AppLayout } from '../components/layout/AppLayout'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { DiscoverError, DiscoverLoading, DiscoverPage } from '../pages/DiscoverPage'
import { paths } from './paths'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: paths.discover,
        loader: getListings,
        element: <DiscoverPage />,
        hydrateFallbackElement: <DiscoverLoading />,
        errorElement: <DiscoverError />,
      },
      { path: paths.shortlist, element: <ComingSoonPage title="Your shortlist" /> },
      { path: paths.account, element: <ComingSoonPage title="Account" /> },
      { path: '*', element: <Navigate to={paths.discover} replace /> },
    ],
  },
])
