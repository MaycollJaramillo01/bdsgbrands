import { expect, test, type Page } from "@playwright/test";

// The e2e build sets a fake GA ID so the consent layer exists; consent is never given except where tested.
const reject = async (page: Page) => {
  const b = page.getByRole("button", { name: "Reject all" });
  if (await b.isVisible().catch(() => false)) await b.click();
};
const settle = async (page: Page) => {
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")));
  await page.waitForTimeout(900);
};

test("home → product → waitlist (server-confirmed state)", async ({ page }) => {
  await page.route("/api/waitlist", (r) => r.fulfill({ json: { status: "success" } }));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skincare that works as hard as you do.");
  await reject(page);
  await page.getByRole("link", { name: "Join the Barrier waitlist" }).click();
  await expect(page).toHaveURL(/\/products\/barrier$/);
  const form = page.locator("#notify form");
  await form.getByRole("textbox", { name: /Email/ }).fill("someone@example.com");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Join waitlist" }).click();
  await expect(page.getByText(/You're on the list/)).toBeVisible();
});

test("waitlist shows server errors and focuses the field", async ({ page }) => {
  await page.goto("/products/calm");
  await reject(page);
  const form = page.locator("#notify form");
  await form.getByRole("button", { name: "Join waitlist" }).click();
  await expect(form.getByText("Enter an email address")).toBeVisible();
  await expect(form.getByRole("textbox", { name: /Email/ })).toBeFocused();
});

for (const slug of ["barrier", "calm", "renewal", "recovery"]) {
  test(`REGRESSION: ${slug} renders no add-to-bag, buy, ready or InStock`, async ({ page }) => {
    await page.goto(`/products/${slug}`);
    await expect(page.getByRole("button", { name: /add to bag|buy now/i })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/add to bag|are ready|buy now/i);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join();
    expect(ld).not.toContain("InStock");
    expect(ld).not.toContain("aggregateRating");
  });
}

test("shop shows real status for all four", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator(".badge", { hasText: "Not yet available" })).toHaveCount(2);
  await expect(page.locator(".badge", { hasText: "Coming soon" })).toHaveCount(2);
  await expect(page.locator("main")).not.toContainText(/add to bag/i);
});

test("bag opens empty, closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/");
  await reject(page);
  const opener = page.getByRole("button", { name: /^Bag/ });
  await opener.click();
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeHidden();
  await expect(opener).toBeFocused();
});

test("checkout API rejects unavailable items server-side", async ({ request }) => {
  const r = await request.post("/api/checkout", { data: { lines: [{ slug: "barrier", qty: 1 }] } });
  expect(r.status()).toBe(409);
  expect((await r.json()).code).toBe("unavailable_item");
});

test("contact form: error summary, no false success", async ({ page }) => {
  await page.goto("/contact");
  await reject(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact-errors")).toBeFocused();
  await expect(page.getByText("Message received")).toHaveCount(0);
});

test("privacy preferences: reject, reopen from footer, save", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Reject all" }).click();
  await expect(page.getByRole("dialog", { name: /cookies/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Cookie settings" }).click();
  await page.getByRole("button", { name: "Save choices" }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bdsg-consent")!).analytics)).toBe(false);
});

test("keyboard: skip link is the first stop", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});

test("draft policies never show internal notes", async ({ page }) => {
  for (const s of ["shipping", "membership"]) {
    await page.goto(`/legal/${s}`);
    await expect(page.locator("main")).not.toContainText(/to confirm before launch|TBD|TODO/i);
    await expect(page.getByText("This policy is not published yet.")).toBeVisible();
  }
});

test("legacy redirects are 301 and 404 copy", async ({ request, page }) => {
  for (const [from, to] of [["/formulas/calm", "/products/calm"], ["/products.php", "/shop"], ["/greatness-program.php", "/greatness"]]) {
    const r = await request.get(from, { maxRedirects: 0 });
    expect(r.status()).toBe(301);
    expect(r.headers()["location"]).toBe(to);
  }
  await page.goto("/nope");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wrong trail. The work continues.");
});

for (const path of ["/", "/shop", "/products/barrier", "/science", "/greatness", "/faq", "/contact", "/about"]) {
  test(`axe WCAG 2.2 AA: ${path}`, async ({ page }) => {
    const { default: AxeBuilder } = await import("@axe-core/playwright");
    await page.goto(path);
    await reject(page);
    await settle(page);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}

test("no horizontal overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of ["/", "/shop", "/products/barrier", "/greatness", "/contact"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
  }
});

test("admin is locked without a session", async ({ page, request }) => {
  for (const path of ["/admin", "/admin/products", "/admin/orders", "/admin/settings"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Entrar al panel");
  expect((await request.get("/api/admin/waitlist.csv")).status()).toBe(403);
  expect((await request.post("/api/admin/publish", { headers: { "content-type": "application/json" } })).status()).toBe(403);
  const robots = await (await request.get("/admin/login")).headers();
  expect(robots["x-robots-tag"] ?? "").toContain("noindex");
});
