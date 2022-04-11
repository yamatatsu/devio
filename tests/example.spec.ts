import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { parseMarkdownHeaders } from "markdown-headers";
import * as zod from "zod";
import { test, expect, Page } from "@playwright/test";

const LOGIN_URL = process.env.LOGIN_URL!;
const POST_PAGE_URL = process.env.POST_PAGE_URL!;
const ID = process.env.ID!;
const PW = process.env.PW!;
const CHANGED_ARTICLES = process.env.CHANGED_ARTICLES!;

const schema = zod.object({
  headers: zod.object({
    title: zod.string(),
    description: zod.string(),
    slug: zod.string(),
    published: zod.boolean(),
    postCode: zod.number().nullable(),
  }),
  markdown: zod.string(),
});

test.beforeEach(async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.fill("#user_login", ID);
  await page.fill("#user_pass", PW);
  await page.click("#wp-submit");
});

test("should allow me to add todo items", async ({ page }) => {
  const screenshot = screenthotter(page);

  const articlePaths = CHANGED_ARTICLES.split(" ").filter((path) =>
    path.startsWith("articles/")
  );

  for (const articlePath of articlePaths) {
    const article = readFileSync(articlePath, "utf-8");
    const {
      headers: { title, description, slug, published, postCode },
      markdown,
    } = schema.parse(parseMarkdownHeaders(article));

    const wpContent = replaceWPCode(markdown);

    if (!postCode) {
      await page.click("#wp-admin-bar-new-content");
    } else {
      await page.goto(`${POST_PAGE_URL}?post=${postCode}&action=edit`);
    }

    await page.fill("#title", title);
    await page.fill("#content", wpContent);
    await page.fill("#easy_wp_description", description);

    if (!postCode) {
      await page.click("#save-post");
      await page.waitForNavigation();
      const newPostCode = page.url().match(/post=(\d+)/)?.[1];
      if (!newPostCode) {
        throw new Error(`No post code is found. postCode: ${postCode}`);
      }
      writeFileSync(
        articlePath,
        article.replace(/postCode:\s*\n/, `postCode: ${newPostCode}\n`)
      );
    }

    await page.click("#edit-slug-buttons>button");
    await page.fill("#new-post-slug", slug);
    await page.click("#edit-slug-buttons>button");

    await screenshot("filled-slug");

    if (published) {
      await page.click("#publish");
    } else {
      await page.click("#save-post");
    }

    await screenshot("after-save");
  }
});

// ===========
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

const langMap: Record<string, string> = {
  ts: "typescript",
};
const replaceWPCode = (markdown: string) =>
  markdown.replace(/```(ts|typescript)[\s\S]*?```/g, (codeBlock, shortLang) => {
    const lang = langMap[shortLang] ?? shortLang;
    return codeBlock
      .replace(/^```\w+/, `[${lang}]`)
      .replace(/```$/, `[/${lang}]`);
  });
