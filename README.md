# EduFee Manager - Frontend

A modern, responsive fee collection and management system for educational institutions built with React, Vite, and Tailwind CSS.

## Features

### 🎓 Academic Management
- **Course Management**: Create, update, and manage courses with duration tracking
- **Batch Management**: Organize students into batches with start dates
- **Student Management**: Complete student profiles with contact information

### 💰 Fee Management
- **Course Fee Structure**: Set fees for different course-batch combinations
- **Fee Management**: Handle student fee records with installment support
- **Payment Processing**: Record and track payments with multiple payment modes
- **Payment Status Tracking**: Monitor pending, partial, and completed payments

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Course, student, and revenue metrics
- **Payment Overview**: Daily, monthly, and total collection reports
- **Status Breakdown**: Visual representation of payment statuses
- **Recent Activity**: Latest payments and system activities

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Professional color scheme with green accent
- **Interactive Components**: Modern cards, tables, modals, and forms
- **Loading States**: Smooth loading indicators and skeleton screens

## Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router DOM for navigation
- **HTTP Client**: Axios for API communication
- **Form Handling**: React Hook Form for efficient form management
- **Notifications**: React Hot Toast for user feedback
- **Icons**: Lucide React for consistent iconography

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── Pagination.jsx
│   │   └── LoadingSpinner.jsx
│   └── ...
├── layout/
│   ├── Layout.jsx          # Main layout wrapper
│   ├── Sidebar.jsx         # Navigation sidebar
│   └── Header.jsx          # Top header with search
├── pages/
│   ├── Dashboard/          # Dashboard components
│   ├── Courses/            # Course management
│   ├── Batches/            # Batch management
│   ├── Students/           # Student management
│   ├── FeeManagement/      # Fee structure management
│   ├── Payments/           # Payment processing
│   └── CourseFees/         # Course fee configuration
├── services/
│   ├── api.js              # Axios configuration
│   ├── courseService.js    # Course API calls
│   ├── batchService.js     # Batch API calls
│   ├── studentService.js   # Student API calls
│   ├── feeService.js       # Fee management API calls
│   └── index.js            # Service exports
├── router/
│   └── AppRouter.jsx       # Application routing
└── ...
```

## API Integration

The frontend integrates with a Django REST API backend with the following endpoints:

### Course Management
- `GET /api/courses/` - List courses with pagination and filters
- `POST /api/courses/` - Create new course
- `GET /api/courses/{id}/` - Get course details
- `PATCH /api/courses/{id}/` - Update course
- `DELETE /api/courses/{id}/` - Delete course

### Fee Management
- `GET /api/fee-management/` - List fee records
- `POST /api/fee-management/` - Create fee record
- `GET /api/fee-management/statistics/` - Get fee statistics

### Payment Management
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Record new payment
- `GET /api/payments/statistics/` - Get payment statistics

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edu-fee-manager-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=EduFee Manager
VITE_APP_VERSION=1.0.0
```

## Key Features Implementation

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Protected routes with redirect to login

### State Management
- React hooks for local state
- Context API for global state (if needed)
- Efficient API data caching

### Form Handling
- React Hook Form for performance
- Real-time validation
- Error handling and display

### Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints
- Collapsible sidebar for mobile

### Error Handling
- Global error boundaries
- API error interceptors
- User-friendly error messages

## Performance Optimizations

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Optimized Images**: Proper image formats and sizes
- **Bundle Analysis**: Vite bundle analyzer for optimization

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@edufee.com or create an issue in the repository.