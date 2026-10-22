import { expect, test } from "@playwright/test";

test("compares methods and updates evidence from simulated scenarios", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("DEMO · DATOS SINTÉTICOS · NO OPERATIVO")).toBeVisible();
  await expect(page.getByText("8 marcadores")).toBeVisible();
  const firstReading = page.locator(".reading-list strong").first();
  const anomalyReading = await firstReading.textContent();
  await page.getByLabel("Escenario IoT simulado").selectOption("STABLE");
  await expect(firstReading).not.toHaveText(anomalyReading ?? "");
  await page.getByRole("tab", { name: /Reglas transparentes/ }).click();
  await expect(page.getByRole("heading", { name: /Reglas transparentes/ })).toBeVisible();
  await page.getByRole("tab", { name: /ML experimental/ }).click();
  await expect(page.getByRole("heading", { name: /señal para inspección humana/ })).toBeVisible();
  await expect(page.getByText(/no es probabilidad de reparación/i).first()).toBeVisible();
});

test("map/list selection and guarded human review remain functional", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "8. INC-FX-1104" }).click();
  await expect(page.locator(".detail-panel h3")).toHaveText("INC-FX-1104");
  await page.getByRole("button", { name: "Registrar override" }).click();
  await expect(page.getByRole("status")).toContainText("10 caracteres");
  await page.getByLabel(/Razón del override/).fill("Revisión humana ficticia por impacto operativo documentado.");
  await page.getByLabel(/Confirmo que/).check();
  await page.getByRole("button", { name: "Registrar override" }).click();
  await expect(page.getByRole("status")).toContainText("Prioridad humana registrada");
  await expect(page.getByText("PRIORITY_OVERRIDE")).toBeVisible();
  await page.getByRole("button", { name: "Restablecer demo" }).click();
  await expect(page.locator(".detail-panel h3")).toHaveText("INC-FX-1047");
});
