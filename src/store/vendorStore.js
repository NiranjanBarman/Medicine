// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// const useVendorStore = create(
//   persist(
//     (set) => ({
//       vendors: [], // Initial empty array for vendors

//       // Action to add a new vendor
//       addVendor: (newVendor) => {
//         set((state) => {
//           // Assign a unique ID if not already present (e.g., for new entries)
//           const vendorToAdd = { ...newVendor, id: newVendor.id || crypto.randomUUID() };
//           return { vendors: [...state.vendors, vendorToAdd] };
//         });
//         console.log('Vendor added:', newVendor);
//       },

//       // Action to update an existing vendor
//       updateVendor: (updatedVendor) => {
//         set((state) => ({
//           vendors: state.vendors.map((vendor) =>
//             vendor.id === updatedVendor.id ? updatedVendor : vendor
//           ),
//         }));
//         console.log('Vendor updated:', updatedVendor);
//       },

//       // Action to delete a vendor by ID
//       deleteVendor: (vendorId) => {
//         set((state) => ({
//           vendors: state.vendors.filter((vendor) => vendor.id !== vendorId),
//         }));
//         console.log('Vendor deleted:', vendorId);
//       },

//       // Action to initialize vendors (e.g., if loading from API)
//       setVendors: (vendorsArray) => set({ vendors: vendorsArray }),
//     }),
//     {
//       name: 'vendor-storage', // unique name for localStorage
//     }
//   )
// );

// export default useVendorStore;

// src/store/vendorStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useVendorStore = create(
  persist(
    (set, get) => ({
      vendors: [], // Initial empty array for vendors

      // Action to add a new vendor
      addVendor: (newVendor) => {
        set((state) => {
          const vendorToAdd = { ...newVendor, id: newVendor.id || crypto.randomUUID() };
          return { vendors: [...state.vendors, vendorToAdd] };
        });
        console.log('Vendor added:', newVendor);
      },

      // Action to update an existing vendor
      updateVendor: (updatedVendor) => {
        set((state) => ({
          vendors: state.vendors.map((vendor) =>
            vendor.id === updatedVendor.id ? updatedVendor : vendor
          ),
        }));
        console.log('Vendor updated:', updatedVendor);
      },

      // Action to delete a vendor by ID
      deleteVendor: (vendorId) => {
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== vendorId),
        }));
        console.log('Vendor deleted:', vendorId);
      },

      // Action to get a vendor by their ID (NEWLY ADDED)
      getVendorById: (vendorId) => {
        return get().vendors.find((vendor) => vendor.id === vendorId);
      },

      // Action to initialize vendors (e.g., if loading from API)
      setVendors: (vendorsArray) => set({ vendors: vendorsArray }),
    }),
    {
      name: 'vendor-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useVendorStore;