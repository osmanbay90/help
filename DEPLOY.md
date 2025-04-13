# Deploying VocabFlash as a Static Website

This guide will help you deploy the VocabFlash app as a static website on GitHub Pages or any other static hosting provider.

## Option 1: GitHub Pages

GitHub Pages is a free hosting service that takes HTML, CSS, and JavaScript files directly from a repository on GitHub.

### 1. Prepare Your Repository

1. Create a new repository on GitHub (e.g., `vocab-flash`)
2. Connect your local project to the GitHub repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/vocab-flash.git
git push -u origin main
```

### 2. Automated Deployment with GitHub Actions

The project includes a GitHub Actions workflow file (`.github/workflows/deploy.yml`) that will automatically build and deploy the app to GitHub Pages whenever you push to the main branch.

1. Simply push your code to GitHub:

```bash
git push origin main
```

2. On GitHub, go to your repository settings
3. Navigate to "Pages" in the left sidebar
4. Under "Build and deployment" > "Source", select "GitHub Actions"
5. Wait for the workflow to complete (check the "Actions" tab)

Your site will be available at `https://YOUR_USERNAME.github.io/vocab-flash/`

### 3. Manual Deployment

If you prefer to deploy manually:

1. Use the provided deployment script:

```bash
./scripts/deploy-static.sh
```

2. Commit and push the `docs` folder:

```bash
git add docs
git commit -m "Add static build for GitHub Pages"
git push
```

3. On GitHub, go to your repository settings
4. Navigate to "Pages" in the left sidebar
5. Under "Build and deployment" > "Source", select "Deploy from a branch"
6. Select "main" branch and the "/docs" folder
7. Click "Save"

### 4. Understanding Static Mode

- The app automatically detects when it's running on GitHub Pages and switches to "static mode"
- You can also force static mode by adding `?static=true` to the URL
- In static mode, the app will:
  - Show a notification banner to users explaining the limitations
  - Use local storage for saving flashcards and settings
  - Generate placeholder content for word lookups instead of making API calls
  - Still provide core functionality for learning and reviewing

## Option 2: Netlify or Vercel

Both Netlify and Vercel offer easy deployment from GitHub repositories:

1. Sign up for [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/)
2. Connect your GitHub repository
3. Use the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Environment variables: None required for static mode

## Full Deployment with API Access

To deploy the app with full API functionality, you'll need to:

1. Choose a hosting service that supports Node.js
2. Set the `GEMINI_API_KEY` environment variable
3. Deploy both the frontend and backend

Recommended hosting options:
- Render
- Heroku
- DigitalOcean App Platform
- Railway

## Troubleshooting

If you encounter any issues with the static deployment:

1. Check that the `.nojekyll` file exists in your docs or build directory
2. Verify that all paths in your HTML files are relative, not absolute
3. If assets aren't loading, check that the base URL is correctly set
4. Test locally by running:
   ```bash
   npx serve dist/public
   ```
   and add `?static=true` to the URL