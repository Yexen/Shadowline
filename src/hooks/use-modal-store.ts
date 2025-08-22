
import { create } from 'zustand';
import { BibleEntry } from './use-bible';

export type ModalType = 'bible' | 'volume' | 'chapter' | 'overview' | 'resources';

interface BibleModalData {
    category: string;
    entry: BibleEntry;
}

interface VolumeModalData {
    id: string;
}

interface ChapterModalData {
    volumeId: string;
    chapterId: string;
}

interface OverviewModalData {
    id: string;
}

interface ResourcesModalData {
    id: string;
}

interface ModalData {
    bible?: BibleModalData;
    volume?: VolumeModalData;
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
