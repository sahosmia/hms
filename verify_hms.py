import time
from playwright.sync_api import sync_playwright

def run_hms_cuj():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 800}
        )

        # Injected script to freeze system date to 2026-07-14
        context.add_init_script("""
            const mockDate = new Date('2026-07-14T10:00:00');
            const OriginalDate = Date;
            function MockDate(...args) {
                if (args.length === 0) {
                    return new OriginalDate(mockDate);
                }
                return new OriginalDate(...args);
            }
            MockDate.prototype = OriginalDate.prototype;
            MockDate.now = () => mockDate.getTime();
            MockDate.UTC = OriginalDate.UTC;
            MockDate.parse = OriginalDate.parse;
            window.Date = MockDate;
        """)

        page = context.new_page()

        # --- 1. HOME SELECTOR ---
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/1_home_selector.png", full_page=True)

        # --- 2. PATIENT LOGIN JOURNEY ---
        # Click Patient Portal
        page.click("text=পেশেন্ট পোর্টাল")
        page.wait_for_timeout(500)

        # Input phone number
        page.fill("input[placeholder='017XXXXXXXX']", "01712345678")
        page.wait_for_timeout(500)
        page.click("button:has-text('ওটিপি পাঠান')")
        page.wait_for_timeout(1000)

        # Type OTP '1234' with delay
        otp_inputs = page.query_selector_all("input[inputmode='numeric']")
        if len(otp_inputs) >= 4:
            for i, digit in enumerate("1234"):
                otp_inputs[i].fill(digit)
                page.wait_for_timeout(150)
        else:
            page.keyboard.type("1234", delay=100)
            page.wait_for_timeout(500)

        page.screenshot(path="/home/jules/verification/screenshots/2_patient_otp_entered.png")

        # Verify/Submit OTP
        page.click("button:has-text('যাচাই করুন')")
        page.wait_for_timeout(1500)

        # Patient Dashboard Overview
        page.screenshot(path="/home/jules/verification/screenshots/3_patient_dashboard.png", full_page=True)

        # Navigate to Medical Profile tab
        page.click("text=মেডিকেল প্রোফাইল")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/4_patient_profile.png", full_page=True)

        # Go back to Dashboard Overview
        page.click("text=ড্যাশবোর্ড ওভারভিউ")
        page.wait_for_timeout(500)

        # --- 3. APPOINTMENT BOOKING JOURNEY ---
        # Click booking action
        page.click("text=অ্যাপয়েন্টমেন্ট বুকিং")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/5_booking_step1.png")

        # Select Doctor using searchable dropdown
        page.click("text=ডাক্তারের নাম বা বিভাগ সার্চ করুন...")
        page.wait_for_timeout(500)
        page.click("text=ডাঃ আশরাফুল ইসলাম")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/6_booking_doctor_picked.png")

        page.click("button:has-text('পরবর্তী ধাপে যান')")
        page.wait_for_timeout(800)

        # Select booking date (which is a Tuesday, 2026-07-14)
        page.fill("input[type='date']", "2026-07-14")
        page.wait_for_timeout(500)

        # Select slot '10:00 AM'
        page.click("button:has-text('10:00 AM')")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/7_booking_date_slot.png")

        page.click("button:has-text('পরবর্তী')")
        page.wait_for_timeout(800)

        # Write symptoms
        page.fill("textarea", "বুকে হালকা ব্যথা অনুভব করছি এবং উচ্চ রক্তচাপের ওষুধ নিয়মিত খাচ্ছি।")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/8_booking_symptoms.png")

        page.click("button:has-text('বুকিং সম্পন্ন করুন')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/9_booking_completed.png")

        # Click view lists
        page.click("text=বুকিং তালিকা দেখুন")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/10_patient_booking_history.png", full_page=True)

        # Click Billing Tab inside Portal
        page.click("text=ইনভয়েস ও বিলিং")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/11_patient_invoice_checkout.png", full_page=True)

        # Log out from patient workflow
        page.click("button:has-text('লগআউট')")
        page.wait_for_timeout(1000)

        # --- 4. STAFF & ADMIN JOURNEY ---
        # Go back to main selector
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1000)

        # Click Admin Portal on Selector
        page.click("text=অ্যাডমিন ও নার্স লগইন")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/12_admin_login_page.png")

        # Enter Admin credentials
        page.fill("input[type='email']", "admin@hms.com")
        page.fill("input[type='password']", "admin123")
        page.wait_for_timeout(500)
        page.click("button:has-text('লগইন করুন')")
        page.wait_for_timeout(1500)

        # Admin Dashboard
        page.screenshot(path="/home/jules/verification/screenshots/13_admin_dashboard.png", full_page=True)

        # Navigate to Nurse Medication Log Feed
        page.click("text=মেডিকেশন ও ভাইটাল ফিড")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/14_nurse_medication_feed.png", full_page=True)

        # Navigate to Bed Occupancy grid
        page.click("text=বেড অকুপেন্সি গ্রিড")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/15_bed_occupancy_grid.png", full_page=True)

        # Trigger Admission wizard modal
        page.locator("button:has-text('ভর্তি করুন')").first.click() # click first available bed
        page.wait_for_timeout(500)

        # Fill Admission details
        page.fill("input[placeholder='যেমন: pat-123']", "pat-99")
        page.fill("input[placeholder='আরিফ আহমেদ']", "জসিম উদ্দিন (Josim Uddin)")
        page.fill("textarea", "হৃদরোগজনিত সমস্যা এবং তীব্র শ্বাসকষ্ট।")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/16_admission_wizard_modal.png")

        page.click("button:has-text('ভর্তি কনফার্ম করুন')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/17_bed_grid_after_admission.png", full_page=True)

        # Navigate to Surgery & Inventory (OT Kanban, Ledger, Supply requests, financial graphs)
        page.click("text=সার্জারি ও ইনভেন্টরি")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/18_surgery_ot_kanban.png", full_page=True)

        # Trigger Surgery Scheduler Wizard
        page.click("button:has-text('সার্জারি সিডিউল করুন')")
        page.wait_for_timeout(500)

        # Fill surgery schedule details
        page.fill("input[placeholder='যেমন: usr-pat-017']", "pat-99")
        page.fill("input[placeholder='যেমন: আরিফ আহমেদ']", "জসিম উদ্দিন (Josim Uddin)")
        page.select_option("select:near(:text('সার্জন (Doctor) নির্বাচন'))", label="ডাঃ আশরাফুল ইসলাম (Dr. Ashraful Islam)")
        page.fill("input[type='date']", "2026-07-16")
        page.fill("input[placeholder='যেমন: Appendectomy']", "Angioplasty")

        # Pick consumable
        page.select_option("#consumableSelect", label="Surgical Gloves (Size 7.5) (স্টক: 120 টি)")
        page.click("button:has-text('যোগ করুন')")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/19_surgery_wizard_modal.png")

        page.click("button:has-text('সিডিউল ও চার্জ করুন')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/20_surgery_ot_kanban_updated.png", full_page=True)

        # Change tabs to Stock & Inventory Ledger
        page.click("text=স্টক ও ইনভেন্টরি লেজার")
        page.wait_for_timeout(800)
        page.screenshot(path="/home/jules/verification/screenshots/21_inventory_stock_ledger.png", full_page=True)

        # Change tabs to Financial Trends
        page.click("text=ফাইন্যান্সিয়াল প্রফিট গ্রাফ")
        page.wait_for_timeout(800)
        page.screenshot(path="/home/jules/verification/screenshots/22_financial_trends.png", full_page=True)

        # Logout
        page.click("button:has-text('লগআউট করুন')")
        page.wait_for_timeout(1000)

        context.close()
        browser.close()

if __name__ == "__main__":
    run_hms_cuj()
    print("Playwright CUJ execution finished successfully!")
