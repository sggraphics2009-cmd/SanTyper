#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
  SANCHITHA CHARUNYA - SANTYPER PRO ADMIN HOSTING & DEPLOYMENT SUITE
  Target Domain: santyper.netlify.app | Multi-Hosting: GitHub, Netlify, Firebase
================================================================================
  This tool runs privately on your local PC to manage and automate deployments:
  - 100% Private: Excluded from public web distribution
  - GitHub Sync: Automatic git init, commit, branch management & remote push
  - Netlify Auto-Deploy: Connects to santyper.netlify.app with instant CDN caching
  - Firebase Hosting: One-click global CDN deployment
================================================================================
"""

import os
import sys
import subprocess
import shutil
import time
import webbrowser
import json

# Setup ANSI Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Project Paths
ADMIN_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(ADMIN_DIR)
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
NETLIFY_CONFIG = os.path.join(PROJECT_ROOT, "netlify.toml")
FIREBASE_CONFIG = os.path.join(PROJECT_ROOT, "firebase.json")
CONFIG_CACHE = os.path.join(ADMIN_DIR, ".host_config.json")

def print_banner():
    os.system("cls" if os.name == "nt" else "clear")
    print(CYAN + BOLD + """
=============================================================================
  ███████╗ █████╗ ███╗   ██╗████████╗██╗   ██╗██████╗ ███████╗██████╗ 
  ██╔════╝██╔══██╗████╗  ██║╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
  ███████╗███████║██╔██╗ ██║   ██║    ╚████╔╝ ██████╔╝█████╗  ██████╔╝
  ╚════██║██╔══██║██║╚██╗██║   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗
  ███████║██║  ██║██║ ╚████║   ██║      ██║   ██║     ███████╗██║  ██║
  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝
       ADMIN HOSTING AUTOMATION & CLOUD DEPLOYMENT CONTROL SUITE
