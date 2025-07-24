import express, { type Request, Response } from "express";
import multer from "multer";
import { storage } from "./storage";
import { 
  insertMoodEntrySchema, 
  insertMemorySchema, 
  insertChatMessageSchema,
  insertGratitudeEntrySchema 
} from "@shared/schema";
import { 
  generateAIResponse, 
  analyzeMoodFromText, 
  generateMoodInsights,
  analyzeImageAndGenerateMeme,
  generateDailyWellnessTip,
  generatePersonalizedInsights,
  generatePersonalizedThoughtInterruption
} from "./lib/openai";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Authentication middleware
function getCurrentUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}

function requireAuth(req: Request, res: Response, next: Function) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

export function registerRoutes(app: express.Application) {
  // User management routes
  app.post("/api/user/create", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const existingUser = await storage.getUser(userId);
      if (existingUser) {
        return res.json({ success: true, userId, user: existingUser });
      }

      const newUser = await storage.upsertUser({
        id: userId,
        email: null,
        firstName: 'User',
        lastName: '',
        profileImageUrl: null,
        phoneNumber: null,
      });

      res.json({ success: true, userId, user: newUser });
    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post("/api/user/verify-session", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        const newUser = await storage.upsertUser({
          id: userId,
          email: null,
          firstName: 'User',
          lastName: '',
          profileImageUrl: null,
          phoneNumber: null,
        });
        return res.json({ success: true, userId, user: newUser });
      }

      res.json({ success: true, userId, user });
    } catch (error) {
      console.error('Session verification error:', error);
      res.status(500).json({ error: 'Failed to verify session' });
    }
  });

  app.post("/api/auth/update-user-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const { name, age, wellnessGoals, preferredTime, motivation } = req.body;

      const updatedUser = await storage.upsertUser({
        id: userId,
        name,
        age: age?.toString(),
        wellnessGoals: JSON.stringify(wellnessGoals),
        preferredTime,
        motivation,
        firstName: name?.split(' ')[0] || 'User',
        lastName: name?.split(' ')[1] || '',
        email: null,
        profileImageUrl: null,
        phoneNumber: null,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Mood tracking routes
  app.get("/api/mood", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const moodEntries = await storage.getMoodEntriesByUser(userId);
      res.json(moodEntries);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      res.status(500).json({ error: 'Failed to fetch mood entries' });
    }
  });

  app.get("/api/mood/recent", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const recentMood = await storage.getRecentMoodEntry(userId);
      res.json(recentMood);
    } catch (error) {
      console.error('Error fetching recent mood:', error);
      res.status(500).json({ error: 'Failed to fetch recent mood' });
    }
  });

  app.post("/api/mood", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });

      const moodEntry = await storage.createMoodEntry(validatedData);
      res.json(moodEntry);
    } catch (error) {
      console.error('Error creating mood entry:', error);
      res.status(500).json({ error: 'Failed to create mood entry' });
    }
  });

  app.post("/api/mood/analyze", requireAuth, async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const analysis = await analyzeMoodFromText(text);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing mood:', error);
      res.status(500).json({ error: 'Failed to analyze mood' });
    }
  });

  // Memory routes
  app.get("/api/memories", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const { category } = req.query;
      
      let memories;
      if (category && category !== 'all') {
        memories = await storage.getMemoriesByCategory(userId, category as string);
      } else {
        memories = await storage.getMemoriesByUser(userId);
      }
      
      res.json(memories);
    } catch (error) {
      console.error('Error fetching memories:', error);
      res.status(500).json({ error: 'Failed to fetch memories' });
    }
  });

  app.post("/api/memories", requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const { title, description, category } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      // Convert buffer to base64 for storage (in production, use cloud storage)
      const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const validatedData = insertMemorySchema.parse({
        userId,
        title: title || 'Untitled Memory',
        description: description || null,
        imageUrl: imageBase64,
        category: category || 'other',
        isFavorite: false,
      });

      const memory = await storage.createMemory(validatedData);
      res.json(memory);
    } catch (error) {
      console.error('Error creating memory:', error);
      res.status(500).json({ error: 'Failed to create memory' });
    }
  });

  app.patch("/api/memories/:id/favorite", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isFavorite } = req.body;
      
      const memory = await storage.updateMemoryFavorite(parseInt(id), isFavorite);
      res.json(memory);
    } catch (error) {
      console.error('Error updating memory favorite:', error);
      res.status(500).json({ error: 'Failed to update memory' });
    }
  });

  // Chat routes
  app.get("/api/chat", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const messages = await storage.getChatMessagesByUser(userId);
      
      // Group messages by conversation pairs
      const conversations = [];
      for (let i = 0; i < messages.length; i += 2) {
        const userMessage = messages[i];
        const aiResponse = messages[i + 1];
        
        if (userMessage && aiResponse) {
          conversations.push({
            id: userMessage.id,
            message: userMessage.message,
            response: aiResponse.message,
            timestamp: userMessage.timestamp,
          });
        }
      }
      
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  app.post("/api/chat", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const { message, preferredLanguage, isVoice, currentMood } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Save user message
      await storage.createChatMessage({
        userId,
        message: message.trim(),
        isFromUser: true,
      });

      // Generate AI response
      const aiResponse = await generateAIResponse(message, currentMood, preferredLanguage);

      // Save AI response
      await storage.createChatMessage({
        userId,
        message: aiResponse,
        isFromUser: false,
      });

      res.json({ response: aiResponse });
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // Insights routes
  app.get("/api/insights", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const moodEntries = await storage.getMoodEntriesByUser(userId);
      
      if (moodEntries.length === 0) {
        return res.json({
          insights: [
            "Start tracking your mood daily to identify patterns",
            "Regular mood monitoring helps build emotional awareness",
            "Consider setting a daily reminder to check in with yourself"
          ],
          moodDistribution: [],
          weeklyData: [],
          dailyEntries: 0
        });
      }

      // Generate insights
      const insights = await generateMoodInsights(moodEntries);
      
      // Calculate mood distribution
      const moodCounts = moodEntries.reduce((acc: any, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {});

      const total = moodEntries.length;
      const moodDistribution = Object.entries(moodCounts).map(([mood, count]: [string, any]) => ({
        mood,
        percentage: Math.round((count / total) * 100)
      }));

      // Get recent week data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyData = moodEntries
        .filter(entry => new Date(entry.timestamp) >= weekAgo)
        .reverse();

      res.json({
        insights,
        moodDistribution,
        weeklyData,
        dailyEntries: moodEntries.length
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  app.get("/api/insights/personalized", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      
      // Gather user activity data
      const [moodEntries, memories, chatMessages, gratitudeEntries, user] = await Promise.all([
        storage.getMoodEntriesByUser(userId),
        storage.getMemoriesByUser(userId),
        storage.getChatMessagesByUser(userId),
        storage.getGratitudeEntriesByUser(userId),
        storage.getUser(userId)
      ]);

      const userActivity = {
        moodEntries,
        memories,
        chatMessages,
        gratitudeEntries,
        userProfile: user
      };

      const insights = await generatePersonalizedInsights(userActivity);
      res.json({ insights });
    } catch (error) {
      console.error('Error generating personalized insights:', error);
      res.status(500).json({ error: 'Failed to generate personalized insights' });
    }
  });

  // Gratitude routes
  app.get("/api/gratitude", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const entries = await storage.getGratitudeEntriesByUser(userId);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching gratitude entries:', error);
      res.status(500).json({ error: 'Failed to fetch gratitude entries' });
    }
  });

  app.post("/api/gratitude", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const validatedData = insertGratitudeEntrySchema.parse({
        ...req.body,
        userId,
      });

      const entry = await storage.createGratitudeEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error('Error creating gratitude entry:', error);
      res.status(500).json({ error: 'Failed to create gratitude entry' });
    }
  });

  // Challenge routes
  app.get("/api/challenges/active", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const activeChallenges = await storage.getActiveChallengesByUser(userId);
      res.json(activeChallenges);
    } catch (error) {
      console.error('Error fetching active challenges:', error);
      res.status(500).json({ error: 'Failed to fetch active challenges' });
    }
  });

  app.get("/api/challenges/available", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const availableChallenges = await storage.getAvailableChallenges(userId);
      res.json(availableChallenges);
    } catch (error) {
      console.error('Error fetching available challenges:', error);
      res.status(500).json({ error: 'Failed to fetch available challenges' });
    }
  });

  app.get("/api/challenges/completed", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const completedChallenges = await storage.getCompletedChallengesByUser(userId);
      res.json(completedChallenges);
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
      res.status(500).json({ error: 'Failed to fetch completed challenges' });
    }
  });

  app.post("/api/challenges/join", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const { challengeId } = req.body;

      if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID is required' });
      }

      const progress = await storage.joinChallenge(userId, challengeId);
      res.json({ success: true, progress });
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({ error: 'Failed to join challenge' });
    }
  });

  app.post("/api/challenges/progress", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const { challengeId, completed, date } = req.body;

      if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID is required' });
      }

      const progress = await storage.updateChallengeProgress(userId, challengeId, completed, date);
      res.json({ success: true, progress });
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      res.status(500).json({ error: 'Failed to update challenge progress' });
    }
  });

  // Meme generation route
  app.post("/api/meme/analyze-and-generate", requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const { style } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const memeData = await analyzeImageAndGenerateMeme(req.file.buffer, style || 'funny');
      res.json(memeData);
    } catch (error) {
      console.error('Error generating meme:', error);
      res.status(500).json({ error: 'Failed to generate meme' });
    }
  });

  // Wellness routes
  app.post("/api/wellness/daily-tip", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      const tip = await generateDailyWellnessTip(user);
      res.json({ tip });
    } catch (error) {
      console.error('Error generating daily tip:', error);
      res.status(500).json({ error: 'Failed to generate daily tip' });
    }
  });

  app.get("/api/wellness/thought-interruption", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const [user, recentMoods] = await Promise.all([
        storage.getUser(userId),
        storage.getMoodEntriesByUser(userId)
      ]);

      const techniques = await generatePersonalizedThoughtInterruption(user, recentMoods.slice(0, 5));
      res.json({ techniques });
    } catch (error) {
      console.error('Error generating thought interruption techniques:', error);
      res.status(500).json({ error: 'Failed to generate techniques' });
    }
  });

  // Admin routes
  app.get("/api/admin/database", async (req: Request, res: Response) => {
    try {
      // This is a simplified admin view - in production, add proper admin authentication
      const allUsers = await storage.getAllUsers();
      
      const usersWithOnboarding = allUsers.map(user => ({
        id: user.id,
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || '',
        email: user.email || 'No email',
        createdAt: user.createdAt,
        isComplete: !!(user.name && user.wellnessGoals && user.motivation),
        onboardingData: {
          age: user.age || 'Not provided',
          wellnessGoals: user.wellnessGoals ? 
            (typeof user.wellnessGoals === 'string' ? 
              JSON.parse(user.wellnessGoals).join(', ') : 
              user.wellnessGoals.join(', ')) : 'Not provided',
          motivation: user.motivation || 'Not provided',
          preferredTime: user.preferredTime || 'Not provided'
        }
      }));

      const totalUsers = usersWithOnboarding.length;
      const completedOnboarding = usersWithOnboarding.filter(u => u.isComplete).length;
      const incompleteOnboarding = totalUsers - completedOnboarding;
      const completionRate = totalUsers > 0 ? Math.round((completedOnboarding / totalUsers) * 100) : 0;

      res.json({
        users: usersWithOnboarding,
        totalUsers,
        completedOnboarding,
        incompleteOnboarding,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      res.status(500).json({ error: 'Failed to fetch admin data' });
    }
  });

  return app;
}