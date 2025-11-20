export interface BasketItem {
  id: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  badge_id?: number;
}

export interface State {
  basket: BasketItem[];
  history: BasketItem[];
}

export type Action =
  | { type: 'ADD_TO_BASKET'; item: BasketItem }
  | { type: 'REMOVE_FROM_BASKET'; id: string }
  | { type: 'ADD_TO_HISTORY'; items: BasketItem[] }
  | { type: 'CLEAR_BASKET' };