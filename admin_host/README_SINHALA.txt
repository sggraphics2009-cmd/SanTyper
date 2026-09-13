================================================================================
  SANCHITHA CHARUNYA - SANTYPER PRO ADMIN HOSTING & DEPLOYMENT GUIDE (SINHALA)
  Target Domain: santyper.netlify.app | GitHub Repo | Firebase Hosting
================================================================================

ආයුබෝවන්!
ඔබගේ SanTyper Pro වෙබ් අඩවිය GitHub, Netlify (santyper.netlify.app) සහ 
Firebase Hosting වෙත පහසුවෙන්ම ඔබගේ PC එකෙන් 100% ආරක්ෂිතව host කරගැනීම සඳහා 
මෙම "admin_host" suite එක සකසා ඇත.

මෙම Tool එක වෙබ් අඩවියේ සාමාන්‍ය visitor ලාට නොපෙනෙන සේ (Admin-only local folder)
සම්පූර්ණයෙන්ම ආරක්ෂිතව වෙන් කර ඇත.

--------------------------------------------------------------------------------
ක්‍රමය 1: 1-CLICK AUTO DEPLOY (ඉතාමත්ම පහසු ක්‍රමය)
--------------------------------------------------------------------------------
1. ඔබගේ PC එකේ ඇති මෙම "admin_host" ෆෝල්ඩරය වෙත යන්න.
2. "1_CLICK_FULL_DEPLOY.bat" (Windows) මත Double-Click කරන්න.
   (macOS හෝ Linux නම් "deploy_all.sh" run කරන්න).
3. මෙමගින් ස්වයංක්‍රීයව:
   - Superfast Production Web Build එක හදයි (npm run build)
   - ඔබගේ GitHub repository එකට code එක commit කර push කරයි
   - Netlify හරහා santyper.netlify.app වෙත සෘජුවම host කරයි!

--------------------------------------------------------------------------------
ක්‍රමය 2: INTERACTIVE PYTHON CONTROL PANEL එක භාවිතා කිරීම
--------------------------------------------------------------------------------
1. "RUN_ADMIN_CONTROL_PANEL.bat" මත Double-Click කරන්න.
   (නැතහොත් terminal එකේ `python admin_host/deploy_control_panel.py` run කරන්න).
2. ඔබට අවශ්‍ය Option එක තෝරන්න:
   [1] Full Auto-Deploy (Build + GitHub + Netlify)
   [2] Production Build එක පමණක් හැදීම
   [3] GitHub වෙත Push කිරීම
   [4] Netlify (santyper.netlify.app) වෙත Deploy කිරීම
   [5] Firebase Hosting වෙත Deploy කිරීම
   [6] Local එකේ වෙබ් අඩවිය test කර බැලීම

--------------------------------------------------------------------------------
GITHUB සහ NETLIFY (santyper.netlify.app) සම්බන්ධ කරගන්නා ආකාරය (පළමු වතාවේදී):
--------------------------------------------------------------------------------
පියවර 1: GitHub Repository එකක් සාදාගැනීම
1. https://github.com වෙත ගොස් ඔබගේ account එකට log වන්න.
2. "New Repository" එකක් සාදන්න (නම: "santyper").
3. Repo එකේ URL එක copy කරගන්න (උදා: https://github.com/anurailangasingha/santyper.git).
4. "DEPLOY_TO_GITHUB.bat" එක run කර එම URL එක paste කරන්න.
   දැන් සම්පූර්ණ website code එක GitHub එකට push වේ!

පියවර 2: Netlify වෙතින් Auto-Host කරගැනීම
1. https://app.netlify.com වෙත ගොස් ඔබගේ GitHub account එකෙන් Sign In වන්න.
2. "Add new site" -> "Import an existing project" ක්ලික් කරන්න.
3. "GitHub" තෝරා ඔබ push කළ "santyper" repository එක තෝරන්න.
4. "Site configuration" හි:
   - Build command: npm run build
   - Publish directory: dist
   (මෙම settings `netlify.toml` file එක මගින් දැනටමත් ස්වයංක්‍රීයව සකසා ඇත!)
5. "Deploy santyper" ක්ලික් කරන්න.
6. Site Settings -> "Domain management" වෙත ගොස් "Options" -> "Edit site name" 
   මත ක්ලික් කර "santyper" ලෙස නම වෙනස් කරන්න.
   දැන් ඔබගේ වෙබ් අඩවිය https://santyper.netlify.app ලෙස ලෝකයටම විවෘත වේ!

විශේෂ වාසිය:
මීට පසු ඔබ "1_CLICK_FULL_DEPLOY.bat" run කර push කරන ඕනෑම මොහොතක, 
තත්පර 15-30ක් ඇතුළත Netlify විසින් ස්වයංක්‍රීයව නව වෙනස්කම් Live Host කරනු ඇත!

--------------------------------------------------------------------------------
FIREBASE HOSTING වෙත HOST කරන ආකාරය:
--------------------------------------------------------------------------------
1. https://console.firebase.google.com වෙත ගොස් Project එකක් සාදන්න (උදා: "santyper").
2. "DEPLOY_TO_FIREBASE.bat" run කරන්න.
3. Firebase login එක browser එකෙන් authorize කරන්න.
4. ස්වයංක්‍රීයව Google ගේ ultra-fast CDN එක මත වෙබ් අඩවිය host වේ!

--------------------------------------------------------------------------------
SUPERFAST PERFORMANCE රහස:
--------------------------------------------------------------------------------
අපි root එකේ සාදා ඇති `netlify.toml` සහ `firebase.json` මගින්:
- CSS, JS, Images, Fonts සහ Downloadable Apps සියල්ල 1-year immutable caching 
  සහ Brotli/Gzip compression මගින් ලොව ඕනෑම තැනක සිට මිලි තත්පර ගණනකින් load වේ!
- SPA Client-Side Routing සම්පූර්ණයෙන්ම සකසා ඇත.

සැකසුම: Sanchitha Charunya (Software Engineer & Lead Architect)
================================================================================
