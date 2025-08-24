import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useManufacturerStore = create(
  persist(
    (set) => ({
      manufacturers: [], // Initial empty array for manufacturers

      // Action to add a new manufacturer
      addManufacturer: (newManufacturer) => {
        set((state) => {
          // Assign a unique ID if not already present
          const manufacturerToAdd = { ...newManufacturer, id: newManufacturer.id || crypto.randomUUID() };
          return { manufacturers: [...state.manufacturers, manufacturerToAdd] };
        });
        console.log('Manufacturer added:', newManufacturer);
      },

      // Action to update an existing manufacturer
      updateManufacturer: (updatedManufacturer) => {
        set((state) => ({
          manufacturers: state.manufacturers.map((manufacturer) =>
            manufacturer.id === updatedManufacturer.id ? updatedManufacturer : manufacturer
          ),
        }));
        console.log('Manufacturer updated:', updatedManufacturer);
      },

      // Action to delete a manufacturer by ID
      deleteManufacturer: (manufacturerId) => {
        set((state) => ({
          manufacturers: state.manufacturers.filter((manufacturer) => manufacturer.id !== manufacturerId),
        }));
        console.log('Manufacturer deleted:', manufacturerId);
      },

      // Action to initialize manufacturers (e.g., if loading from API)
      setManufacturers: (manufacturersArray) => set({ manufacturers: manufacturersArray }),
    }),
    {
      name: 'manufacturer-storage', // unique name for localStorage
    }
  )
);

export default useManufacturerStore;