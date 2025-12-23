import { StateCreator } from 'zustand';
import { StoreState, UserSlice, UserState } from '../types';

const initialUserInfo: UserState = {
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
  user: initialUserInfo,
  userActions: {
    setEmail: (email) =>
      set((state) => {
        state.user.contact.email = email;
      }),

    setPhone: (phone) =>
      set((state) => {
        state.user.contact.phone = phone;
      }),

    setShipping: (shipping) =>
      set((state) => {
        state.user.shipping = shipping;
      }),

    setContact: (contact) =>
      set((state) => {
        state.user.contact = contact;
      }),

    clearUserInfo: () =>
      set((state) => {
        state.user = initialUserInfo;
      }),
  },
});