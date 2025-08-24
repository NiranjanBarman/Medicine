import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGenericStore = create(
  persist(
    (set) => ({
      generics: [], // Initial empty array for generics

      // Action to add a new generic
      addGeneric: (newGeneric) => {
        set((state) => {
          // Assign a unique ID if not already present
          const genericToAdd = { ...newGeneric, id: newGeneric.id || crypto.randomUUID() };
          return { generics: [...state.generics, genericToAdd] };
        });
        console.log('Generic added:', newGeneric);
      },

      // Action to update an existing generic
      updateGeneric: (updatedGeneric) => {
        set((state) => ({
          generics: state.generics.map((generic) =>
            generic.id === updatedGeneric.id ? updatedGeneric : generic
          ),
        }));
        console.log('Generic updated:', updatedGeneric);
      },

      // Action to delete a generic by ID
      deleteGeneric: (genericId) => {
        set((state) => ({
          generics: state.generics.filter((generic) => generic.id !== genericId),
        }));
        console.log('Generic deleted:', genericId);
      },

      // Action to initialize generics (e.g., if loading from API)
      setGenerics: (genericsArray) => set({ generics: genericsArray }),
    }),
    {
      name: 'generic-storage', // unique name for localStorage
    }
  )
);

export default useGenericStore;