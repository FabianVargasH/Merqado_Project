import { apiRequest } from './api'

export const addressesApi = {
  list: () => apiRequest('/users/me/addresses'),
  create: (address) => apiRequest('/users/me/addresses', { method: 'POST', body: JSON.stringify(address) }),
  update: (id, changes) => apiRequest(`/users/me/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  remove: (id) => apiRequest(`/users/me/addresses/${id}`, { method: 'DELETE' }),
}
