import { create } from 'zustand'

export const useAdminStore = create((set) => ({
  productTotal: 0,

  setProductTotal: (count) =>
    set({ productTotal: count }),

  incrementProductTotal: () =>
    set((state) => ({
      productTotal: state.productTotal + 1
    })),

  decrementProductTotal: () =>
    set((state) => ({
      productTotal: Math.max(0, state.productTotal - 1)
    }))
}))