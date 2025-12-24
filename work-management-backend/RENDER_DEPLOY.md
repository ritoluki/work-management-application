# Render Deployment Guide

## Environment Variables Required

Set these in Render Dashboard → Environment:

```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=<Your Render PostgreSQL connection string>
DB_USERNAME=<Your database username>
DB_PASSWORD=<Your database password>
FRONTEND_URL=https://work-management-application.vercel.app
SEED_DATA=true
PORT=8080
```

## Database Configuration

### Using Render PostgreSQL (Recommended)

1. Create a new PostgreSQL database on Render
2. Render will provide a `DATABASE_URL` in the format: `postgresql://user:password@host:port/database`
3. Set the `DATABASE_URL` environment variable to this connection string
4. The application will automatically detect and use PostgreSQL driver and dialect

### Using External MySQL

If you prefer MySQL:
1. Set `DATABASE_URL` to your MySQL connection string: `jdbc:mysql://host:port/database`
2. The application will automatically detect and use MySQL driver and dialect

## Deployment Steps

1. **Connect GitHub Repository**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub account and select the repository

2. **Configure Service**
   - Name: `work-management-backend`
   - Environment: `Docker`
   - Branch: `main`
   - Docker Command: (leave default)

3. **Set Environment Variables**
   Add all the variables listed above in the Environment section

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

## Verification

After deployment:

1. Check the logs for successful startup
2. Visit `https://your-service.onrender.com/api/health` (if health endpoint exists)
3. Test API endpoints to ensure database connectivity

## Troubleshooting

### Instance Failed Errors

If you see "Instance failed" errors:
- Verify `DATABASE_URL` is correctly set
- Ensure `SPRING_PROFILES_ACTIVE=prod` is set
- Check that database is accessible from Render
- Review application logs for specific error messages

### Database Connection Issues

- Verify database credentials are correct
- Ensure database accepts connections from Render's IP addresses
- Check that the database name exists

### CORS Issues

- Update `FRONTEND_URL` to match your actual frontend deployment URL
- Ensure the URL does not have a trailing slash

## Notes

- The free tier on Render will spin down after inactivity
- First request after spin down may take 30-60 seconds
- Database will persist data even when service is inactive
