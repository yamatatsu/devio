import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { parseMarkdownHeaders } from "markdown-headers";
import * as zod from "zod";
import { test, expect, Page } from "@playwright/test";
import WPPage from "./WPPage";

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
  const wpPage = new WPPage(page);
  await wpPage.login();
});

test("should allow me to add todo items", async ({ page }) => {
  const screenshot = screenthotter(page);
  const wpPage = new WPPage(page);

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
      await wpPage.newPost();
    } else {
      await wpPage.gotoPost(postCode);
    }

    await wpPage.fill(title, wpContent, description);

    if (!postCode) {
      await wpPage.save();
      const newPostCode = await wpPage.getPostCode();
      writeFileSync(
        articlePath,
        article.replace(/postCode:\s*\n/, `postCode: ${newPostCode}\n`)
      );
    }

    await wpPage.setSlug(slug);

    if (published) {
      await wpPage.publish();
    } else {
      await wpPage.save();
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
