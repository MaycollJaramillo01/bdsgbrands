import { expect, test } from "@playwright/test";

test("home hero and no add-to-cart for waitlist products", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skincare that works as hard as you do.");
  await expect(page.getByText(/add to bag/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Join the Barrier waitlist" })).toBeVisible();
});

test("consent banner: reject hides it and footer reopens it", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Reject all" }).click();
  await expect(page.getByRole("dialog", { name: /cookies/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Cookie settings" }).click();
  await expect(page.getByRole("button", { name: "Save choices" })).toBeVisible();
});

test("PDP waitlist shows a server-confirmed state", async ({ page }) => {
  await page.route("/api/waitlist", (r) => r.fulfill({ json: { status: "already" } }));
  await page.goto("/products/barrier");
  await page.getByRole("button", { name: "Reject all" }).click();
  const form = page.locator(".pdp-info form");
  await form.getByRole("textbox", { name: "Email" }).fill("someone@example.com");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Join waitlist" }).click();
  await expect(page.getByText(/already on this list/i)).toBeVisible();
});

test("contact form shows validation errors from the server", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Reject all" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert").first()).toContainText("Check");
  await expect(page.getByText("Message received")).toHaveCount(0);
});

test("legacy URL redirects and 404 copy", async ({ page }) => {
  const r = await page.goto("/formulas/calm");
  expect(page.url()).toContain("/products/calm");
  expect(r?.status()).toBe(200);
  await page.goto("/nope");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wrong turn. The journey continues.");
});

test("product JSON-LD has no Offer for waitlist items", async ({ page }) => {
  await page.goto("/products/barrier");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const product = ld.map((t) => JSON.parse(t)).find((j) => j["@type"] === "Product");
  expect(product).toBeTruthy();
  expect(product.offers).toBeUndefined();
  expect(product.aggregateRating).toBeUndefined();
});
