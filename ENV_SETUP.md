# Environment Variables Setup

## Frontend (Next.js)

Create a `.env.local` file in the frontend root directory (`version-1.02/`):

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Production
# NEXT_PUBLIC_API_URL=https://server.pilotprograme.com
# NEXT_PUBLIC_FRONTEND_URL=https://pilotprograme.com
```

## Backend (Flask)

Update the `.env` file in the backend root directory (`backend/`):

```bash
# Development
BACKEND_URL=http://localhost:5000

# Production
# BACKEND_URL=https://server.pilotprograme.com
```

## Deployment Instructions

### Local Development:
- Frontend: Uses `http://localhost:5000` for API calls
- Backend: Uses `http://localhost:5000` for serving images

### Production:
1. Update backend `.env`:
   - Set `BACKEND_URL=https://server.pilotprograme.com`
   
2. Create frontend `.env.local`:
   - Set `NEXT_PUBLIC_API_URL=https://server.pilotprograme.com`
   - Set `NEXT_PUBLIC_FRONTEND_URL=https://pilotprograme.com`

3. Restart both frontend and backend servers after changing environment variables
