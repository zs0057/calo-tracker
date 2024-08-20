import { create } from "zustand";

interface BearState {
  totalCalories: number;
  setTotalCalories: (totalCalories: number) => void;
}

const useStore = create<BearState>((set) => ({
  totalCalories: 0,
  setTotalCalories: (totalCalories: number) => set({ totalCalories }),
}));

export default useStore;
