import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  college_id?: string;
  gender?: string;
  skills?: string[];
  study_year?: number;
  team_id?: string;
  is_leader?: boolean;
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
  hydrateAuth: () => void;
}

export const useStore = create<StoreState>((set) => ({
  token: null,
  user: null,
  teamId: null,
  isLeader: false,
  chatMessages: [],
  
  hydrateAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        set({ token });
        // NOTE: User object hydration requires another mechanism or a /me fetch.
        // Usually, the app fetches user details if token exists.
      }
    }
  },
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    set({ 
      token, 
      user,
      teamId: user?.team_id || null,
      isLeader: user?.is_leader || false
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ token: null, user: null, teamId: null, isLeader: false, chatMessages: [] });
  },
  setTeam: (teamId, isLeader) => set({ teamId, isLeader }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
}));
