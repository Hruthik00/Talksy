# Talksy Deployment Guide for Render

This guide explains how to deploy the Talksy chat application to Render.com using the free tier.

## Prerequisites

1. [Render account](https://render.com) (free tier is sufficient)
2. [GitHub repository](https://github.com/Hruthik00/Talksy) with your code
3. MongoDB Atlas database
4. Cloudinary account for image uploads

## Deployment Steps

### 1. Deploy the Backend Web Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" and select "Web Service"
3. Connect your GitHub account and select your repository
4. Configure the backend service:
   - **Name**: `talksy-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Plan**: Select "Free"

5. Add these environment variables under "Environment" section:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` 
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

6. Click "Create Web Service"
7. Wait for the service to deploy (this may take a few minutes)
8. Once deployed, note the URL of your backend service (e.g., `https://talksy-api.onrender.com`)

### 2. Deploy the Frontend Static Site

1. Return to the Render dashboard and click "New" again
2. Select "Static Site"
3. Connect to your GitHub repository again
4. Configure the frontend service:
   - **Name**: `talksy` (or your preferred name)
   - **Root Directory**: `frontend` 
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Select "Free"

5. Add this environment variable:
   - `VITE_API_URL`: `https://talksy-api.onrender.com/api` (use your actual backend URL)

6. Click "Create Static Site"
7. Wait for the static site to deploy
8. Once deployed, Render will provide a URL for your frontend (e.g., `https://talksy.onrender.com`)

### 3. Update Backend CORS Settings

1. Go back to your backend service in the Render dashboard
2. Add a new environment variable:
   - `FRONTEND_URL`: The URL of your frontend static site (e.g., `https://talksy.onrender.com`)

3. Click "Save Changes" and wait for the service to redeploy

### 4. Testing Your Deployment

1. Open your frontend URL in a browser
2. Try to sign up or log in
3. Test sending messages and other features
4. If you encounter issues, check the logs in the Render dashboard for both services

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the `FRONTEND_URL` environment variable in your backend service matches exactly with your frontend URL

2. **Connection Issues**: The free tier of Render spins down services after periods of inactivity. The first request after inactivity may take up to 30 seconds to respond.

3. **Environment Variables**: Double-check that all environment variables are correctly set and match your development environment

4. **Build Failures**: Check the build logs in Render for any errors during the build process

### Checking Logs

1. Go to your service in the Render dashboard
2. Click on the "Logs" tab to see real-time logs
3. Look for any error messages that might indicate what's going wrong

## Limitations of Free Tier

1. Services on the free tier will spin down after 15 minutes of inactivity
2. The first request after spin-down may take up to 30 seconds
3. Free tier services have limited resources (CPU/RAM)
4. Free static sites and web services have a soft bandwidth limit

For production use with higher traffic, consider upgrading to a paid plan. 