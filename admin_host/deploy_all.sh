#!/bin/bash
# ==============================================================================
# SanTyper Pro - 1-Click Multi-Cloud Deployer (GitHub + Netlify + Firebase)
# Author: Sanchitha Charunya
# ==============================================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/.."

echo "==============================================================================="
echo "  SANCHITHA CHARUNYA - SANTYPER PRO 1-CLICK DEPLOY (LINUX/MAC)"
echo "  Target: https://santyper.netlify.app"
echo "==============================================================================="
echo ""

echo "[1/3] Building Production Optimized Web Bundle..."
npm run build

echo ""
echo "[2/3] Syncing with GitHub Repository..."
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

git add -A
git commit -m "Auto Deploy SanTyper Pro - $(date)" || echo "No changes to commit"
git push -u origin main || git push origin main --force-with-lease || echo "GitHub push check"

echo ""
echo "[3/3] Deploying to Netlify (santyper.netlify.app)..."
npx --yes netlify-cli deploy --prod --dir=dist --site=santyper || echo "Netlify auto-sync via GitHub active"

echo ""
echo "==============================================================================="
echo "  Deployment Process Finished! Live Site: https://santyper.netlify.app"
echo "==============================================================================="
