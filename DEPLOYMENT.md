# Deploying Talksy to Render

This guide explains how to deploy the Talksy chat application to Render.com.

## Prerequisites

1. A [Render account](https://render.com)
2. Your project code pushed to a GitHub repository
3. MongoDB Atlas database (or another MongoDB provider)
4. Cloudinary account for image uploads

## Deployment Steps

### 1. Set Up Environment Variables

Before deploying, make sure you have the following environment variables ready:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### 2. Deploy Using the Dashboard

#### Backend API Service

1. Log in to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `talksy-api` (or your preferred name)
   - **Runtime**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render assigns its own port, but we set this as a fallback)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `FRONTEND_URL`: URL of your frontend (e.g., `https://talksy.onrender.com`)
6. Click "Create Web Service"

#### Frontend Static Site

1. In your Render dashboard, click "New" and select "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `talksy` (or your preferred name)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add the following environment variable:
   - `VITE_API_URL`: URL of your backend API (e.g., `https://talksy-api.onrender.com/api`)
5. Click "Create Static Site"

### 3. Deploy Using render.yaml (Blueprint)

Alternatively, you can use the `render.yaml` file in the root of this repository to deploy both services at once:

1. Log in to your Render dashboard
2. Click "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and set up both services
5. You'll need to manually add the secret environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Click "Apply" to deploy both services

### 4. Verify Deployment

1. Once both services are deployed, check the logs for any errors
2. Visit your frontend URL (e.g., `https://talksy.onrender.com`)
3. Test the application by signing up, logging in, and sending messages

## Troubleshooting

- **CORS Issues**: Ensure the `FRONTEND_URL` environment variable in the backend service matches your actual frontend URL
- **Connection Errors**: Check the backend logs to ensure it's connecting to MongoDB properly
- **Build Failures**: Verify that all dependencies are correctly listed in your package.json files

## Scaling (Optional)

If your application grows, consider:

1. Upgrading your Render service plans for more resources
2. Setting up a Redis instance for more efficient socket.io scaling
3. Implementing a CDN for static assets 