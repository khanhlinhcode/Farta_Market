import { describe, expect, it } from "vitest";
import reducer, { setAuthenticatedUser } from "./authSlice";

describe("customer auth boundary", () => {
  it.each(["admin", "staff", "disabled", undefined])("does not accept a %s session", (role) => {
    const customer = reducer(undefined, setAuthenticatedUser({
      id: 1,
      role: "customer",
      email_verified_at: "2026-09-23T00:00:00Z",
    }));
    expect(reducer(customer, setAuthenticatedUser({ id: 2, role })).user).toBeNull();
  });
  it("accepts a verified server authenticated customer", () => {
    const user = {
      id: 1,
      role: "customer",
      email_verified_at: "2026-09-23T00:00:00Z",
    };
    expect(reducer(undefined, setAuthenticatedUser(user)).user).toEqual(user);
  });
  it("does not expose an unverified customer as logged in", () => {
    const user = { id: 1, role: "customer", email_verified_at: null };
    expect(reducer(undefined, setAuthenticatedUser(user)).user).toBeNull();
  });
});