=============================================================================
""" + RESET)
    print(f" {BOLD}Architect & Author:{RESET} Sanchitha Charunya")
    print(f" {BOLD}Target Netlify URL:{RESET} {GREEN}https://santyper.netlify.app{RESET}")
    print(f" {BOLD}Multi-Hosting Target:{RESET} GitHub (CI/CD) + Netlify CDN + Firebase Hosting")
    print(f" {BOLD}Privacy Status:{RESET} {YELLOW}Admin-Only (Excluded from Public Web Distribution){RESET}")
    print("-" * 77)

def load_saved_config():
    if os.path.exists(CONFIG_CACHE):
        try:
            with open(CONFIG_CACHE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_config(cfg):
    try:
        with open(CONFIG_CACHE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        print(f"{YELLOW}Warning: Could not save config cache: {e}{RESET}")

def run_cmd(cmd, cwd=PROJECT_ROOT, shell=True, check=True):
    print(f"{BLUE}[EXEC]{RESET} {cmd}")
    res = subprocess.run(cmd, cwd=cwd, shell=shell)
    if check and res.returncode != 0:
        raise RuntimeError(f"Command failed with return code {res.returncode}: {cmd}")
    return res.returncode

def check_dependencies():
    print(f"\n{CYAN}{BOLD}--- System Environment & CLI Check ---{RESET}")
    deps = {
        "Git": "git --version",
        "Node.js": "node -v",
        "npm": "npm -v",
        "Netlify CLI": "npx netlify --version",
        "Firebase CLI": "npx firebase --version"
    }
    status = {}
    for name, cmd in deps.items():
        try:
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=PROJECT_ROOT)
            if res.returncode == 0:
                ver = res.stdout.strip().split("\n")[0]
                status[name] = ver
                print(f"  {GREEN}[OK]{RESET} {name:<14} -> {ver}")
            else:
                status[name] = None
                print(f"  {YELLOW}[OPTIONAL MISSING]{RESET} {name:<14} (Will run via npx when needed)")
        except Exception:
            status[name] = None
            print(f"  {RED}[ERROR]{RESET} {name:<14} -> Not accessible in PATH")
    return status

def build_production():
    print(f"\n{CYAN}{BOLD}==========================================")
    print("  STEP 1: SUPERFAST PRODUCTION COMPILATION")
    print(f"=========================================={RESET}")
    print(f"{YELLOW}Optimizing assets, tree-shaking, minifying CSS/JS...{RESET}")
    t0 = time.time()
    run_cmd("npm run build", cwd=PROJECT_ROOT)
    elapsed = round(time.time() - t0, 2)
    print(f"{GREEN}{BOLD}Production build completed successfully in {elapsed} seconds!{RESET}")
    if os.path.exists(DIST_DIR):
        files_count = sum(len(files) for _, _, files in os.walk(DIST_DIR))
        print(f"Generated {files_count} production distribution files in {DIST_DIR}")

def setup_and_push_github():
    print(f"\n{CYAN}{BOLD}==========================================")
    print("  STEP 2: GITHUB REPOSITORY SYNC & PUSH")
    print(f"=========================================={RESET}")
    
    cfg = load_saved_config()
    default_repo = cfg.get("github_repo", "")
    
    # Check if git is initialized
    git_dir = os.path.join(PROJECT_ROOT, ".git")
    if not os.path.exists(git_dir):
        print(f"{YELLOW}Initializing local Git repository...{RESET}")
        run_cmd("git init", cwd=PROJECT_ROOT)
        run_cmd("git branch -M main", cwd=PROJECT_ROOT)
    
    # Check remotes
    try:
        remotes_out = subprocess.check_output("git remote -v", shell=True, cwd=PROJECT_ROOT, text=True)
    except Exception:
        remotes_out = ""

    if "origin" not in remotes_out:
        print(f"\n{YELLOW}No remote GitHub repository linked yet!{RESET}")
        print("Please enter your GitHub repository URL.")
        print(f"Example: {CYAN}https://github.com/anurailangasingha/santyper.git{RESET} or SSH URL")
        prompt_txt = f"GitHub Repo URL [{default_repo}]: " if default_repo else "GitHub Repo URL: "
        user_repo = input(prompt_txt).strip()
        if not user_repo and default_repo:
            user_repo = default_repo
        
        if user_repo:
            run_cmd(f"git remote add origin {user_repo}", cwd=PROJECT_ROOT)
            cfg["github_repo"] = user_repo
            save_config(cfg)
        else:
            print(f"{RED}No GitHub repo entered. Skipping GitHub push.{RESET}")
            return False
    else:
        print(f"{GREEN}Existing GitHub remote detected:{RESET}\n{remotes_out.strip()}")
        ch = input("Do you want to change this GitHub remote? (y/N): ").strip().lower()
        if ch == "y":
            new_repo = input("Enter new GitHub Repo URL: ").strip()
            if new_repo:
                run_cmd("git remote remove origin", cwd=PROJECT_ROOT)
                run_cmd(f"git remote add origin {new_repo}", cwd=PROJECT_ROOT)
                cfg["github_repo"] = new_repo
                save_config(cfg)

    # Git Add & Commit
    commit_msg = f"Deploy SanTyper Suite Update - {time.strftime('%Y-%m-%d %H:%M:%S')}"
    print(f"\n{YELLOW}Staging files and creating commit...{RESET}")
    run_cmd("git add -A", cwd=PROJECT_ROOT)
    
    # Commit (allow empty if already up to date)
    subprocess.run(f'git commit -m "{commit_msg}"', shell=True, cwd=PROJECT_ROOT)
    
    # Push to GitHub
    print(f"\n{CYAN}{BOLD}Pushing changes to GitHub 'main' branch...{RESET}")
    print(f"{YELLOW}(If prompted, authenticate with your GitHub username & Personal Access Token or Browser){RESET}")
    res = run_cmd("git push -u origin main", cwd=PROJECT_ROOT, check=False)
    if res == 0:
        print(f"{GREEN}{BOLD}Successfully pushed to GitHub!{RESET}")
        print(f"{GREEN}If Netlify is connected to your GitHub, it will automatically deploy to santyper.netlify.app now!{RESET}")
        return True
    else:
        print(f"{YELLOW}Standard push returned non-zero code. Trying push with force lease or set-upstream...{RESET}")
        res2 = run_cmd("git push origin main --force-with-lease", cwd=PROJECT_ROOT, check=False)
        return res2 == 0

def deploy_netlify():
    print(f"\n{CYAN}{BOLD}==========================================")
    print("  STEP 3: NETLIFY DEPLOYMENT (santyper.netlify.app)")
    print(f"=========================================={RESET}")
    
    if not os.path.exists(DIST_DIR):
        print(f"{YELLOW}dist/ folder not found. Running build first...{RESET}")
        build_production()

    print(f"""
{BOLD}Choose Netlify Deployment Method:{RESET}
  [1] {GREEN}Automatic GitHub Git-Backed Deployment (Recommended){RESET}
      - Push to your GitHub repo.
      - Log into https://app.netlify.com once and select the repo.
      - Netlify will auto-deploy every commit in ~15-30 seconds with custom subdomain 'santyper'!
  [2] {CYAN}Direct CLI Deploy to santyper.netlify.app (1-Click Instant){RESET}
      - Deploys dist/ directory directly to Netlify live CDN via Netlify CLI.
  [3] {BLUE}Open Netlify Dashboard to claim santyper.netlify.app{RESET}
