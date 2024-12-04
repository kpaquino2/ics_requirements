import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Settings {
  show_arrows: boolean;
  animate: boolean;
  show_select: boolean;
  ignore_units: boolean;
  ignore_reqs: boolean;
  ignore_offer: boolean;
}
interface ConstantsState {
  zoom: number;
  courseCount: number;
  focusedLine: string;
  lines: Map<string, [number, number, number, number, number, number, number]>;
  settings: Settings;
}

interface ConstantsActions {
  setZoom: (p: number) => void;
  setCourseCount: (n: number) => void;
  setFocusedLine: (id: string) => void;
  setSettings: (s: Settings | null) => void;
  resetConstants: () => void;
}

const initialState: ConstantsState = {
  zoom: 100,
  courseCount: 1,
  focusedLine: "",
  lines: new Map(),
  settings: {
    show_arrows: true,
    animate: true,
    show_select: true,
    ignore_units: false,
    ignore_reqs: false,
    ignore_offer: true,
  },
};

const useConstantsStore = create<ConstantsState & ConstantsActions>()(
  persist(
    (set) => ({
      ...initialState,
      setZoom: (p) => set({ zoom: p, focusedLine: "" }),
      setCourseCount: (n) => set({ courseCount: n }),
      setFocusedLine: (id) => set({ focusedLine: id }),
      setSettings: (s) => set({ settings: s ? s : initialState.settings }),
      resetConstants: () => set(initialState),
    }),
    {
      name: "const-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name) || "";
          return {
            state: {
              ...JSON.parse(str).state,
              lines: new Map(JSON.parse(str).state.lines),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              lines: Array.from(newValue.state.lines.entries()),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);

export { useConstantsStore };
