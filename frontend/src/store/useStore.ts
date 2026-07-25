import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  college_id?: string;
  gender?: string;
  skills?: string[];
  study_year?: number;
}

export interface Message {
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

interface StoreState {
  token: string | null;
  user: User | null;
  teamId: string | null;
  isLeader: boolean;
  chatMessages: Message[];
  
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setTeam: (teamId: string | null, isLeader: boolean) => void;
  addChatMessage: (msg: Message) => void;
  clearChat: () => void;
}

export const useStore = create<StoreState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
  teamId: null,
  isLeader: false,
  chatMessages: [],
  
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ token: null, user: null, teamId: null, isLeader: false, chatMessages: [] });
  },
  setTeam: (teamId, isLeader) => set({ teamId, isLeader }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
}));
