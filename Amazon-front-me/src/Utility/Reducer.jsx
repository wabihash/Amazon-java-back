import { Type } from './ActionType';

export const initialState = {
  basket: JSON.parse(localStorage.getItem('basket')) || [],
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

      localStorage.setItem('basket', JSON.stringify(newBasket));
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
      
      localStorage.setItem('basket', JSON.stringify(newBasket));
      return {
        ...state,
        basket: newBasket
      };
    }
    
    case Type.SET_USER:
      return {
        ...state,
        user: action.user
      }
    
    case Type.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.status
      }

    case Type.EMPTY_BASKET:
      localStorage.removeItem('basket');
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
