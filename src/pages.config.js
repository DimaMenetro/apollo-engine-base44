import Dashboard from './pages/Dashboard';
import SubjectIntake from './pages/SubjectIntake';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "SubjectIntake": SubjectIntake,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};