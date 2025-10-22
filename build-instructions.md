Build & Obfuscation instructions (Windows PowerShell)

Goal: Minify/obfuscate client JS files and update index.html to use the obfuscated bundle.

1) Install Node.js and npm if not already installed.

2) From project root (d:\Alar_Aud) run in PowerShell:

# init + install tools
npm init -y
npm install --save-dev terser javascript-obfuscator concat-cli

# create build folder
mkdir build

# concatenate important JS into single file then minify and obfuscate
npx concat-cli -f js/fireworks.js js/balloons.js js/script2.js js/script.js js/admin.js -o build/app.concat.js
npx terser build/app.concat.js -c -m -o build/app.min.js
npx javascript-obfuscator build/app.min.js --output build/app.obf.js --compact true --controlFlowFlattening true --numbersToExpressions true --stringArray true --stringArrayEncoding base64 --rotateStringArray true --disableConsoleOutput true

3) Replace script tags in index.html to point to build/app.obf.js instead of individual files.

4) Optional: Pack as Electron app
npm install --save electron electron-packager
# add basic main.js and package.json "main" then run packager
npx electron-packager . MyQuizApp --platform=win32 --arch=x64 --out=dist --overwrite

Notes:
- Obfuscation increases difficulty to read code but can't fully prevent reverse-engineering.
- Keep a private un-obfuscated source repository for maintenance and legal evidence.
- Consider moving sensitive logic to a server for real protection.