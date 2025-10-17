# Neustream Admin Panel

Admin dashboard for managing the Neustream streaming platform.

## Features

- **Authentication**: Secure admin login via Google OAuth
- **Dashboard**: System overview with real-time statistics
- **User Management**: View and manage all registered users
- **Stream Monitoring**: Real-time active streams monitoring
- **Settings**: System configuration and preferences

## Tech Stack

- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** with shadcn/ui components
- **Axios** for API communication
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- Neustream control-plane running (http://localhost:3000)

### Installation

1. Clone the repository and navigate to the admin directory:
   ```bash
   cd admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Authentication

The admin panel uses Google OAuth for authentication. You must be signed in as `admin@neustream.app` to access the admin features.

### Setup

1. Ensure your Google OAuth credentials are configured in the control-plane
2. The admin user `admin@neustream.app` should exist in the database
3. Login through the Google OAuth flow

## API Integration

The admin panel connects to these control-plane endpoints:

### Existing Endpoints
- `POST /api/auth/validate-token` - Token validation
- `GET /api/streams/active` - Get active streams
- `GET /api/streams/forwarding/:streamKey` - Get stream details

### Required Admin Endpoints
The following endpoints need to be implemented in the control-plane:

```javascript
// GET /api/admin/users - Get all users
// GET /api/admin/users/:id - Get user details
// PUT /api/admin/users/:id - Update user
// DELETE /api/admin/users/:id - Delete user
// GET /api/admin/stats - Get system statistics
// GET /api/admin/analytics - Get analytics data
```

## Project Structure

```
src/
├── components/
│   └── Layout.jsx          # Main app layout with sidebar
├── contexts/
│   └── AuthContext.jsx     # Authentication context
├── pages/
│   ├── Dashboard.jsx       # Dashboard overview
│   ├── Users.jsx          # User management
│   ├── Streams.jsx        # Stream monitoring
│   ├── Settings.jsx       # System settings
│   └── Login.jsx          # Login page
├── services/
│   └── api.js             # API service layer
├── App.jsx                # Main app with routing
└── main.jsx              # App entry point
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3000    # Control-plane API URL
VITE_NODE_ENV=development             # Environment
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

The admin panel can be deployed to any static hosting service. Make sure to:

1. Set the correct `VITE_API_URL` for your production control-plane
2. Update the CORS configuration in control-plane to include your admin domain
3. Ensure proper SSL certificates are configured

## Security Considerations

- Admin access is restricted to `admin@neustream.app` email
- JWT tokens are stored in localStorage with proper validation
- All API requests include authentication headers
- Automatic redirect to login on token expiration

## Development

### Adding New Pages

1. Create the page component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Update the navigation in `src/components/Layout.jsx`

### Styling

The project uses Tailwind CSS with shadcn/ui components. You can add new components using:

```bash
npx shadcn@latest add [component-name]
```

### API Integration

All API calls should go through the `src/services/api.js` service layer, which handles:

- Authentication headers
- Error handling
- Token refresh on expiration

## Troubleshooting

### Login Issues
- Ensure `admin@neustream.app` exists in the database
- Check Google OAuth configuration in control-plane
- Verify CORS settings include your admin domain

### API Connection Issues
- Verify control-plane is running on the correct port
- Check `VITE_API_URL` environment variable
- Ensure proper CORS configuration in control-plane

### Styling Issues
- Run `npm install` if Tailwind classes aren't working
- Check that `src/index.css` includes Tailwind imports
- Verify Vite configuration for path aliases
