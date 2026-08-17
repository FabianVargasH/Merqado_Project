import { defineStore } from 'pinia'
import { apiRequest } from '../services/api'

// Store de ubicaciones de Costa Rica (provincias, cantones, distritos).
//
// why: los datos vienen de la API pública de CR a través del backend, para poblar
// en cascada los <select> de envío con provincia → cantón → distrito reales.
export const useUbicacionesStore = defineStore('ubicaciones', {
  state: () => ({
    provincias: [],
  }),

  actions: {
    async cargarProvincias() {
      if (this.provincias.length) return this.provincias
      const { provincias } = await apiRequest('/locations/provincias')
      this.provincias = provincias
      return provincias
    },
    async cantones(provinciaId) {
      const { cantones } = await apiRequest(`/locations/provincia/${provinciaId}/cantones`)
      return cantones
    },
    async distritos(provinciaId, cantonId) {
      const { distritos } = await apiRequest(`/locations/provincia/${provinciaId}/canton/${cantonId}/distritos`)
      return distritos
    },
  },
})
