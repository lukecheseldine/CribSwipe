import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { DiscoverError, DiscoverLoading, DiscoverPage } from '../pages/DiscoverPage'
import { ListingError, ListingLoading, ListingPage } from '../pages/ListingPage'
import { ShortlistPage } from '../pages/ShortlistPage'
import { discoverLoader, listingLoader } from './loaders'
import { paths } from './paths'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: paths.discover,
        loader: discoverLoader,
        element: <DiscoverPage />,
        hydrateFallbackElement: <DiscoverLoading />,
        errorElement: <DiscoverError />,
      },
      { path: paths.shortlist, element: <ShortlistPage /> },
      {
        path: paths.listing,
        loader: listingLoader,
        element: <ListingPage />,
        hydrateFallbackElement: <ListingLoading />,
        errorElement: <ListingError />,
      },
      { path: paths.account, element: <ComingSoonPage title="Account" /> },
      { path: '*', element: <Navigate to={paths.discover} replace /> },
    ],
  },
])
