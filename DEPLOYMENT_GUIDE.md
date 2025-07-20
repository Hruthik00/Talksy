# Deployment Guide for Chatty App

This guide will help you deploy the Chatty App on Render's free tier.

## Prerequisites

1. A [Render](https://render.com/) account
2. A [GitHub](https://github.com/) account with your project pushed to a repository

## Backend Deployment

1. Log in to your Render account
2. Click on "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the Web Service:
   - **Name**: `chatty-app-backend` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if your backend is in a subdirectory)

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically set the PORT, but you can specify it)
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: The URL of your frontend (e.g., `https://chatty-app-frontend.onrender.com`)
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

6. Select the free tier plan
7. Click "Create Web Service"

## Frontend Deployment

1. Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=https://chatty-app-backend.onrender.com
   ```

2. Log in to your Render account
3. Click on "New +" and select "Static Site"
4. Connect your GitHub repository
5. Configure the Static Site:
   - **Name**: `chatty-app-frontend` (or any name you prefer)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: Leave empty if your repo root contains both frontend and backend

6. Add the following environment variables:
   - `VITE_API_URL`: The URL of your backend (e.g., `https://chatty-app-backend.onrender.com`)

7. Click "Create Static Site"

## Important Notes

1. **CORS Configuration**: The backend is already configured to accept requests from the frontend domain.

2. **Cookies and Authentication**: Make sure your cookies are set with:
   - `sameSite: 'none'`
   - `secure: true` (in production)

3. **Environment Variables**: Double-check that all environment variables are set correctly.

4. **Free Tier Limitations**:
   - Render's free tier services spin down after periods of inactivity
   - The first request after inactivity may take up to 30 seconds to respond
   - Free tier has limited bandwidth and computing resources

5. **Debugging Deployment Issues**:
   - Check Render logs for both services
   - Verify network requests in the browser console
   - Ensure all environment variables are set correctly
   - Check that CORS is properly configured

## Testing Your Deployment

1. Navigate to your frontend URL (e.g., `https://chatty-app-frontend.onrender.com`)
2. Try to sign up or log in
3. Test real-time features like messaging and typing indicators
4. Verify that image uploads work correctly

If you encounter any issues, check the browser console and Render logs for error messages. 