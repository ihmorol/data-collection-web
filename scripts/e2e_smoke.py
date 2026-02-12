#!/usr/bin/env python3
import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:3000")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
OUT_DIR = Path(os.getenv("E2E_SCREENSHOT_DIR", "/tmp/memeconsole-e2e"))
OUT_DIR.mkdir(parents=True, exist_ok=True)


def shot(page, name: str):
    page.screenshot(path=str(OUT_DIR / f"{name}.png"), full_page=True)


def fill_register(page, username: str, password: str):
    page.goto(f"{BASE_URL}/register")
    page.wait_for_load_state("networkidle")
    shot(page, "01-register-page")

    page.fill("#field-username", username)
    page.fill("#field-password", password)
    page.fill("#age", "22")

    page.get_by_role("button", name="Progressive").click()
    page.get_by_role("button", name="Not Religious").click()
    page.get_by_role("button", name="Meme Savvy").click()

    slider = page.locator("input[type='range']").first
    slider.fill("7")
    shot(page, "02-register-filled")

    page.get_by_role("button", name="Register as Annotator →").click()
    page.wait_for_url(f"{BASE_URL}/gallery", timeout=20000)
    shot(page, "03-gallery-after-register")


def submit_first_meme(page):
    page.get_by_role("button", name="Continue →").click()
    page.wait_for_url(f"{BASE_URL}/meme/*")
    page.wait_for_load_state("networkidle")
    shot(page, "04-meme-page")

    page.get_by_role("button", name="Neutral").first.click()
    page.get_by_role("button", name="Disagree").first.click()
    page.get_by_role("button", name="No").first.click()
    page.get_by_role("button", name="None/General").first.click()
    page.get_by_role("button", name="Keep").first.click()
    shot(page, "05-meme-answered")

    page.get_by_role("button", name="SUBMIT & NEXT →").click()
    page.wait_for_url(f"{BASE_URL}/meme/*")
    shot(page, "06-meme-next")


def login_user(page, username: str, password: str):
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")
    page.fill("#login-username", username)
    page.fill("#login-password", password)
    page.get_by_role("button", name="Sign In →").click()
    page.wait_for_url(f"{BASE_URL}/gallery", timeout=20000)
    shot(page, "07-login-user-gallery")


def login_admin(page):
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        return False

    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")
    page.fill("#login-username", ADMIN_USERNAME)
    page.fill("#login-password", ADMIN_PASSWORD)
    page.get_by_role("button", name="Sign In →").click()
    page.wait_for_url(f"{BASE_URL}/admin", timeout=20000)
    shot(page, "08-admin-dashboard")

    page.get_by_role("button", name="Download User Details CSV").click()
    page.get_by_role("button", name="Download Meme Reviews CSV").click()
    shot(page, "09-admin-downloads")
    return True


def main():
    username = f"e2e_user_{int(time.time())}"
    password = "test1234"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page()
        fill_register(page, username, password)
        submit_first_meme(page)
        page.get_by_role("button", name="Logout").first.click()
        page.wait_for_url(f"{BASE_URL}/login")

        login_user(page, username, password)
        page.goto(f"{BASE_URL}/meme/1")
        page.wait_for_load_state("networkidle")
        shot(page, "10-prefill-check")

        if login_admin(page):
            page.goto(f"{BASE_URL}/admin")
            shot(page, "11-admin-final")

        browser.close()
        print(f"E2E smoke completed. Screenshots: {OUT_DIR}")


if __name__ == "__main__":
    main()
