import { StateCreator } from 'zustand';
import { ShippingAddress, ContactInfo } from '../../types';
import { StoreState } from '..';

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

export const createUserSlice: StateCreator<
  StoreState, 
  [["zustand/immer", never], ["zustand/devtools", never]], 
  [], 
  UserSlice
> = (set) => ({
  user: {
    userInfo: initialUserInfo,

    setEmail: (email) =>
      set((state) => {
        state.user.userInfo.contact.email = email;
      }),

    setPhone: (phone) =>
      set((state) => {
        state.user.userInfo.contact.phone = phone;
      }),

    setShipping: (shipping) =>
      set((state) => {
        state.user.userInfo.shipping = shipping;
      }),

    setContact: (contact) =>
      set((state) => {
        state.user.userInfo.contact = contact;
      }),

    clearUserInfo: () =>
      set((state) => {
        state.user.userInfo = initialUserInfo;
      }),
  },
});