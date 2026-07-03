# 🌟 Lucky Bhaiya - Class 9 & 10 NCERT Prep Hub

Welcome to the **Lucky Bhaiya NCERT Preparation Portal**! This is a modern, high-performance web application designed to help Class 9 and Class 10 students master mathematics, science, English, social science, and Hindi, featuring hand-crafted notes, interactive mind maps, and full mock MCQ and PYQ banks.

---

## 🚀 How to Publish to GitHub Pages (Automatic Deployment)

This repository includes a pre-configured **GitHub Actions workflow** located in `.github/workflows/deploy.yml` which will automatically compile and publish your website whenever you push code changes to GitHub.

Follow these simple steps to put your application live:

### 1. Create a New GitHub Repository
1. Log in to your GitHub account.
2. Click **New** (or go to [github.new](https://github.new)) to create a new repository.
3. Name your repository (e.g., `lucky-bhaiya-prep`).
4. Set the visibility to **Public** (required for the free tier of GitHub Pages).
5. **Do NOT** check "Add a README", "Add .gitignore", or "Choose a license" (this project already includes them).
6. Click **Create repository**.

---

### 2. Push Your Files to GitHub
Open your local terminal in this project's directory and run the following commands to link your project and push it to GitHub:

```bash
# 1. Initialize local Git repository
git init

# 2. Add all files to staging
git add .

# 3. Commit your changes
git commit -m "Initial commit: Lucky Bhaiya prep platform with GitHub Actions"

# 4. Rename the default branch to 'main'
git branch -M main

# 5. Link to your new GitHub repository (replace with your repository's actual URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# 6. Push your files to GitHub
git push -u origin main
```

---

### 3. Enable GitHub Actions Deployment in Settings
Once your files are pushed, you must tell GitHub to use the **GitHub Actions workflow** to publish your site:

1. On your GitHub repository page, go to the **Settings** tab (gear icon at the top).
2. On the left sidebar under the "Code and automation" section, click on **Pages**.
3. Under the **Build and deployment** section:
   - For **Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
4. That's it! GitHub Actions will now automatically start building and deploying your app.

---

### 4. Monitor & View Your Live Site
1. Go to the **Actions** tab at the top of your repository page.
2. You will see a workflow running named `Deploy to GitHub Pages`.
3. Click on the running workflow to watch the build and deployment progress in real-time.
4. Once completed, a green checkmark will appear, and the build output will show a direct link to your live site (e.g., `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/`).

---

## 📁 Exact Files to Upload / Push to GitHub

Here is the exact file list that should be included in your repository. Our pre-configured `.gitignore` handles this automatically so you don't accidentally upload large temporary files or cache directories.

### ✅ DO Upload (These are in your workspace root):
* `.github/` (Contains the automated build workflow)
* `src/` (All React components, styles, data, and logic)
* `public/` (App assets, logo illustrations, and icons)
* `index.html` (The primary entry point)
* `package.json` & `package-lock.json` (Managed dependency manifests)
* `vite.config.ts` (Build system configuration)
* `tsconfig.json` & related `tsconfig.*.json` (TypeScript environments)
* `tailwind.config.js` (Styling rules)
* `firestore.rules` (Security rules)
* `metadata.json` (Platform settings)
* `README.md` (This documentation file)

### ❌ DO NOT Upload (Auto-ignored by `.gitignore`):
* `node_modules/` (Downloaded dependencies - GitHub Actions installs these automatically during build)
* `dist/` (Local compiled production files - GitHub Actions builds this directly in the cloud)
* `.env` or other local environment configurations containing API credentials.

---

## 🔧 Developing Locally

If you want to run or edit this project locally on your computer, follow these steps:

1. **Install Node.js** (Version 18 or higher recommended).
2. Open your terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` (or the port specified in your console) to view and test changes in real-time.
6. To generate a local production build manually:
   ```bash
   npm run build
   ```
