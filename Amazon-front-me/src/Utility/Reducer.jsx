import { Type } from './ActionType';

const BASKET_STORAGE_PREFIX = "basket_";
const LEGACY_BASKET_KEY = "basket";
const GUEST_BASKET_KEY = `${BASKET_STORAGE_PREFIX}guest`;

const getBasketStorageKey = (user) =>
  user?.uid ? `${BASKET_STORAGE_PREFIX}${user.uid}` : GUEST_BASKET_KEY;

const readBasket = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeBasket = (key, basket) => {
  localStorage.setItem(key, JSON.stringify(basket));
};

const loadInitialBasket = () => {
  const guestBasket = readBasket(GUEST_BASKET_KEY);
  if (guestBasket.length > 0) {
    return guestBasket;
  }

  const legacyBasket = readBasket(LEGACY_BASKET_KEY);
  if (legacyBasket.length > 0) {
    writeBasket(GUEST_BASKET_KEY, legacyBasket);
    return legacyBasket;
  }

  return [];
};

export const initialState = {
  basket: loadInitialBasket(),
  user: null,
  authLoading: true,
  wishlist: [],
  theme: localStorage.getItem('theme') || 'light'
};

export const reducer = (state, action) => {
  switch (action.type) {

    case Type.ADD_TO_BASKET: {
      const existingItem = state.basket.find(
        item => item.id === action.item.id
      );

      let newBasket;
      if (existingItem) {
        newBasket = state.basket.map(item =>
          item.id === action.item.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newBasket = [...state.basket, { ...action.item, quantity: 1 }];
      }

      writeBasket(getBasketStorageKey(state.user), newBasket);
      return {
        ...state,
        basket: newBasket
      };
    }

    case Type.DECREASE_QUANTITY: {
      const newBasket = state.basket
        .map(item =>
          item.id === action.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0);
      
      writeBasket(getBasketStorageKey(state.user), newBasket);
      return {
        ...state,
        basket: newBasket
      };
    }
    
    case Type.SET_USER: {
      const nextBasket = readBasket(getBasketStorageKey(action.user));
      return {
        ...state,
        user: action.user,
        basket: nextBasket
      };
    }
    
    case Type.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.status
      }

    case Type.EMPTY_BASKET:
      localStorage.removeItem(getBasketStorageKey(state.user));
      localStorage.removeItem(LEGACY_BASKET_KEY);
      return {
        ...state,
        basket: []
      }
    
    case Type.ADD_TO_WISHLIST: {
      const exists = state.wishlist.find(item => item.id === action.item.id);
      if (exists) return state;
      return {
        ...state,
        wishlist: [...state.wishlist, action.item]
      };
    }

    case Type.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id === action.id)
      };
    
    case Type.TOGGLE_THEME: {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return {
        ...state,
        theme: newTheme
      };
    }
    
    default:
      return state;
  }
};
