# Simple Deployment Guide for Wellness Calendar

This guide provides easy-to-follow instructions for deploying your Wellness Calendar website to GitHub and Netlify without using any command line tools.

## What's Included

- A complete, simplified wellness calendar website
- Exercise program integration as a separate tab
- Fixed date display that shows today's actual date
- Full calendar navigation for all 365 days
- Local data storage for tracking your progress

## Deployment Steps

### Step 1: Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "wellness-calendar")
4. Make it public (unless you prefer private)
5. Skip adding README, .gitignore, or license files
6. Click "Create repository"

### Step 2: Upload the Files to GitHub

1. On your new empty repository page, you'll see "Quick setup" options
2. Click on the "uploading an existing file" link
3. Extract the `wellness_calendar_simplified.zip` file on your computer
4. Open the extracted folder and select all files and folders inside
5. Drag and drop them onto the GitHub upload area
6. Add a commit message like "Initial upload of wellness calendar"
7. Click "Commit changes"

### Step 3: Connect to Netlify

1. Go to [Netlify.com](https://app.netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Select GitHub as your Git provider
4. Find and select your new repository ("wellness-calendar")
5. In the deploy settings:
   - Leave the build command blank
   - Set the publish directory to `/` (root directory)
6. Click "Deploy site"

### Step 4: Configure Your Site

1. Once deployed, click on "Site settings"
2. You can change your site name under "Site information" → "Change site name"
3. Your site will be available at `https://your-site-name.netlify.app`

## Verifying Your Deployment

After deployment, check that:

1. The calendar displays today's actual date
2. You can navigate through all days using the arrow buttons
3. The exercise program tab works correctly
4. Your progress is saved when you click the "Save Progress" button

## Troubleshooting

If your site doesn't work correctly:

1. **Calendar data not loading**: Make sure the data files were uploaded correctly to GitHub
2. **Blank page**: Check that all files were uploaded to the root directory, not inside a subfolder
3. **Navigation not working**: Try clearing your browser cache and reloading the page

## Making Future Updates

To update your site in the future:

1. Go to your GitHub repository
2. Navigate to the file you want to change
3. Click the pencil icon to edit the file
4. Make your changes and commit them
5. Netlify will automatically rebuild and deploy your site

## Need Help?

If you encounter any issues with your deployment, please reach out for assistance.
