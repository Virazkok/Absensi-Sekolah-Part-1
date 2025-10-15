import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // ini mengarah ke Laravel
  withCredentials: true,            // wajib agar sanctum bisa pakai cookie
});

export default api;
