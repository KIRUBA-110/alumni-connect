import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { config } from "./config";
import "./types";
import { 
  insertUserSchema, 
  loginSchema,
  insertPostSchema,
  insertInterviewGuideSchema,
  insertAssessmentSchema,
  insertAssessmentResultSchema,
  insertEventSchema,
  insertPlacementSchema,
  insertMentorshipSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample data and default assessments
  try {
    await storage.initializeSampleData();
    await storage.initializeDefaultInterviewGuides();
    await storage.initializeDefaultAssessments();
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }

  // Configure session middleware
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => {
    return async (req: any, res: any, next: any) => {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      req.user = user;
      next();
    };
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(data.username) || 
                          await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });

      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const { role, college } = req.query;
      const users = await storage.getAllUsers();
      
      let filteredUsers = users;
      
      if (role) {
        filteredUsers = filteredUsers.filter((user: any) => user.role === role);
      }
      
      if (college) {
        filteredUsers = filteredUsers.filter((user: any) => user.college === college);
      }
      
      // Remove passwords from response
      const usersWithoutPasswords = filteredUsers.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alumni feed routes
  app.get("/api/feed", async (req, res) => {
    try {
      const { company, field } = req.query;
      const posts = await storage.getPosts(
        company as string | undefined,
        field as string | undefined
      );
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/feed", requireAuth, async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        ...data,
        authorId: req.session.userId!
      });
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Alumni search
  app.get("/api/alumni", async (req, res) => {
    try {
      const { company, field } = req.query;
      const alumni = await storage.getAlumniByCompanyOrField(
        company as string | undefined,
        field as string | undefined
      );
      
      const alumniWithoutPasswords = alumni.map(({ password, ...user }) => user);
      res.json(alumniWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Interview guides
  app.get("/api/interview-guides", async (req, res) => {
    try {
      const { company } = req.query;
      const guides = await storage.getInterviewGuides(company as string | undefined);
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/interview-guides", requireRole(["alumni", "staff"]), async (req, res) => {
    try {
      const data = insertInterviewGuideSchema.parse(req.body);
      const guide = await storage.createInterviewGuide({
        ...data,
        authorId: req.session.userId!
      });
      res.json(guide);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Assessments
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments", requireRole(["staff"]), async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      res.json(assessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Assessment results
  app.post("/api/assessment-results", requireAuth, async (req, res) => {
    try {
      const data = insertAssessmentResultSchema.parse(req.body);
      const result = await storage.createAssessmentResult({
        ...data,
        userId: req.session.userId!
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/assessment-results/user/:userId", requireAuth, async (req, res) => {
    try {
      // Users can only view their own results unless they're staff
      const user = await storage.getUser(req.session.userId!);
      if (req.params.userId !== req.session.userId! && user?.role !== "staff") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const results = await storage.getAssessmentResults(req.params.userId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", requireRole(["staff"]), async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...data,
        organizerId: req.session.userId!
      });
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Placements
  app.get("/api/placements", async (req, res) => {
    try {
      const placements = await storage.getPlacements();
      res.json(placements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/placements/stats", async (req, res) => {
    try {
      const stats = await storage.getPlacementStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/placements", requireRole(["staff"]), async (req, res) => {
    try {
      const data = insertPlacementSchema.parse(req.body);
      const placement = await storage.createPlacement(data);
      res.json(placement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Mentorships
  app.get("/api/mentorships", requireAuth, async (req, res) => {
    try {
      const { mentorId, menteeId } = req.query;
      const mentorships = await storage.getMentorships(
        mentorId as string | undefined,
        menteeId as string | undefined
      );
      res.json(mentorships);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mentorships", requireAuth, async (req, res) => {
    try {
      const data = insertMentorshipSchema.parse(req.body);
      
      // Prevent users from requesting themselves
      if (data.mentorId === data.menteeId) {
        return res.status(400).json({ message: "You cannot send a mentorship request to yourself" });
      }
      
      // Check if both users are from the same college
      const mentor = await storage.getUser(data.mentorId);
      const mentee = await storage.getUser(data.menteeId);
      
      if (!mentor || !mentee) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (mentor.college !== mentee.college) {
        return res.status(403).json({ message: "Mentorship requests are only allowed between users from the same college" });
      }
      
      // Check for existing mentorship between these users
      const existingMentorship = await storage.getMentorshipBetweenUsers(data.mentorId, data.menteeId);
      if (existingMentorship) {
        return res.status(400).json({ message: "A mentorship request already exists between these users" });
      }
      
      const mentorship = await storage.createMentorship(data);
      res.json(mentorship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/mentorships/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "active", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const mentorship = await storage.updateMentorshipStatus(req.params.id, status);
      if (!mentorship) {
        return res.status(404).json({ message: "Mentorship not found" });
      }
      
      res.json(mentorship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/mentorships/:id", requireAuth, async (req, res) => {
    try {
      const mentorship = await storage.deleteMentorship(req.params.id);
      if (!mentorship) {
        return res.status(404).json({ message: "Mentorship not found" });
      }
      
      res.json({ message: "Mentorship deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Messages
  app.get("/api/mentorships/:mentorshipId/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.mentorshipId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mentorships/:mentorshipId/messages", requireAuth, async (req, res) => {
    try {
      const { content, receiverId } = req.body;
      if (!content || !receiverId) {
        return res.status(400).json({ message: "Content and receiverId are required" });
      }

      const message = await storage.createMessage({
        mentorshipId: req.params.mentorshipId,
        senderId: req.session.userId!,
        receiverId,
        content,
        messageType: 'text'
      });
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update placement route to allow students to add their own placements
  app.post("/api/placements/self", requireAuth, async (req, res) => {
    try {
      const data = insertPlacementSchema.parse(req.body);
      const placement = await storage.createPlacement({
        ...data,
        studentId: req.session.userId!
      });
      res.json(placement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
