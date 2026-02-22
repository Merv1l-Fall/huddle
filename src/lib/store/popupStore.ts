import {create} from 'zustand';

interface PopupState {
  isOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  isOpen: false,
  openPopup: () => set({ isOpen: true }),
  closePopup: () => set({ isOpen: false }),
}));