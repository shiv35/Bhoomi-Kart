// Constants for GreenCart application
export const GREENCART_BASE_PATH = '/greencart';

// Route constants
export const ROUTES = {
  HOME: GREENCART_BASE_PATH,
  DASHBOARD: `${GREENCART_BASE_PATH}/dashboard`,
  PRODUCTS: `${GREENCART_BASE_PATH}/products`,
  CART: `${GREENCART_BASE_PATH}/cart`,
  CHECKOUT: `${GREENCART_BASE_PATH}/checkout`,
  LOGIN: `${GREENCART_BASE_PATH}/login`,
  SIGNUP: `${GREENCART_BASE_PATH}/signup`,
  PROFILE: `${GREENCART_BASE_PATH}/profile`,
  ORDERS: `${GREENCART_BASE_PATH}/orders`,
  GROUP_BUY: `${GREENCART_BASE_PATH}/group-buy`,
  CALCULATOR: `${GREENCART_BASE_PATH}/calculator`,
  EARTHSCORE: `${GREENCART_BASE_PATH}/earthscore`,
  AI_OPTIMIZATION: `${GREENCART_BASE_PATH}/ai-optimization`,
  CARBON_TRACKING: `${GREENCART_BASE_PATH}/carbon-tracking`,
  CART_DETAIL: `${GREENCART_BASE_PATH}/cart-detail`,
  SETTINGS: `${GREENCART_BASE_PATH}/settings`,
} as const; 