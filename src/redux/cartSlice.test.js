import { describe, expect, it } from "vitest";
import reducer, {
  addProductToCart,
  removeProductFromCart,
} from "./cartSlice";

describe("CartSlice", () => {
  it("adds products, removes products, and calculates totals", () => {
    const apple = { id: 1, name: "Táo", price: 10000 };
    const orange = { id: 2, name: "Cam", price: 20000 };

    let state = reducer(undefined, addProductToCart({ product: apple, quantity: 2 }));
    state = reducer(state, addProductToCart({ product: orange, quantity: 1 }));

    expect(state.cart.products).toHaveLength(2);
    expect(state.cart.totalQuantity).toBe(3);
    expect(state.cart.totalPrice).toBe(40000);

    state = reducer(state, removeProductFromCart(1));

    expect(state.cart.products).toHaveLength(1);
    expect(state.cart.products[0].product.id).toBe(2);
    expect(state.cart.totalQuantity).toBe(1);
    expect(state.cart.totalPrice).toBe(20000);
  });
});
