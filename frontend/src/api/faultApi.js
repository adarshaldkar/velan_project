import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getLatestFault = () => API.get('/faults/latest');
export const getAllFaults   = () => API.get('/faults');
export const postFault      = (data) => API.post('/fault', data);
