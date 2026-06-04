# Class Hub LMS Deployment Checklist

## Required Environment Variables

- `NEXTAUTH_URL`: Set to the production HTTPS app URL.
- `NEXTAUTH_SECRET`: Use a strong generated secret.
- `MONGODB_URI`: Use the production MongoDB connection string.
- `CLOUDINARY_CLOUD_NAME`: Required for course thumbnail uploads.
- `CLOUDINARY_API_KEY`: Required for course thumbnail uploads.
- `CLOUDINARY_API_SECRET`: Required for course thumbnail uploads and cleanup.
- `RESEND_API_KEY`: Required for email verification.
- `RESEND_FROM_EMAIL`: Verified sender identity for Resend emails.

## Optional Provider Variables

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `APPLE_CLIENT_ID`
- `APPLE_CLIENT_SECRET`

## Production Readiness Checks

- Use HTTPS for `NEXTAUTH_URL`.
- Confirm the production domain is configured in every OAuth provider.
- Confirm Resend sender domain is verified.
- Confirm MongoDB Atlas network access allows the deployment platform.
- Confirm Cloudinary credentials are from the production media account.
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Run `npm run build`.
- Create the first admin/educator accounts before launch.
- Test signup, email verification, login, enrollment, payment simulation, progress completion, certificate download, review submission, and educator course deletion in production.

## Current Production Blockers To Verify

- `.env.local` values are local only and must not be reused blindly in production.
- `NEXTAUTH_SECRET`, `MONGODB_URI`, `CLOUDINARY_*`, and `RESEND_API_KEY` must be set before deployment.
- OAuth provider credentials are optional only if those providers are not advertised to users.
