import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/api/";

export const login = async (email, password) => {
    // backend login endpoint returns { token, user }
    const response = await axios.post(API_URL + 'login/', { email, password });
    if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
};

export const register = async (username, email, password) => {
    const response = await axios.post(API_URL + 'register/', { username, email, password });
    if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return {};
    return { Authorization: `Token ${token}` };
};

export const logout = () => {
    localStorage.removeItem('auth_token');
};
