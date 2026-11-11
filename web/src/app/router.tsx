import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { AccountFiltersPage } from '../pages/AccountFiltersPage'
import { AccountPage } from '../pages/AccountPage'
import { AccountPrivacyPage } from '../pages/AccountPrivacyPage'
import { AccountProfilePage } from '../pages/AccountProfilePage'
import { DiscoverError, DiscoverLoading, DiscoverPage } from '../pages/DiscoverPage'
import { FiltersError, FiltersLoading, FiltersPage } from '../pages/FiltersPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ListingError, ListingLoading, ListingPage } from '../pages/ListingPage'
import { LoginPage } from '../pages/LoginPage'
import { PrivacyPage } from '../pages/PrivacyPage'
import { ShortlistPage } from '../pages/ShortlistPage'
import { SignupPage } from '../pages/SignupPage'
import { TermsPage } from '../pages/TermsPage'
import {
  accountLoader,
  discoverLoader,
  filtersLoader,
  listingLoader,
  loginLoader,
  sessionLoader,
} from './loaders'
import { paths } from './paths'

export const router = createBrowserRouter([
  { path: paths.login, loader: loginLoader, element: <LoginPage /> },
  { path: paths.signup, loader: loginLoader, element: <SignupPage /> },
  { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
  { path: paths.terms, element: <TermsPage /> },
  { path: paths.privacy, element: <PrivacyPage /> },
  {
    element: <AppLayout />,
    loader: sessionLoader,
    children: [
      {
        path: paths.discover,
        loader: discoverLoader,
        element: <DiscoverPage />,
        hydrateFallbackElement: <DiscoverLoading />,
        errorElement: <DiscoverError />,
      },
      {
        path: paths.filters,
        loader: filtersLoader,
        element: <FiltersPage />,
        hydrateFallbackElement: <FiltersLoading />,
        errorElement: <FiltersError />,
      },
      { path: paths.shortlist, element: <ShortlistPage /> },
      {
        path: paths.listing,
        loader: listingLoader,
        element: <ListingPage />,
        hydrateFallbackElement: <ListingLoading />,
        errorElement: <ListingError />,
      },
      {
        id: 'account',
        path: paths.account,
        loader: accountLoader,
        element: <AccountPage />,
        children: [
          { index: true, element: <AccountProfilePage /> },
          { path: 'filters', element: <AccountFiltersPage /> },
          { path: 'privacy', element: <AccountPrivacyPage /> },
        ],
      },
      { path: '*', element: <Navigate to={paths.discover} replace /> },
    ],
  },
])
