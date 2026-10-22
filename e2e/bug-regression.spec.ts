import { expect, test } from "@playwright/test";

test("ML unavailable cases retain deterministic sheet-row order", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Escenario IoT simulado").selectOption("INCOMPLETE_UNRELIABLE");
  await page.getByRole("tab", { name: /ML experimental/ }).click();
  const displayedIds = await page.locator("tbody .id-button").allTextContents();
  expect(displayedIds).toEqual([
    "INC-FX-1047",
    "INC-FX-1032",
    "INC-FX-1075",
    "INC-FX-1019",
    "INC-FX-1068",
    "INC-FX-1082",
    "INC-FX-1091",
    "INC-FX-1104",
  ]);
  await expect(page.getByText("ML UNAVAILABLE", { exact: true }).first()).toBeVisible();
});
