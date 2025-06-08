# Spreetail SKU Dashboard 

A comprehensive SKU (Stock Keeping Unit) dashboard application built with React.js frontend and FastAPI backend microservices architecture.

## Features

### Frontend Features
- **Authentication System**: Role-based login (Brand User vs Merch Operations)
- **Advanced Dashboard**: Beautiful, responsive SKU management interface
- **Search & Filtering**: Real-time search by name, filter by return rate and content score
- **Sortable Tables**: Click column headers to sort by any field
- **Detailed SKU Views**: Individual SKU pages with sales charts and notes
- **Auto-saving Notes**: Notes save automatically with debounce (2 seconds)
- **Role-based UI**: Different permissions for brand users vs merch operations
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

### Backend Features
- **FastAPI REST API**: Modern, fast API with automatic documentation
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for user roles
- **In-memory JSON Storage**: Simple data persistence for development
- **CORS Support**: Configured for frontend integration
- **Data Validation**: Pydantic models for request/response validation
- **Sample Data**: Pre-populated with 5 users and 60+ SKUs

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** with Python
- **JWT** for authentication
- **Pydantic** for data validation
- **Uvicorn** ASGI server
- **In-memory storage** with JSON

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone and setup the project**:
```bash
git clone https://github.com/kathirmsc85/sku-dashboard.git
cd sku-dashboard

or 

download as zip file from git and extract in local
go to the sku-dashboard

```


2. **Install frontend dependencies**:
```bash
npm install
npm install vite@latest --save-dev
npm install @vitejs/plugin-react@latest --save-dev
```

3. **Setup backend**:
```bash
# Create Python virtual environment (optional but recommended)
python -m venv backend/venv
source backend/venv/bin/activate  # On Windows: backend\venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Running the Application

#### Option 1: Start Services Separately

**Terminal 1 - Backend**:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000 &
# Or manually: cd backend && python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)

## Demo Accounts

The application comes with pre-configured demo accounts:

### Brand Users
- **Username**: `alice_brand`, **Password**: `password123`
- **Username**: `bob_brand`, **Password**: `password123`  
- **Username**: `diana_brand`, **Password**: `password123`

### Merch Operations
- **Username**: `charlie_ops`, **Password**: `password123`
- **Username**: `eve_ops`, **Password**: `password123`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### SKUs
- `GET /skus` - Get all SKUs (with search, filter, sort)
- `GET /skus/{id}` - Get specific SKU details

### Notes  
- `GET /skus/{sku_id}/notes` - Get notes for a SKU
- `POST /notes` - Create new note
- `PUT /notes/{note_id}` - Update existing note
- `DELETE /notes/{note_id}` - Delete note

### Health Check
- `GET /health` - API health status

## Role-based Permissions

### Brand Users
- Can view their own SKUs
- Can add, edit, and delete notes on their SKUs
- Cannot see other users' data

### Merch Operations
- Can view all SKUs across all users
- Can view all notes from all users
- Can add, edit, and delete any notes
- Full administrative access

## Data Structure

### SKU Object
```typescript
{
  id: string;
  name: string;
  sales: number;
  return_percentage: number;
  content_score: number;
  created_at: string;
  sales_data: Array<{month: string, sales: number, date: string}>;
}
```

### Note Object
```typescript
{
  id: string;
  sku_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

## Deployment Options

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Heroku (Backend)
1. Create `Procfile` in backend directory:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Deploy to Heroku:
```bash
cd backend
heroku create your-app-name
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Render (Full Stack)
1. **Backend**: Deploy as Web Service
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Frontend**: Deploy as Static Site
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

## Development

### Project Structure
```
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth)
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app component
├── backend/                # FastAPI backend
│   ├── main.py            # FastAPI application
│   └── requirements.txt   # Python dependencies
├── package.json           # Frontend dependencies
└── README.md             # This file
```

### Adding New Features

1. **Frontend**: Add components in `src/components/`
2. **Backend**: Add endpoints in `backend/main.py`
3. **Types**: Update TypeScript interfaces in `src/types/`
4. **API Services**: Update API calls in `src/services/api.ts`

### Environment Variables

Create `.env` file in root directory for custom configuration:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **Authentication Issues**: Check if JWT tokens are properly stored
3. **Port Conflicts**: Change ports in package.json scripts if needed
4. **Python Dependencies**: Use virtual environment to avoid conflicts

### Debug Mode

Start backend in debug mode:
```bash
cd backend
uvicorn main:app --reload --port 8000 --log-level debug
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Create a Pull Request

## License

This project is licensed under the MIT License.