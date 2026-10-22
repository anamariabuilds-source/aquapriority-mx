import { test } from "@playwright/test";

test("capture ordered deployed persona-test screens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  await page.getByText("DEMO · DATOS SINTÉTICOS · NO OPERATIVO").waitFor();
  await page.screenshot({ path: "docs/persona-screenshots/01-baseline.png", fullPage: true });

  await page.getByRole("tab", { name: /Reglas transparentes/ }).click();
  await page.screenshot({ path: "docs/persona-screenshots/02-rules.png", fullPage: true });

  await page.getByRole("tab", { name: /ML experimental/ }).click();
  await page.screenshot({ path: "docs/persona-screenshots/03-ml.png", fullPage: true });

  await page.getByLabel("Escenario IoT simulado").selectOption("INCOMPLETE_UNRELIABLE");
  await page.screenshot({ path: "docs/persona-screenshots/04-incomplete.png", fullPage: true });

  await page.getByLabel("Escenario IoT simulado").selectOption("POSSIBLE_ANOMALY");
  await page.getByRole("button", { name: "1. INC-FX-1047" }).click();
  await page.locator(".detail-panel").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "docs/persona-screenshots/05-human-review.png", fullPage: true });
});
