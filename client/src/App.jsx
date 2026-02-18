import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from './store/productSlice';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchUserDetails();
        if (userData?.data) {
          dispatch(setUserDetails(userData.data));
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch user data');
      }
    };

    const fetchCategory = async () => {
      try {
        dispatch(setLoadingCategory(true));
        const response = await Axios({ ...SummaryApi.getCategory });
        const { data: responseData } = response;

        if (responseData.success) {
          dispatch(setAllCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name))));
        }
      } catch (err) {
        console.error(err);
        console.warn('Failed to fetch categories');
      } finally {
        dispatch(setLoadingCategory(false));
      }
    };

    const fetchSubCategory = async () => {
      try {
        const response = await Axios({ ...SummaryApi.getSubCategory });
        const { data: responseData } = response;

        if (responseData.success) {
          dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name))));
        }
      } catch (err) {
        console.error(err);
        console.warn('Failed to fetch subcategories');
      }
    };

    fetchUser();
    fetchCategory();
    fetchSubCategory();
  }, [dispatch]);

  return (
    <GlobalProvider>
      <Header shopName="shopme" /> {/* Pass shop name for branding */}
      <main className="min-h-[78vh]">
        <Outlet />
      </main>
      <Footer shopName="shopme" /> {/* Pass shop name for branding */}
      <Toaster />
      {location.pathname !== '/checkout' && <CartMobileLink />}
    </GlobalProvider>
  );
}

export default App;
