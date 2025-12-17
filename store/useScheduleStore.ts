import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ScheduleItem, ScheduleType } from '../types';
import { parseExcelFile, exportExcelFile } from '../services/excelService';

interface StoreState {
  exams: ScheduleItem[];
  makeups: ScheduleItem[];
  isLoading: boolean;
  
  // Actions
  addEntry: (type: ScheduleType, item: ScheduleItem) => void;
  deleteEntry: (type: ScheduleType, id: string) => void;
  updateEntry: (type: ScheduleType, item: ScheduleItem) => void;
  importFromExcel: (file: File) => Promise<void>;
  exportToExcel: () => void;
  reset: () => void;
}

export const useScheduleStore = create<StoreState>()(
  persist(
    (set, get) => ({
      exams: [],
      makeups: [],
      isLoading: false,

      addEntry: (type, item) => set((state) => ({
        [type === 'exam' ? 'exams' : 'makeups']: [
          ...(type === 'exam' ? state.exams : state.makeups),
          item
        ]
      })),

      deleteEntry: (type, id) => set((state) => ({
        [type === 'exam' ? 'exams' : 'makeups']: (type === 'exam' ? state.exams : state.makeups).filter(i => i.id !== id)
      })),

      updateEntry: (type, item) => set((state) => ({
        [type === 'exam' ? 'exams' : 'makeups']: (type === 'exam' ? state.exams : state.makeups).map(i => i.id === item.id ? item : i)
      })),

      importFromExcel: async (file) => {
        set({ isLoading: true });
        try {
          const { exams, makeups } = await parseExcelFile(file);
          // If the imported file has data, replace current state. 
          // Strategy: Append or Replace? Prompt usually implies management, let's Replace for clean sync.
          set({ exams, makeups, isLoading: false });
        } catch (error) {
          console.error("Import failed", error);
          set({ isLoading: false });
          alert("Failed to parse Excel file. Please ensure format is correct.");
        }
      },

      exportToExcel: () => {
        const { exams, makeups } = get();
        exportExcelFile(exams, makeups);
      },

      reset: () => set({ exams: [], makeups: [] }),
    }),
    {
      name: 'academic-schedule-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);