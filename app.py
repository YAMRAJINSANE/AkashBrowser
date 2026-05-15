import os
import subprocess
import json
import time
import shutil
import threading
import customtkinter as ctk
import pyautogui

# ==========================================
# CONFIG
# ==========================================
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

pyautogui.FAILSAFE = False


# ==========================================
# PROFILE MANAGER
# ==========================================
class ProfileManager:

    def __init__(self):

        self.root_dir = os.path.join(
            os.environ['USERPROFILE'],
            "Browser_Profiles_Manager"
        )

        if not os.path.exists(self.root_dir):
            os.makedirs(self.root_dir)

        self.db_path = os.path.join(
            self.root_dir,
            "profiles_db.json"
        )

        self.profiles = self.load_profiles()

    def load_profiles(self):

        if os.path.exists(self.db_path):

            try:
                with open(self.db_path, "r") as f:
                    return json.load(f)

            except:
                return []

        return []

    def save_profiles(self):

        with open(self.db_path, "w") as f:
            json.dump(self.profiles, f)

    def add_profile(self, name):

        profile_id = f"profile_{int(time.time())}"

        profile_path = os.path.join(
            self.root_dir,
            profile_id
        )

        new_profile = {
            "id": profile_id,
            "name": name,
            "path": profile_path
        }

        self.profiles.append(new_profile)

        self.save_profiles()

    def rename_profile(self, profile_id, new_name):

        for p in self.profiles:

            if p['id'] == profile_id:
                p['name'] = new_name
                break

        self.save_profiles()

    def delete_profile(self, profile_id):

        profile = next(
            (p for p in self.profiles if p['id'] == profile_id),
            None
        )

        if profile:

            self.profiles.remove(profile)

            self.save_profiles()

            if os.path.exists(profile['path']):

                try:
                    shutil.rmtree(profile['path'])

                except:
                    pass


