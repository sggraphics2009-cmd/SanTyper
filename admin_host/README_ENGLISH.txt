================================================================================
  SANCHITHA CHARUNYA - SANTYPER PRO ADMIN HOSTING & DEPLOYMENT GUIDE (ENGLISH)
  Target: santyper.netlify.app | Multi-Cloud: GitHub, Netlify, Firebase Hosting
================================================================================

OVERVIEW:
This `admin_host/` folder is your private, local deployment station. It enables
you to deploy the SanTyper Pro web suite to GitHub, Netlify (santyper.netlify.app),
and Firebase Hosting directly from your PC.

KEY PRIVACY & SECURITY FEATURES:
- Admin-only local directory: Never bundled or exposed in public production builds.
- Pre-configured `netlify.toml`: Instant deployment with custom domain, caching,
  brotli compression, and SPA redirects.
- Pre-configured `firebase.json`: Google Cloud CDN hosting with immutable asset caches.
- GitHub Actions CI/CD (`.github/workflows/deploy.yml`): Continuous deployment on push.

FILES IN THIS TOOLKIT:
1. `1_CLICK_FULL_DEPLOY.bat`: Runs production build, stages/commits, pushes to GitHub,
   and triggers Netlify deployment in 1 click.
2. `deploy_control_panel.py`: Rich interactive terminal dashboard with menu options.
3. `RUN_ADMIN_CONTROL_PANEL.bat`: Launches the Python dashboard on Windows.
4. `DEPLOY_TO_GITHUB.bat`: Quick sync to your personal GitHub repository.
5. `DEPLOY_TO_NETLIFY.bat`: Direct production deployment to santyper.netlify.app.
6. `DEPLOY_TO_FIREBASE.bat`: Direct production deployment to Firebase Hosting.
7. `deploy_all.sh`: 1-Click deploy script for macOS / Linux.

HOW TO SET UP SANTYPER.NETLIFY.APP:
1. Create a GitHub repository (e.g. `santyper`) at https://github.com
2. Double-click `DEPLOY_TO_GITHUB.bat` and enter your GitHub repository URL.
3. Sign into https://app.netlify.com with your GitHub account.
4. Click "Add new site" -> "Import an existing project" -> select your repository.
5. Netlify will read `netlify.toml` automatically (Build: `npm run build`, Publish: `dist`).
6. In Site Configuration -> Domain Management, set the site name to `santyper`.
7. Your app is live at: https://santyper.netlify.app
8. Every time you push via `1_CLICK_FULL_DEPLOY.bat`, Netlify updates in ~20 seconds!

PERFORMANCE OPTIMIZATION:
- Assets under `/assets/*` are configured with `Cache-Control: public, max-age=31536000, immutable`.
- Downloadable binaries under `/download/*` have CORS headers and validation caching.
- Dynamic index.html avoids stale caches for instantaneous feature updates.

Engineered by Sanchitha Charunya
================================================================================
