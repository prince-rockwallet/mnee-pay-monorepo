import { StateCreator } from 'zustand';
import { ShippingAddress, ContactInfo } from '../../types';

export interface UserInfo {
  shipping?: ShippingAddress;
  contact: ContactInfo;
}

export interface UserSlice {
  user: {
    userInfo: UserInfo;
    setEmail: (email?: string) => void;
    setPhone: (phone?: string) => void;
    setShipping: (shipping: ShippingAddress) => void;
    setContact: (contact: ContactInfo) => void;
    clearUserInfo: () => void;
  };
}

const initialUserInfo: UserInfo = {
  shipping: undefined,
  contact: {
    email: undefined,
    phone: undefined,
  },
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: {
    userInfo: initialUserInfo,

    setEmail: (email) =>
      set((state) => ({
        user: {
          ...state.user,
          userInfo: {
            ...state.user.userInfo,
            contact: {
              ...state.user.userInfo.contact,
              email,
            },
          },
        },
      })),

    setPhone: (phone) =>
      set((state) => ({
        user: {
          ...state.user,
          userInfo: {
            ...state.user.userInfo,
            contact: {
              ...state.user.userInfo.contact,
              phone,
            },
          },
        },
      })),

    setShipping: (shipping) =>
      set((state) => ({
        user: {
          ...state.user,
          userInfo: {
            ...state.user.userInfo,
            shipping,
          },
        },
      })),

    setContact: (contact) =>
      set((state) => ({
        user: {
          ...state.user,
          userInfo: {
            ...state.user.userInfo,
            contact,
          },
        },
      })),

    clearUserInfo: () =>
      set((state) => ({
        user: {
          ...state.user,
          userInfo: initialUserInfo,
        },
      })),
  },
});