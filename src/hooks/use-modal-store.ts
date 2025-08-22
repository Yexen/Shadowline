
import { create } from 'zustand';
import { BibleEntry } from './use-bible';
import { Chapter, Volume, ResourcePage } from './use-volumes';

export type ModalType = 'bible' | 'chapter' | 'overview' | 'resources';

interface BibleModalData {
    category: string;
    entry: BibleEntry;
}

interface ChapterModalData {
    volumeId: string;
    chapter: Chapter | null;
}

interface OverviewModalData {
    volume: Volume;
}

interface ResourcesModalData {
    volume: Volume;
}

interface ModalData {
    bible?: BibleModalData;
    chapter?: ChapterModalData;
    overview?: OverviewModalData;
    resources?: ResourcesModalData;
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
