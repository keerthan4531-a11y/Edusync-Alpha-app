# LMS Project - Learning Management System

A full-stack Learning Management System built using Next.js, MongoDB, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

This LMS platform enables students to register, enroll in courses, access lessons, and track their progress. Administrators can manage content, users, and monitor platform analytics.

## ✨ Features

- **Authentication & Authorization**
  - Secure user authentication with NextAuth.js
  - Role-based access control (Student, Instructor, Admin)
  - Social login support (Google, GitHub)

- **Course Management**
  - Create and edit courses with rich content
  - Video lessons and downloadable resources
  - Course categories and difficulty levels
  - Student enrollment tracking

- **Student Dashboard**
  - Progress tracking and analytics
  - Course enrollment management
  - Lesson completion status
  - Achievement badges

- **Instructor Dashboard**
  - Course creation and management
  - Student progress monitoring
  - Content upload and organization

- **Admin Panel**
  - User management and role assignment
  - Platform analytics and reporting
  - Content moderation

- **UI/UX Features**
  - Responsive design for all devices
  - Modern and intuitive interface
  - Dark/light mode support
  - Accessibility compliant

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Custom reusable components
- **Icons:** Heroicons / Lucide React

### Backend
- **API:** Next.js API Routes
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** NextAuth.js

### Development Tools
- **Version Control:** Git
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript

## 📁 Project Structure

```
lms-project/
├── app/
│   ├── api/
│   │   └── auth/           # NextAuth API routes
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.tsx
│   │   └── CourseCard.tsx
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Authentication pages
│   ├── models/             # MongoDB models
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── public/                 # Static assets
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- MongoDB database (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lms-project.git
   cd lms-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/lms-database
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-here
   
   # Optional: OAuth Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Database Setup**
   - Create a MongoDB database
   - Update the `MONGODB_URI` in your `.env.local` file
   - The app will automatically create required collections

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 UI Components

### Core Components

- **Navbar** - Navigation component with user authentication status
- **CourseCard** - Reusable card component for displaying course information
- **Dashboard** - User-specific dashboard layouts
- **LoginForm** - Authentication form component

### Styling

The project uses Tailwind CSS for styling with:
- Custom color scheme
- Responsive design patterns
- Component-based styling
- Dark mode support

## 🔐 Authentication

NextAuth.js handles authentication with support for:
- Credentials-based login
- OAuth providers (Google, GitHub)
- JWT tokens
- Session management
- Role-based access control

## 💾 Database Schema

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Course Model
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  thumbnail?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  rating: number;
  studentsEnrolled: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🌟 Key Features Implementation

### User Roles
- **Students**: Browse courses, enroll, track progress
- **Instructors**: Create courses, manage content, view analytics
- **Admins**: Full platform management, user oversight

### Progress Tracking
- Lesson completion status
- Course progress percentage
- Achievement system
- Learning analytics

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
- Railway
- Netlify
- AWS
- DigitalOcean

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Full-Stack Web Application
- **Development Period**: October 2025

## 🔗 Links

- [Live Demo](https://your-lms-demo.vercel.app)
- [API Documentation](https://your-lms-demo.vercel.app/api-docs)
- [Project Repository](https://github.com/yourusername/lms-project)

## 📞 Support

For support, email your-email@example.com or join our Slack channel.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**