import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, //Borren esto, la URL del .env del front es: VITE_API_URL=http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api