import Dashboard from './pages/Dashboard';
import SubjectIntake from './pages/SubjectIntake';
import Processing from './pages/Processing';
import SubjectReview from './pages/SubjectReview';
import DSPReport from './pages/DSPReport';
import Reports from './pages/Reports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "SubjectIntake": SubjectIntake,
    "Processing": Processing,
    "SubjectReview": SubjectReview,
    "DSPReport": DSPReport,
    "Reports": Reports,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};