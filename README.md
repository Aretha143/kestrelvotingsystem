# 🏆 Kestrel Nest Garden - Staff of the Month Voting System

A modern, full-stack voting system designed specifically for restaurant staff recognition. Built with React, Node.js, Express, and SQLite, featuring beautiful UI/UX and comprehensive admin controls.

## ✨ Features

### 🎯 Staff Interface
- **Secure Login**: Staff ID and PIN authentication
- **Active Campaigns**: View and participate in ongoing voting campaigns
- **Vote Casting**: Select candidates and provide detailed reasons
- **Results Viewing**: See voting results once campaigns end
- **Responsive Design**: Works perfectly on desktop and mobile devices

### 🔧 Admin Interface
- **Staff Management**: Create, edit, and manage staff members
- **Campaign Creation**: Set up voting campaigns with custom dates
- **Real-time Statistics**: Monitor voting progress and participation
- **Results Analytics**: Comprehensive voting results with charts
- **PIN Management**: Generate and reset staff PINs

### 🛡️ Security Features
- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation and sanitization
- Secure password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voting
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Start the development servers**
   ```bash
   # Start both server and client
   npm run dev
   
   # Or start them separately
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌐 Deployment

### Free Hosting Options

This application can be deployed for free on several platforms:

1. **Render** (Recommended) - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. **Railway** - Alternative platform with good free tier
3. **Vercel** - Great for frontend deployment
4. **Netlify** - Another excellent frontend hosting option

### Quick Deployment Steps

1. **Push your code to GitHub**
2. **Choose a hosting platform** (Render recommended)
3. **Deploy backend** as a Web Service
4. **Deploy frontend** as a Static Site
5. **Configure environment variables**
6. **Test your live application**

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔐 Default Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`

### Sample Staff Members
The system comes with 5 sample staff members for testing:

| Staff ID | PIN | Name | Position | Department |
|----------|-----|------|----------|------------|
| EMP001 | 1234 | Sarah Johnson | Server | Front of House |
| EMP002 | 5678 | Michael Chen | Chef | Kitchen |
| EMP003 | 9012 | Emily Rodriguez | Hostess | Front of House |
| EMP004 | 3456 | David Kim | Sous Chef | Kitchen |
| EMP005 | 7890 | Lisa Thompson | Bartender | Bar |

## 📁 Project Structure

```
voting/
├── server/                 # Backend API
│   ├── index.js           # Main server file
│   ├── database.js        # Database setup and initialization
│   └── routes/            # API routes
│       ├── auth.js        # Authentication routes
│       ├── staff.js       # Staff management routes
│       ├── campaigns.js   # Campaign management routes
│       └── votes.js       # Voting routes
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── data/                  # SQLite database files
└── package.json           # Root package.json
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Kestrel Nest Garden branding
- **Responsive Layout**: Optimized for all screen sizes
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Charts**: Recharts for data visualization
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Elegant loading spinners and skeleton screens

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
```

### Database
The system uses SQLite for simplicity. The database file is automatically created at `data/voting.db` on first run.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/staff/login` - Staff login
- `GET /api/auth/me` - Get current user info

### Staff Management (Admin)
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create new staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `POST /api/staff/:id/reset-pin` - Reset staff PIN

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/active` - Get active campaigns
- `POST /api/campaigns` - Create campaign (Admin)
- `PUT /api/campaigns/:id` - Update campaign (Admin)
- `POST /api/campaigns/:id/publish` - Publish/unpublish campaign (Admin)

### Voting
- `POST /api/votes` - Cast a vote (Staff)
- `GET /api/votes/my-vote/:campaignId` - Get user's vote
- `GET /api/votes/results/:campaignId` - Get campaign results
- `GET /api/votes/stats/:campaignId` - Get voting statistics

## 🚀 Deployment

### Production Build
```bash
# Build the React app
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t kestrel-voting .

# Run container
docker run -p 5000:5000 kestrel-voting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔧 Troubleshooting

### Login Issues
If you encounter "login failed please try again later":

1. **Check if servers are running**:
   ```bash
   # Check if backend is running on port 5000
   curl http://localhost:5000/api/auth/admin/login
   
   # Check if frontend is running on port 3000
   curl http://localhost:3000
   ```

2. **Verify database exists**:
   ```bash
   ls -la data/voting.db
   ```

3. **Check sample data**:
   ```bash
   sqlite3 data/voting.db "SELECT staff_id, pin, name FROM staff;"
   ```

4. **Restart the application**:
   ```bash
   # Stop current processes
   pkill -f "node.*server"
   pkill -f "react-scripts"
   
   # Restart
   npm run dev
   ```

5. **Check browser console** for any JavaScript errors

### Common Issues
- **CORS errors**: Ensure the backend is running on port 5000
- **Database errors**: Delete `data/voting.db` and restart to recreate
- **Port conflicts**: Change ports in `package.json` if needed

---

**Built with ❤️ for Kestrel Nest Garden**
kestrel
kestrel
