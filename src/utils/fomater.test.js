import { formatter } from "./fomater";

test("formats numbers as Vietnamese currency", () => {
  const result = formatter(200000);

  expect(result).toContain("200.000");
  expect(result).toContain("₫");
});
