import { test, expect, Page } from "@playwright/test";

const LOGIN_URL = process.env.LOGIN_URL!;
const POST_PAGE_URL = process.env.POST_PAGE_URL!;
const ID = process.env.ID!;
const PW = process.env.PW!;

export default class WPPage {
  constructor(private readonly page: Page) {}

  async login() {
    await this.page.goto(LOGIN_URL);
    await this.page.fill("#user_login", ID);
    await this.page.fill("#user_pass", PW);
    await this.page.click("#wp-submit");
  }

  async newPost() {
    await this.page.click("#wp-admin-bar-new-content");
  }

  async gotoPost(postCode: number) {
    await this.page.goto(`${POST_PAGE_URL}?post=${postCode}&action=edit`);
  }

  async fill(title: string, wpContent: string, description: string) {
    await this.page.fill("#title", title);
    await this.page.fill("#content", wpContent);
    await this.page.fill("#easy_wp_description", description);
  }

  async setSlug(slug: string) {
    await this.page.click("#edit-slug-buttons>button");
    await this.page.fill("#new-post-slug", slug);
    await this.page.click("#edit-slug-buttons>button");
  }

  async setEyeCatch(thumbnailId: string) {
    // await this.page.fill("#_thumbnail_id", thumbnailId, { force: true });
    const hiddenInput = await this.page.$("#_thumbnail_id");
    await hiddenInput?.evaluate((el, _thumbnailId) => {
      (el as HTMLInputElement).value = _thumbnailId;
    }, thumbnailId);
  }

  async save() {
    await this.page.click("#save-post");
  }
  async publish() {
    await this.page.click("#publish");
  }

  async getPostCode() {
    await this.page.waitForNavigation();
    const newPostCode = this.page.url().match(/post=(\d+)/)?.[1];
    if (!newPostCode) {
      throw new Error(`No post code is found. postCode: ${newPostCode}`);
    }
    return newPostCode;
  }
}
