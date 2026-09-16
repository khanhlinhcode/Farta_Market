import { describe, expect, it } from "vitest";
import reducer, { setAuthenticatedUser } from "./authSlice";

describe("customer auth boundary", () => {
  it.each(["admin", "staff", "disabled", undefined])("does not accept a %s session", (role) => {
    const customer = reducer(undefined, setAuthenticatedUser({ id: 1, role: "customer" }));
    expect(reducer(customer, setAuthenticatedUser({ id: 2, role })).user).toBeNull();
  });
  it("accepts a server authenticated customer", () => {
    const user = { id: 1, role: "customer" };
    expect(reducer(undefined, setAuthenticatedUser(user)).user).toEqual(user);
  });
});
