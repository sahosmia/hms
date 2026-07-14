import time
from playwright.sync_api import sync_playwright

def run_hms_cuj():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 800}
        )

        # Freeze system date to 2026-07-14
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

        # --- 1. GUEST LANDING PAGE ---
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/1_guest_landing.png", full_page=True)

        # --- 2. ABOUT US PAGE ---
        page.click("text=About Us")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/2_guest_about.png", full_page=True)

        # --- 3. PUBLIC DOCTORS DIRECTORY & BOOK REDIRECT ---
        page.click("text=Doctors")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/3_guest_doctors.png", full_page=True)

        # Click "Book Slot" for Dr. Ashraful Islam as a guest
        page.click("button:has-text('Book Slot')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/4_guest_booking_redirect_login.png")

        # --- 4. PATIENT LOGIN & REDIRECT FLOW ---
        page.fill("input[placeholder*='017']", "01712345678")
        page.wait_for_timeout(500)
        page.click("button:has-text('Send OTP')")
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

        page.screenshot(path="/home/jules/verification/screenshots/5_patient_otp_entered.png")

        # Click Verify (this should seamlessly land us on active doctor's booking step!)
        page.click("button:has-text('Verify')")
        page.wait_for_timeout(1500)
        page.screenshot(path="/home/jules/verification/screenshots/6_booking_step1.png")

        # Proceed on Stepper
        page.click("button:has-text('Proceed to Next Step')")
        page.wait_for_timeout(800)

        # Select booking date (2026-07-14)
        page.fill("input[type='date']", "2026-07-14")
        page.wait_for_timeout(500)

        # Select slot '11:00 AM'
        page.click("button:has-text('11:00 AM')")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/7_booking_date_slot.png")

        page.click("button:has-text('Next')")
        page.wait_for_timeout(800)

        # Write symptoms
        page.fill("textarea", "Mild pressure in chest occasionally and taking hypertension medications regularly.")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/8_booking_symptoms.png")

        page.click("button:has-text('Confirm Appointment')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/9_booking_completed.png")

        # View lists
        page.click("text=Go to History List")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/10_patient_booking_history.png", full_page=True)

        # View Invoices
        page.click("text=Invoices & Bills")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/11_patient_invoice_checkout.png", full_page=True)

        # Click Home/Dashboard Portal
        page.click("text=Home")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/12_patient_dashboard.png", full_page=True)

        # Logout
        page.click("button:has-text('Log Out')")
        page.wait_for_timeout(1000)

        # --- 5. STAFF & ADMIN JOURNEY ---
        # Go directly to admin login to bypass portal Home layout
        page.goto("http://localhost:5173/admin/login")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/13_admin_login_page.png")

        # Enter Admin credentials
        page.fill("input[type='email']", "admin@hms.com")
        page.fill("input[type='password']", "admin123")
        page.wait_for_timeout(500)
        page.click("button:has-text('Sign In')")
        page.wait_for_timeout(1500)

        # Admin Dashboard
        page.screenshot(path="/home/jules/verification/screenshots/14_admin_dashboard.png", full_page=True)

        # Navigate to Nurse Feed
        page.click("text=Medication & Vitals Feed")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/15_nurse_medication_feed.png", full_page=True)

        # Navigate to Bed Occupancy grid
        page.click("text=Bed Occupancy Grid")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/16_bed_occupancy_grid.png", full_page=True)

        # Trigger Admission wizard modal
        page.locator("button:has-text('Admit Patient')").first.click()
        page.wait_for_timeout(500)

        # Fill Admission details
        page.fill("input[placeholder*='pat-123']", "pat-99")
        page.fill("input[placeholder*='Arif']", "Josim Uddin")
        page.fill("textarea", "Severe chest congestion, shortness of breath.")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/17_admission_wizard_modal.png")

        page.click("button:has-text('Confirm Admission')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/18_bed_grid_after_admission.png", full_page=True)

        # Navigate to Surgery & Inventory
        page.click("text=OT Surgery & Inventory")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/19_surgery_ot_kanban.png", full_page=True)

        # Trigger Surgery Scheduler Wizard
        page.click("button:has-text('Schedule Surgery')")
        page.wait_for_timeout(500)

        # Fill surgery schedule details
        page.fill("input[placeholder*='usr-pat-017']", "pat-99")
        page.fill("input[placeholder*='Arif']", "Josim Uddin")
        page.select_option("select:near(:text('Select Surgeon'))", label="Dr. Ashraful Islam")
        page.fill("input[type='date']", "2026-07-16")
        page.fill("input[placeholder*='Appendectomy']", "Angioplasty")

        # Pick consumable
        page.select_option("#consumableSelect", label="Surgical Gloves (Size 7.5) (Stock: 120)")
        page.click("button:has-text('Add Item')")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/20_surgery_wizard_modal.png")

        page.click("button:has-text('Schedule & Bill Patient')")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/21_surgery_ot_kanban_updated.png", full_page=True)

        # Change tabs to Stock & Inventory Ledger
        page.click("text=Stock & Inventory Ledger")
        page.wait_for_timeout(800)
        page.screenshot(path="/home/jules/verification/screenshots/22_inventory_stock_ledger.png", full_page=True)

        # Change tabs to Financial Trends
        page.click("text=Financial Profit Graphs")
        page.wait_for_timeout(800)
        page.screenshot(path="/home/jules/verification/screenshots/23_financial_trends.png", full_page=True)

        # Logout
        page.click("button:has-text('Log Out')")
        page.wait_for_timeout(1000)

        context.close()
        browser.close()

if __name__ == "__main__":
    run_hms_cuj()
    print("Playwright CUJ execution finished successfully in English!")