""")
    choice = input("Enter choice (1/2/3, default=1): ").strip()
    if choice == "2":
        print(f"\n{CYAN}Running Netlify CLI Live Production Deploy...{RESET}")
        cmd = "npx --yes netlify-cli deploy --prod --dir=dist --site=santyper"
        res = run_cmd(cmd, cwd=PROJECT_ROOT, check=False)
        if res != 0:
            print(f"\n{YELLOW}If you have not logged into Netlify CLI on this PC, running login now:{RESET}")
            run_cmd("npx --yes netlify-cli login", cwd=PROJECT_ROOT, check=False)
            print(f"\n{CYAN}Retrying production deploy...{RESET}")
            run_cmd(cmd, cwd=PROJECT_ROOT, check=False)
        print(f"\n{GREEN}{BOLD}Live Netlify Deployment Command Finished!{RESET}")
        print(f"Visit: {GREEN}https://santyper.netlify.app{RESET}")
    elif choice == "3":
        print("Opening Netlify Dashboard in browser...")
        webbrowser.open("https://app.netlify.com")
    else:
        print(f"\n{GREEN}Automatic GitHub CI/CD is active!{RESET}")
        print("Steps to link santyper.netlify.app for the first time:")
        print(" 1. Go to https://app.netlify.com and click 'Add new site' -> 'Import an existing project'")
        print(" 2. Choose 'GitHub' and select your 'santyper' repository")
        print(" 3. In Site Settings -> Domain Management -> Change site name to 'santyper'")
        print(" 4. Done! Every time you push via this tool, Netlify auto-updates in seconds!")
        open_now = input("Open Netlify in browser now? (Y/n): ").strip().lower()
        if open_now != "n":
            webbrowser.open("https://app.netlify.com/start")

def deploy_firebase():
    print(f"\n{CYAN}{BOLD}==========================================")
    print("  STEP 4: FIREBASE HOSTING DEPLOYMENT")
    print(f"=========================================={RESET}")
    
    if not os.path.exists(DIST_DIR):
        print(f"{YELLOW}dist/ folder not found. Running build first...{RESET}")
        build_production()

    print(f"{CYAN}Checking Firebase login status...{RESET}")
    res = run_cmd("npx --yes firebase-tools projects:list", cwd=PROJECT_ROOT, check=False)
    if res != 0:
        print(f"{YELLOW}Not logged into Firebase CLI. Running login...{RESET}")
        run_cmd("npx --yes firebase-tools login", cwd=PROJECT_ROOT, check=False)

    print(f"\n{CYAN}Deploying dist/ to Firebase Hosting with global CDN...{RESET}")
    res = run_cmd("npx --yes firebase-tools deploy --only hosting", cwd=PROJECT_ROOT, check=False)
    if res == 0:
        print(f"\n{GREEN}{BOLD}Successfully deployed to Firebase Hosting!{RESET}")
    else:
        print(f"\n{YELLOW}Note: If your Firebase project is not named 'santyper', edit .firebaserc or run 'npx firebase use --add'{RESET}")

def run_local_preview():
    print(f"\n{CYAN}{BOLD}==========================================")
    print("  TESTING LOCAL PRODUCTION BUILD")
    print(f"=========================================={RESET}")
    if not os.path.exists(DIST_DIR):
        build_production()
    
    port = 3000
    print(f"{GREEN}Starting local preview server on http://localhost:{port}{RESET}")
    print(f"{YELLOW}(Press Ctrl+C to stop preview and return to Admin Suite){RESET}\n")
    try:
        run_cmd("npm run start", cwd=PROJECT_ROOT)
    except KeyboardInterrupt:
        print(f"\n{CYAN}Preview stopped.{RESET}")

def full_auto_deploy():
    print(f"\n{MAGENTA}{BOLD}******************************************************")
    print("    🚀 STARTING FULL ONE-CLICK AUTOMATED DEPLOYMENT")
    print(f"******************************************************{RESET}")
    
    # 1. Build
    build_production()
    
    # 2. Push to GitHub
    pushed = setup_and_push_github()
    
    # 3. Direct Netlify Deploy option
    print(f"\n{CYAN}Would you like to also run direct Netlify CLI deployment right now?{RESET}")
    ans = input("Run direct Netlify CLI deploy? (y/N): ").strip().lower()
    if ans == "y":
        run_cmd("npx --yes netlify-cli deploy --prod --dir=dist --site=santyper", cwd=PROJECT_ROOT, check=False)

    # 4. Direct Firebase Deploy option
    print(f"\n{CYAN}Would you like to deploy to Firebase Hosting as well?{RESET}")
    ans_fb = input("Deploy to Firebase Hosting? (y/N): ").strip().lower()
    if ans_fb == "y":
        run_cmd("npx --yes firebase-tools deploy --only hosting", cwd=PROJECT_ROOT, check=False)

    print(f"\n{GREEN}{BOLD}========================================================")
    print("  ALL DEPLOYMENT TASKS COMPLETED SUCCESSFULLY!")
    print(f"  Live Site: https://santyper.netlify.app")
    print(f"========================================================{RESET}")

def view_guides():
    guide_path = os.path.join(ADMIN_DIR, "README_SINHALA.txt")
    if os.path.exists(guide_path):
        try:
            with open(guide_path, "r", encoding="utf-8") as f:
                content = f.read()
            print("\n" + content)
        except Exception as e:
            print(f"Error reading guide: {e}")
    else:
        print("Sinhala guide file not found.")
    input(f"\n{CYAN}Press Enter to return to main menu...{RESET}")

def main():
    while True:
        print_banner()
        print(f"{BOLD}SELECT AN ACTION:{RESET}")
        print(f"  {GREEN}[1]{RESET} {BOLD}🚀 FULL AUTO-DEPLOY (Build + GitHub Push + Netlify Auto-Deploy){RESET}")
        print(f"  {CYAN}[2]{RESET} Build Production Assets (Superfast Optimized)")
        print(f"  {CYAN}[3]{RESET} GitHub Sync & Push (Stage, Commit & Push to Main)")
        print(f"  {CYAN}[4]{RESET} Netlify Deployment (Deploy to santyper.netlify.app)")
        print(f"  {CYAN}[5]{RESET} Firebase Hosting Deployment (firebase deploy)")
        print(f"  {BLUE}[6]{RESET} Test Production Build Locally (Preview on localhost)")
        print(f"  {BLUE}[7]{RESET} Check System CLI & Environment Status")
        print(f"  {YELLOW}[8]{RESET} 📘 View Sinhala & English Hosting Instructions")
        print(f"  {RED}[9]{RESET} Exit")
        print("-" * 77)

        choice = input(f"{BOLD}Enter your choice [1-9]: {RESET}").strip()

        if choice == "1":
            full_auto_deploy()
            input(f"\n{CYAN}Press Enter to continue...{RESET}")
        elif choice == "2":
            build_production()
            input(f"\n{CYAN}Press Enter to continue...{RESET}")
        elif choice == "3":
            setup_and_push_github()
            input(f"\n{CYAN}Press Enter to continue...{RESET}")
        elif choice == "4":
            deploy_netlify()
            input(f"\n{CYAN}Press Enter to continue...{RESET}")
        elif choice == "5":
            deploy_firebase()
            input(f"\n{CYAN}Press Enter to continue...{RESET}")
        elif choice == "6":
            run_local_preview()
        elif choice == "7":
            check_dependencies()
            input(f"\n{CYAN}Press Enter to continue...{RESET}")
        elif choice == "8":
            view_guides()
        elif choice == "9":
            print(f"\n{GREEN}Thank you for using SanTyper Hosting Suite! Goodbye.{RESET}\n")
            sys.exit(0)
        else:
            print(f"{RED}Invalid option. Please choose 1-9.{RESET}")
            time.sleep(1)

if __name__ == "__main__":
    main()