# ==========================================
# MAIN APP
# ==========================================
class AppUI(ctk.CTk):

    def __init__(self):

        super().__init__()

        self.manager = ProfileManager()

        self.title("YouTube Multi Profile Bot")

        self.geometry("1200x900")

        ctk.set_appearance_mode("light")

        self.configure(fg_color="#f5f6f7")

        # ==========================================
        # TOP BAR
        # ==========================================
        self.top_bar = ctk.CTkFrame(
            self,
            height=80,
            fg_color="white",
            corner_radius=0
        )

        self.top_bar.pack(
            side="top",
            fill="x"
        )

        ctk.CTkLabel(
            self.top_bar,
            text="YouTube Multi Profile Dashboard",
            font=("Segoe UI", 24, "bold")
        ).pack(
            side="left",
            padx=30
        )

        self.close_btn = ctk.CTkButton(
            self.top_bar,
            text="🛑 Close Browsers",
            fg_color="#e74c3c",
            hover_color="#c0392b",
            command=self.close_all_browsers
        )

        self.close_btn.pack(
            side="right",
            padx=20
        )

        # ==========================================
        # MAIN CONTAINER
        # ==========================================
        self.main_container = ctk.CTkFrame(
            self,
            fg_color="transparent"
        )

        self.main_container.pack(
            fill="both",
            expand=True,
            padx=20,
            pady=20
        )

        # ==========================================
        # LEFT PANEL
        # ==========================================
        self.left_panel = ctk.CTkFrame(
            self.main_container,
            fg_color="transparent"
        )

        self.left_panel.pack(
            side="left",
            fill="both",
            expand=True,
            padx=(0, 10)
        )

        ctk.CTkLabel(
            self.left_panel,
            text="Profiles",
            font=("Segoe UI", 16, "bold")
        ).pack(
            anchor="w",
            pady=(0, 10)
        )

        # ADD PROFILE
        self.add_frame = ctk.CTkFrame(
            self.left_panel,
            fg_color="transparent"
        )

        self.add_frame.pack(
            fill="x",
            pady=10
        )

        self.name_entry = ctk.CTkEntry(
            self.add_frame,
            placeholder_text="Profile Name...",
            height=40
        )

        self.name_entry.pack(
            side="left",
            fill="x",
            expand=True,
            padx=(0, 10)
        )

        self.add_btn = ctk.CTkButton(
            self.add_frame,
            text="Create",
            width=100,
            height=40,
            command=self.handle_add
        )

        self.add_btn.pack(side="left")

        # PROFILE LIST
        self.scroll_frame = ctk.CTkScrollableFrame(
            self.left_panel,
            fg_color="white",
            corner_radius=12
        )

        self.scroll_frame.pack(
            fill="both",
            expand=True
        )

        # ==========================================
        # RIGHT PANEL
        # ==========================================
        self.right_panel = ctk.CTkFrame(
            self.main_container,
            fg_color="white",
            width=350,
            corner_radius=12
        )

        self.right_panel.pack(
            side="right",
            fill="both"
        )

        self.right_panel.pack_propagate(False)

        # URL
        ctk.CTkLabel(
            self.right_panel,
            text="YouTube Video URL",
            font=("Segoe UI", 14, "bold")
        ).pack(
            anchor="w",
            padx=15,
            pady=(20, 5)
        )

        self.url_entry = ctk.CTkEntry(
            self.right_panel,
            placeholder_text="Paste YouTube video URL...",
            height=40
        )

        self.url_entry.pack(
            fill="x",
            padx=15,
            pady=(0, 10)
        )

        # OPEN URL BUTTON
        self.open_url_btn = ctk.CTkButton(
            self.right_panel,
            text="🔗 Open URL in All",
            fg_color="#3498db",
            hover_color="#2980b9",
            height=45,
            command=self.open_url_all_browsers
        )

        self.open_url_btn.pack(
            fill="x",
            padx=15,
            pady=(0, 20)
        )

        # COMMENT
        ctk.CTkLabel(
            self.right_panel,
            text="Comment Text",
            font=("Segoe UI", 14, "bold")
        ).pack(
            anchor="w",
            padx=15,
            pady=(10, 5)
        )

        self.comment_entry = ctk.CTkEntry(
            self.right_panel,
            placeholder_text="Write comment...",
            height=40
        )

        self.comment_entry.pack(
            fill="x",
            padx=15,
            pady=(0, 15)
        )

        # COMMENT BUTTON
        self.comment_btn = ctk.CTkButton(
            self.right_panel,
            text="💬 Post Comment",
            fg_color="#e74c3c",
            hover_color="#c0392b",
            height=45,
            command=self.post_comment_action
        )

        self.comment_btn.pack(
            fill="x",
            padx=15,
            pady=(0, 15)
        )

        # INSTRUCTIONS
        self.instructions = ctk.CTkTextbox(
            self.right_panel,
            height=250
        )

        self.instructions.pack(
            fill="x",
            padx=15,
            pady=(0, 15)
        )

        self.instructions.insert(
            "1.0",
            """
WORKFLOW

1. Paste YouTube video URL

2. Click OPEN URL IN ALL

3. Videos will:
   - open automatically
   - autoplay automatically
   - mute automatically

4. DO NOT TOUCH MOUSE/KEYBOARD

5. Click POST COMMENT

6. Bot comments on all profiles
"""
        )

        self.instructions.configure(state="disabled")

        # STATUS
        self.status_label = ctk.CTkLabel(
            self.right_panel,
            text="",
            text_color="#7f8c8d",
            font=("Segoe UI", 11)
        )

        self.status_label.pack(
            anchor="w",
            padx=15
        )

        self.render_profiles()

    # ==========================================
    # PROFILE FUNCTIONS
    # ==========================================
    def handle_add(self):

        name = self.name_entry.get().strip()

        if name:

            self.manager.add_profile(name)

            self.name_entry.delete(0, 'end')

            self.render_profiles()

    def handle_rename(self, profile_id):

        dialog = ctk.CTkInputDialog(
            text="Enter new name:",
            title="Rename Profile"
        )

        new_name = dialog.get_input()

        if new_name:

            self.manager.rename_profile(
                profile_id,
                new_name
            )

            self.render_profiles()

    def render_profiles(self):

        for widget in self.scroll_frame.winfo_children():
            widget.destroy()

        for p in self.manager.profiles:

            row = ctk.CTkFrame(
                self.scroll_frame,
                fg_color="transparent",
                height=60
            )

            row.pack(
                fill="x",
                pady=5,
                padx=10
            )

            ctk.CTkLabel(
                row,
                text=p['name'],
                font=("Segoe UI", 15, "bold"),
                width=180,
                anchor="w"
            ).pack(side="left")

            ctk.CTkButton(
                row,
                text="Open",
                width=90,
                command=lambda path=p['path'], name=p['name']:
                self.launch_browser(path, name)
            ).pack(side="right", padx=5)

            ctk.CTkButton(
                row,
                text="Rename",
                width=70,
                fg_color="#fdcb6e",
                text_color="black",
                command=lambda pid=p['id']:
                self.handle_rename(pid)
            ).pack(side="right", padx=5)

            ctk.CTkButton(
                row,
                text="Delete",
                width=70,
                fg_color="#ff7675",
                command=lambda pid=p['id']:
                [self.manager.delete_profile(pid), self.render_profiles()]
            ).pack(side="right", padx=5)

    # ==========================================
    # BROWSER FUNCTIONS
    # ==========================================
    def launch_browser(self, path, name):

        video_url = self.url_entry.get().strip()

        if not video_url:
            video_url = "https://www.youtube.com"

        subprocess.Popen([
            CHROME_PATH,
            f"--user-data-dir={path}",
            video_url,
            "--autoplay-policy=no-user-gesture-required",
            "--mute-audio",
            "--start-maximized",
            "--disable-notifications",
            "--disable-popup-blocking",
            "--no-first-run"
        ])

    def open_url_all_browsers(self):

        self.status_label.configure(
            text="Opening all profiles...",
            text_color="#f39c12"
        )

        for p in self.manager.profiles:

            self.launch_browser(
                p['path'],
                p['name']
            )

            time.sleep(2)

        thread = threading.Thread(
            target=self.prepare_youtube_windows,
            daemon=True
        )

        thread.start()

    def prepare_youtube_windows(self):

        time.sleep(10)

        total_profiles = len(self.manager.profiles)

        for i in range(total_profiles):

            try:

                # Mute video
                pyautogui.press("m")

                time.sleep(1)

                # Play video
                pyautogui.press("k")

                time.sleep(2)

                # Switch to next window
                pyautogui.hotkey("alt", "tab")

                time.sleep(2)

            except Exception as e:
                print(e)

        self.status_label.configure(
            text="✓ Videos autoplaying",
            text_color="#27ae60"
        )

    def close_all_browsers(self):

        os.system("taskkill /f /im chrome.exe")

        self.status_label.configure(
            text="✓ Browsers closed",
            text_color="#27ae60"
        )

    # ==========================================
    # COMMENT FUNCTIONS
    # ==========================================
    def post_comment_action(self):

        comment_text = self.comment_entry.get().strip()

        if not comment_text:

            self.status_label.configure(
                text="✗ Enter comment text",
                text_color="#e74c3c"
            )

            return

        self.status_label.configure(
            text="Posting comments...",
            text_color="#f39c12"
        )

        thread = threading.Thread(
            target=self._post_comment_thread,
            args=(comment_text,),
            daemon=True
        )

        thread.start()

    def _post_comment_thread(self, comment_text):

        success_count = 0

        time.sleep(3)

        total_profiles = len(self.manager.profiles)

        for i in range(total_profiles):

            try:

                success = self.comment_current_window(
                    comment_text
                )

                if success:
                    success_count += 1

                pyautogui.hotkey("alt", "tab")

                time.sleep(2)

            except Exception as e:
                print(e)

        self.status_label.configure(
            text=f"✓ Commented on {success_count} profiles",
            text_color="#27ae60"
        )

    def comment_current_window(self, comment_text):

        try:

            # Focus page
            pyautogui.click()

            time.sleep(1)

            # Scroll to comment section
            for _ in range(7):

                pyautogui.scroll(-1000)

                time.sleep(1)

            # Tab navigation
            for _ in range(12):

                pyautogui.press("tab")

                time.sleep(0.2)

            # Open comment box
            pyautogui.press("enter")

            time.sleep(2)

            # Write comment
            pyautogui.write(
                comment_text,
                interval=0.03
            )

            time.sleep(1)

            # Submit comment
            pyautogui.hotkey("ctrl", "enter")

            time.sleep(3)

            return True

        except Exception as e:

            print(e)

            return False


# ==========================================
# RUN APP
# ==========================================
if __name__ == "__main__":

    app = AppUI()

    app.mainloop()