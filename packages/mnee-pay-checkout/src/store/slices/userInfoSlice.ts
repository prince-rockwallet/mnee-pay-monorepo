import { StateCreator } from 'zustand';
import { StoreState, UserInfo, UserSlice } from '../types';

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