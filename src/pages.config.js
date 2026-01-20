import Dashboard from './pages/Dashboard';
import SubjectIntake from './pages/SubjectIntake';
import Processing from './pages/Processing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "SubjectIntake": SubjectIntake,
    "Processing": Processing,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};