"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  discount?: number;
  type: "item" | "package";
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        const totalPrice = updatedItems.reduce(
          (sum, item) =>
            sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
          0
        );
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalPrice,
        };
      }

      const updatedItems = [...state.items, action.payload];
      const totalPrice = updatedItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + action.payload.quantity,
        totalPrice,
      };
    }

    case "REMOVE_ITEM": {
      const itemToRemove = state.items.find(
        (item) => item._id === action.payload
      );
      if (!itemToRemove) return state;

      const updatedItems = state.items.filter(
        (item) => item._id !== action.payload
      );
      const totalPrice = updatedItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_ITEM",
          payload: action.payload.id,
        });
      }

      const itemToUpdate = state.items.find(
        (item) => item._id === action.payload.id
      );
      if (!itemToUpdate) return state;

      const updatedItems = state.items.map((item) =>
        item._id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const totalPrice = updatedItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice,
      };
    }

    case "CLEAR_CART": {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("edwom-cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Dispatch all items from localStorage
          parsedCart.items.forEach((item: CartItem) => {
            dispatch({ type: "ADD_ITEM", payload: item });
          });
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      try {
        localStorage.setItem("edwom-cart", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [state, isHydrated]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast.success(`${item.name} added to cart`);
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
