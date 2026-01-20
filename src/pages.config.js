import DSPReport from './pages/DSPReport';
import Dashboard from './pages/Dashboard';
import Processing from './pages/Processing';
import Reports from './pages/Reports';
import SubjectIntake from './pages/SubjectIntake';
import SubjectReview from './pages/SubjectReview';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DSPReport": DSPReport,
    "Dashboard": Dashboard,
    "Processing": Processing,
    "Reports": Reports,
    "SubjectIntake": SubjectIntake,
    "SubjectReview": SubjectReview,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};