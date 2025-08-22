
import { create } from 'zustand';
import { BibleEntry } from './use-bible';
import { Chapter } from './use-volumes';

export type ModalType = 'bible' | 'chapter';

interface BibleModalData {
    category: string;
    entry: BibleEntry;
}

interface ChapterModalData {
    volumeId: string;
    chapter: Chapter;
}

interface ModalData {
    bible?: BibleModalData;
    chapter?: ChapterModalData;
}

interface ModalStore {
    modalType: ModalType | null;
    modalData: ModalData | null;
    isOpen: boolean;
    openModal: (type: ModalType, data: any) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    modalType: null,
    modalData: null,
    isOpen: false,
    openModal: (type, data) => set({ isOpen: true, modalType: type, modalData: { [type]: data } }),
    closeModal: () => set({ modalType: null, isOpen: false, modalData: null }),
}));
