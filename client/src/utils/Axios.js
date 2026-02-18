import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";
import toast from "react-hot-toast";

// Backend base URL (from env or fallback)
const backendURL = baseURL || "http://localhost:8000";

// Main axios instance used across the app
const Axios = axios.create({
    baseURL: backendURL,
    withCredentials: true
});

// Separate client for auth refresh requests to avoid interceptor loops
const authClient = axios.create({
    baseURL: backendURL,
    withCredentials: true
});

// Attach access token if available
Axios.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accesstoken');
        if (accessToken) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${accessToken}` };
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle responses: network errors, 401 refresh flow and toast messages
Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originRequest = error.config || {};

        // Network error (no response)
        if (!error.response) {
            console.warn('Network error: please check your connection.');
            return Promise.reject(error);
        }

        const status = error.response.status;

        // Try refreshing the token on 401 once
        if (status === 401 && !originRequest._retry) {
            originRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const resp = await authClient({
                        url: SummaryApi.refreshToken.url,
                        method: SummaryApi.refreshToken.method,
                        headers: { Authorization: `Bearer ${refreshToken}` }
                    });

                    const accessToken = resp?.data?.data?.accessToken;
                    if (accessToken) {
                        localStorage.setItem('accesstoken', accessToken);
                        originRequest.headers = { ...(originRequest.headers || {}), Authorization: `Bearer ${accessToken}` };
                        return Axios(originRequest);
                    }
                } catch (err) {
                    localStorage.removeItem('accesstoken');
                    localStorage.removeItem('refreshToken');
                    toast.error('Session expired. Please log in again.');
                    return Promise.reject(err);
                }
            } else {
                toast.error('Authentication required. Please log in.');
            }
        }

        // Show server-sent error message if available
        const message = error.response.data?.message || error.message || 'API error';
        toast.error(message);
        return Promise.reject(error);
    }
);

export default Axios;
