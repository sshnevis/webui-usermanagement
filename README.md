# WebUI User Management System

A comprehensive user management system for Open WebUI with financial system, subscriptions, and resource management.

## Features

### 🎯 Core Functionality
- **User Management**: Complete RBAC system with roles (User, VIP, Admin)
- **Financial System**: Credit-based payment system with transaction tracking
- **Subscription Plans**: Time-based and volume-based subscription models
- **Chat Management**: Token-based cost calculation and model access control
- **Rate Limiting**: Per-user rate limiting based on subscription tiers

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Secure API endpoints

### 💰 Financial Features
- Credit wallet system
- Transaction ledger with detailed tracking
- Multiple payment gateway support (ZarinPal, Zibal, Ping)
- Automatic subscription billing
- Real-time balance updates

### 📊 Subscription Management
- Multiple plan types (Basic, Premium, VIP)
- Automatic expiration handling
- Plan comparison and selection
- Usage tracking (chats per hour, tokens per month)

### 🤖 AI Model Management
- Model access control based on subscription
- Token cost calculation per model
- VIP model restrictions
- Real-time usage monitoring

## Architecture

### Backend (FastAPI)
```
backend/
├── api/                    # API endpoints
│   ├── auth.py            # Authentication routes
│   ├── subscriptions.py   # Subscription management
│   └── chats.py          # Chat and model management
├── database/              # Database layer
│   ├── models.py         # SQLAlchemy models
│   └── database.py       # Database configuration
├── models/               # Pydantic schemas
│   └── schemas.py
├── services/             # Business logic
│   ├── auth.py          # Authentication service
│   ├── user_service.py  # User management
│   ├── subscription_service.py  # Subscription logic
│   └── chat_service.py  # Chat processing
├── main.py              # FastAPI application
└── requirements.txt     # Python dependencies
```

### Frontend (React)
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── Subscriptions.jsx
│   │   ├── Chat.jsx
│   │   └── AdminPanel.jsx
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── App.jsx         # Main app component
│   └── main.jsx        # App entry point
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Redis (for rate limiting)

### Backend Setup

1. **Clone and setup backend:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Environment configuration:**
```bash
cp .env.example .env
# Edit .env with your database and API settings
```

3. **Database setup:**
```bash
# Create database tables
python -c "from database.database import engine; from database.models import Base; Base.metadata.create_all(bind=engine)"
```

4. **Run the server:**
```bash
python main.py
# Server will run on http://localhost:8000
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run development server:**
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/v1/token` - Login and get JWT token
- `POST /api/v1/register` - Register new user
- `GET /api/v1/users/me` - Get current user info

### Subscriptions
- `GET /api/v1/subscription-plans` - List available plans
- `POST /api/v1/subscribe` - Subscribe to a plan
- `GET /api/v1/users/me/subscription` - Get user's subscription

### Chat Management
- `POST /api/v1/chats` - Create new chat
- `GET /api/v1/chats` - Get user's chat history
- `GET /api/v1/models` - Get available models

## Database Schema

### Core Tables
- `users` - User accounts and roles
- `transactions` - Financial transactions
- `subscription_plans` - Available subscription plans
- `subscriptions` - User subscriptions
- `chats` - Chat history and costs

### Key Relationships
- Users have many transactions
- Users have one active subscription
- Subscriptions belong to plans
- Chats belong to users

## Usage Examples

### Creating a Subscription Plan
```python
from services.subscription_service import create_subscription_plan
from models.schemas import SubscriptionPlanCreate

plan = SubscriptionPlanCreate(
    name="Premium Monthly",
    price=29.99,
    duration_days=30,
    max_chats_per_hour=50,
    max_tokens_per_month=5000000,
    can_access_vip_models=True
)

created_plan = create_subscription_plan(db, plan)
```

### Processing a Chat Request
```python
from services.chat_service import process_chat_request

chat_record, error = process_chat_request(
    db, user_id, "gpt-4", 100, 200
)

if error:
    print(f"Error: {error}")
else:
    print(f"Chat processed successfully, cost: {chat_record.cost}")
```

## Security Features

### JWT Authentication
- Secure token-based authentication
- Configurable token expiration
- Protected endpoints with role verification

### Rate Limiting
- Redis-based rate limiting
- Per-user limits based on subscription
- Automatic reset mechanisms

### Data Validation
- Pydantic schema validation
- Input sanitization
- SQL injection prevention

## Development

### Adding New Features
1. Define database models in `backend/database/models.py`
2. Create Pydantic schemas in `backend/models/schemas.py`
3. Implement business logic in `backend/services/`
4. Add API endpoints in `backend/api/`
5. Create frontend components in `frontend/src/pages/`

### Testing
```bash
# Backend tests (when available)
python -m pytest

# Frontend tests (when available)
npm test
```

## Deployment

### Production Considerations
- Use environment variables for all sensitive data
- Set up proper SSL/TLS certificates
- Configure database connection pooling
- Set up Redis for production rate limiting
- Use a production WSGI server (uvicorn with gunicorn)

### Docker Support (Future)
- Dockerfile for backend
- Docker Compose for full stack
- Production-ready container configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced AI model integration
- [ ] Team/organization management
- [ ] API rate limiting improvements