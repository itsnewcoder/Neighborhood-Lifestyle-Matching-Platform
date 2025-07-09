# NeighborFit Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Quick Setup

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
cd backend
```

Create `.env` file with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neighborfit
JWT_SECRET=your_jwt_secret_here_change_this_in_production
NODE_ENV=development
```

### 3. Database Setup

Make sure MongoDB is running, then seed the database:

```bash
cd backend
npm run seed
```

This will populate the database with sample neighborhood data.

### 4. Start the Application

#### Start Backend (Terminal 1):
```bash
cd backend
npm start
```

#### Start Frontend (Terminal 2):
```bash
cd frontend
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Features Available

### Public Features:
- Home page with application overview
- User registration and login
- Browse neighborhoods (placeholder)

### Authenticated Features:
- User dashboard
- Profile management (placeholder)
- Preferences setting (placeholder)
- Neighborhood matches (placeholder)

## API Endpoints

### Authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Neighborhoods:
- `GET /api/neighborhoods` - Get all neighborhoods
- `GET /api/neighborhoods/:id` - Get specific neighborhood

### Health Check:
- `GET /api/health` - API health status

## Sample Data

The application comes with 10 sample neighborhoods with realistic data including:
- Safety ratings and crime statistics
- School ratings and educational information
- Housing prices and rental rates
- Walkability and transportation scores
- Amenity information
- Cost of living data

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file

2. **Port Already in Use**
   - Change the PORT in backend/.env file
   - Update the proxy in frontend/package.json

3. **CORS Issues**
   - The backend is configured with CORS enabled
   - Check that the frontend is making requests to the correct backend URL

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set in your .env file
   - Clear browser localStorage if having authentication issues

## Development

### Backend Development:
```bash
cd backend
npm run dev
```

### Frontend Development:
```bash
cd frontend
npm start
```

### Database Seeding:
```bash
cd backend
npm run seed
```

## Project Structure

```
Neighborfit/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── seedData.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   └── public/
├── data/
│   └── neighborhoods.json
└── README.md
```

## Next Steps

This is a basic implementation with core functionality. Future enhancements could include:

1. **Complete Frontend Features:**
   - Full preferences form
   - Neighborhood browsing with filters
   - Match calculation and display
   - User profile management

2. **Advanced Features:**
   - Real-time data updates
   - Advanced search and filtering
   - User reviews and ratings
   - Mobile application

3. **Data Enhancements:**
   - More neighborhood data
   - Real-time crime statistics
   - School performance data
   - Market trend analysis

## Support

For issues or questions, please refer to the main README.md file or create an issue in the project repository. 