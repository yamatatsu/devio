import "dotenv/config";
import { test, expect, Page } from "@playwright/test";

const URL = process.env.URL;
const ID = process.env.ID;
const PW = process.env.PW;
const CHANGED_ARTICLES = process.env.CHANGED_ARTICLES;

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.fill("#user_login", ID);
  await page.fill("#user_pass", PW);
  await page.click("#wp-submit");
});

test("should allow me to add todo items", async ({ page }) => {
  const screenshot = screenthotter(page);
  // await page.goto(URL);
  await screenshot("after-login");
  console.log({ CHANGED_ARTICLES });
});

// utils

const screenthotter = (page: Page) => {
  let num = 0;
  return async (name: string) => {
    const id = num.toString().padStart(2, "0");
    await page.screenshot({
      path: `screenshots/${id}-${name}.png`,
    });
    num++;
  };
};
