# MindEase - Complete Mental Wellness Platform

A comprehensive AI-powered mental wellness application with mood tracking, chat assistance, memory management, and stress relief tools.

## 🌟 Features

### Core Wellness Tools
- **AI Chat Assistant** - Multilingual support (English + 12 Indian languages)
- **Mood Tracking** - Daily emotional state monitoring with insights
- **Memory Gallery** - Photo storage with AI-powered meme generation
- **Breathing Exercises** - Guided 4-7-8 breathing patterns
- **Thought Interruption** - CBT-based techniques for overthinking
- **Gratitude Journal** - Daily appreciation practice
- **Wellness Challenges** - Gamified habit building
- **Voice Assistant** - Speech-to-text interaction with mood-aware responses

### Technical Features
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Theme** - Eye-friendly interface options
- **Real-time Updates** - Live data synchronization
- **Offline Fallbacks** - Works without AI APIs
- **Data Persistence** - PostgreSQL with Drizzle ORM
- **Authentication** - Secure user sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- (Optional) Gemini AI API key for enhanced features

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd mindease-app
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your database URL and optional API keys
```

3. **Database Setup**
```bash
npm run db:push
```

4. **Start Development**
```bash
npm run dev
```

5. **Build for Production**
```bash
npm run build
npm start
```

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles and onboarding data
- `mood_entries` - Daily mood tracking with ratings
- `memories` - Photo storage with categories
- `chat_messages` - AI conversation history
- `gratitude_entries` - Gratitude journal entries
- `challenge_progress` - Wellness challenge tracking
- `challenge_daily_progress` - Daily challenge completion

### Key Features
- **Automatic Migrations** - Database schema updates handled automatically
- **Data Integrity** - Foreign key constraints and cascade deletes
- **Performance Indexes** - Optimized queries for real-time updates
- **Session Management** - Secure authentication storage

## 🤖 AI Integration

### Supported AI Providers
- **Google Gemini** (Primary) - Advanced multimodal AI
- **Fallback System** - Works without AI APIs

### AI Features
- **Mood Analysis** - Text-based emotional state detection
- **Multilingual Chat** - 13 languages with cultural context
- **Meme Generation** - Image analysis and humor creation
- **Personalized Insights** - User behavior pattern analysis
- **Daily Tips** - Contextual wellness advice

## 🌍 Multilingual Support

### Supported Languages
**Global:** English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese

**Indian Languages:** Hindi, Bengali, Tamil, Telugu, Malayalam, Kannada, Gujarati, Marathi, Punjabi, Urdu, Odia, Assamese, Kashmiri

### Features
- **Auto-Detection** - Recognizes user's language from input
- **Voice Recognition** - Speech-to-text in multiple languages
- **Cultural Context** - Appropriate responses for each culture
- **Script Support** - Proper Unicode rendering for all scripts

## 📱 Mobile Experience

### Responsive Design
- **Mobile-First** - Optimized for touch interfaces
- **Progressive Web App** - App-like experience in browsers
- **Touch Targets** - Accessibility-compliant button sizes
- **Gesture Support** - Swipe and tap interactions

### Performance
- **Fast Loading** - Optimized bundle sizes
- **Smooth Animations** - 60fps transitions
- **Offline Support** - Core features work without internet
- **Battery Efficient** - Minimal background processing

## 🔒 Security & Privacy

### Data Protection
- **Encrypted Storage** - All sensitive data encrypted
- **Session Security** - Secure authentication tokens
- **GDPR Compliant** - User data control and deletion
- **Local Storage** - Sensitive data stays on device when possible

### Authentication
- **Multiple Methods** - Google, Phone, Email options
- **Session Management** - Automatic session renewal
- **Device Persistence** - Seamless cross-session experience

## 🎯 Wellness Features

### Mood Tracking
- **Quick Check-ins** - One-tap mood logging
- **Detailed Analytics** - Pattern recognition and insights
- **Trend Analysis** - Weekly and monthly mood trends
- **Trigger Identification** - Correlate moods with activities

### Stress Management
- **Breathing Exercises** - Scientifically-backed techniques
- **Thought Interruption** - CBT-based intervention tools
- **Grounding Techniques** - 5-4-3-2-1 sensory method
- **Progressive Relaxation** - Guided muscle relaxation

### Memory & Gratitude
- **Photo Memories** - Capture and categorize special moments
- **AI Meme Creation** - Turn photos into uplifting content
- **Gratitude Practice** - Daily appreciation journaling
- **Memory Galleries** - Automated photo collections

### Challenges & Goals
- **Wellness Challenges** - 7-30 day habit building programs
- **Progress Tracking** - Daily completion monitoring
- **Streak Counting** - Motivation through consistency
- **Achievement System** - Points and badges for milestones

## 🛠️ Development

### Tech Stack
**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + Shadcn/ui
- TanStack Query for state management
- Wouter for routing
- Framer Motion for animations

**Backend:**
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Google Gemini AI integration
- Multer for file uploads
- Express sessions for auth

### Project Structure
```
mindease-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and helpers
├── server/                 # Express backend
│   ├── lib/                # AI and utility functions
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── migrations/             # Database migrations
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run check        # TypeScript type checking
npm run db:push      # Apply database migrations
```

## 🚀 Deployment

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://...
SESSION_SECRET=secure_random_string

# Optional (enables AI features)
GEMINI_API_KEY=your_api_key
```

### Deployment Platforms
- **Replit** - Zero-config deployment
- **Vercel** - Frontend with serverless functions
- **Railway** - Full-stack with PostgreSQL
- **Heroku** - Traditional cloud deployment
- **Docker** - Containerized deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented

## 📊 Analytics & Insights

### User Analytics
- **Mood Patterns** - Identify emotional trends
- **Usage Statistics** - Feature adoption tracking
- **Engagement Metrics** - Session duration and frequency
- **Wellness Progress** - Goal achievement tracking

### AI Insights
- **Personalized Recommendations** - Based on user behavior
- **Mood Correlations** - Link emotions to activities
- **Intervention Timing** - Optimal moments for wellness tools
- **Progress Predictions** - Forecast wellness journey

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Consistent formatting
- **Component Testing** - React Testing Library

## 📞 Support

### Contact Information
- **Developer:** Mukund
- **Email:** mvsslnmukund@gmail.com
- **Phone:** +91 8247437407

### Documentation
- **API Documentation** - Available in `/docs/api`
- **Component Library** - Storybook documentation
- **User Guide** - In-app help system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** - Beautiful component library
- **Google Gemini** - Advanced AI capabilities
- **Drizzle ORM** - Type-safe database operations
- **TanStack Query** - Powerful data synchronization
- **Tailwind CSS** - Utility-first styling

---

**MindEase** - Your journey to better mental wellness starts here. 🌱