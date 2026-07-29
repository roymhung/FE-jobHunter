import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import Loading from 'components/share/loading';
import LoginPage from 'pages/auth/login';
import ForgotPasswordPage from 'pages/auth/forgot.password';
import ResetPasswordPage from 'pages/auth/reset.password';
import OAuthCallbackPage from 'pages/auth/oauth.callback';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Header from 'components/client/header.client';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import CompanyPage from './pages/admin/company';
import PermissionPage from './pages/admin/permission';
import ResumePage from './pages/admin/resume';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import ViewUpsertJob from './components/admin/job/upsert.job';
import ClientJobPage from './pages/job';
import ClientJobDetailPage from './pages/job/detail';
import ClientCompanyPage from './pages/company';
import ClientCompanyDetailPage from './pages/company/detail';
import JobTabs from './pages/admin/job/job.tabs';
import InterviewLandingPage from './pages/interview/landing';
import InterviewPracticePage from './pages/interview/practice';
import InterviewSetupPage from './pages/interview/setup';
import InterviewReadyPage from './pages/interview/ready';
import InterviewExamPage from './pages/interview/exam';
import InterviewResultPage from './pages/interview/result';
import InterviewRequireAuth from './components/client/interview/require-auth';
import AdminInterviewOrdersPage from './pages/admin/interview-orders';
import AdminInterviewQuestionsPage from './pages/admin/interview-questions';

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [location]);

  return (
    <div className={styles['layout-app']} ref={rootRef}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);


  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
      || window.location.pathname === '/forgot-password'
      || window.location.pathname === '/reset-password'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "job", element: <ClientJobPage /> },
        { path: "job/:id", element: <ClientJobDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
        { path: "interview", element: <InterviewLandingPage /> },
        {
          path: "interview/setup",
          element: (
            <InterviewRequireAuth>
              <InterviewSetupPage />
            </InterviewRequireAuth>
          ),
        },
        {
          path: "interview/practice",
          element: (
            <InterviewRequireAuth>
              <InterviewPracticePage />
            </InterviewRequireAuth>
          ),
        },
        {
          path: "interview/ready",
          element: (
            <InterviewRequireAuth>
              <InterviewReadyPage />
            </InterviewRequireAuth>
          ),
        },
        {
          path: "interview/exam",
          element: (
            <InterviewRequireAuth>
              <InterviewExamPage />
            </InterviewRequireAuth>
          ),
        },
        {
          path: "interview/result",
          element: (
            <InterviewRequireAuth>
              <InterviewResultPage />
            </InterviewRequireAuth>
          ),
        },
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "company",
          element:
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },

        {
          path: "job",
          children: [
            {
              index: true,
              element: <ProtectedRoute><JobTabs /></ProtectedRoute>
            },
            {
              path: "upsert", element:
                <ProtectedRoute><ViewUpsertJob /></ProtectedRoute>
            }
          ]
        },

        {
          path: "resume",
          element:
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        },
        {
          path: "interview-orders",
          element:
            <ProtectedRoute>
              <AdminInterviewOrdersPage />
            </ProtectedRoute>
        },
        {
          path: "interview-questions",
          element:
            <ProtectedRoute>
              <AdminInterviewQuestionsPage />
            </ProtectedRoute>
        }
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/login/oauth/callback",
      element: <OAuthCallbackPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },

    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
    },

    {
      path: "/reset-password",
      element: <ResetPasswordPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}