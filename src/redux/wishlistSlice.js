import { createSlice } from "@reduxjs/toolkit";
import { SESSION_KEYS } from "utils/constant";
import { getSessionItem, setSessionItem } from "utils/session";

const normalizeIds = (ids = []) => [
  ...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)),
];

const initialState = {
  ids: normalizeIds(getSessionItem(SESSION_KEYS.WISHLIST_IDS, [])),
};

const persistIds = (ids) => {
  setSessionItem(SESSION_KEYS.WISHLIST_IDS, ids);
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.ids = normalizeIds(action.payload);
      persistIds(state.ids);
    },
    addToWishlist: (state, action) => {
      state.ids = normalizeIds([...state.ids, action.payload]);
      persistIds(state.ids);
    },
    removeFromWishlist: (state, action) => {
      const productId = Number(action.payload);
      state.ids = state.ids.filter((id) => id !== productId);
      persistIds(state.ids);
    },
  },
});

export const { addToWishlist, removeFromWishlist, setWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
