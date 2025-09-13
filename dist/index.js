// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  posts;
  interviewGuides;
  assessments;
  assessmentResults;
  events;
  placements;
  mentorships;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.posts = /* @__PURE__ */ new Map();
    this.interviewGuides = /* @__PURE__ */ new Map();
    this.assessments = /* @__PURE__ */ new Map();
    this.assessmentResults = /* @__PURE__ */ new Map();
    this.events = /* @__PURE__ */ new Map();
    this.placements = /* @__PURE__ */ new Map();
    this.mentorships = /* @__PURE__ */ new Map();
    this.initializeDefaultAssessments();
  }
  initializeDefaultAssessments() {
    const defaultAssessments = [
      {
        id: randomUUID(),
        title: "Aptitude Test",
        description: "Logical reasoning, quantitative ability, and verbal skills",
        category: "aptitude",
        timeLimit: 30,
        totalQuestions: 25,
        questions: [
          {
            question: "If A can complete a work in 6 days and B can complete the same work in 8 days, how many days will they take to complete the work together?",
            options: ["3.43 days", "4.5 days", "5 days", "6 days"],
            correctAnswer: 0,
            explanation: "Combined rate = 1/6 + 1/8 = 7/24, so time = 24/7 \u2248 3.43 days"
          },
          {
            question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
            options: ["40", "42", "44", "46"],
            correctAnswer: 1,
            explanation: "Pattern: n(n+1) where n = 2,3,4,5,6,7... Next is 7\xD78 = 42"
          }
        ],
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        title: "Coding Assessment",
        description: "Data structures, algorithms, and problem solving",
        category: "coding",
        timeLimit: 60,
        totalQuestions: 15,
        questions: [
          {
            question: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            correctAnswer: 1,
            explanation: "Binary search divides the search space in half each time, resulting in O(log n) complexity"
          },
          {
            question: "Which data structure is best for implementing a function call stack?",
            options: ["Queue", "Stack", "Linked List", "Array"],
            correctAnswer: 1,
            explanation: "Stack follows LIFO principle which matches function call behavior"
          }
        ],
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        title: "Computer Science Fundamentals",
        description: "Core CS concepts, DBMS, OS, Networks",
        category: "cs",
        timeLimit: 45,
        totalQuestions: 30,
        questions: [
          {
            question: "Which of the following is NOT a type of operating system?",
            options: ["Batch OS", "Real-time OS", "Network OS", "Compiler OS"],
            correctAnswer: 3,
            explanation: "Compiler is a software tool, not a type of operating system"
          },
          {
            question: "In DBMS, what does ACID stand for?",
            options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Completeness, Independence, Delivery", "Access, Control, Integration, Distribution", "None of the above"],
            correctAnswer: 0,
            explanation: "ACID properties ensure database transaction reliability"
          }
        ],
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    defaultAssessments.forEach((assessment) => {
      this.assessments.set(assessment.id, assessment);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      role: insertUser.role || "student",
      graduationYear: insertUser.graduationYear ?? null,
      department: insertUser.department ?? null,
      company: insertUser.company ?? null,
      position: insertUser.position ?? null,
      location: insertUser.location ?? null,
      bio: insertUser.bio ?? null,
      avatar: insertUser.avatar ?? null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async getAlumniByCompanyOrField(company, field) {
    return Array.from(this.users.values()).filter((user) => {
      if (user.role !== "alumni") return false;
      if (company && user.company?.toLowerCase().includes(company.toLowerCase())) return true;
      if (field && (user.department?.toLowerCase().includes(field.toLowerCase()) || user.position?.toLowerCase().includes(field.toLowerCase()))) return true;
      return !company && !field;
    });
  }
  async createPost(post) {
    const id = randomUUID();
    const newPost = {
      ...post,
      company: post.company ?? null,
      field: post.field ?? null,
      id,
      likes: 0,
      comments: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.posts.set(id, newPost);
    return newPost;
  }
  async getPosts(company, field) {
    let posts2 = Array.from(this.posts.values());
    if (company || field) {
      posts2 = posts2.filter((post) => {
        if (company && post.company?.toLowerCase().includes(company.toLowerCase())) return true;
        if (field && post.field?.toLowerCase().includes(field.toLowerCase())) return true;
        return false;
      });
    }
    return posts2.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((post) => ({
      ...post,
      author: this.users.get(post.authorId)
    })).filter((post) => post.author);
  }
  async getPostById(id) {
    return this.posts.get(id);
  }
  async createInterviewGuide(guide) {
    const id = randomUUID();
    const newGuide = {
      ...guide,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.interviewGuides.set(id, newGuide);
    return newGuide;
  }
  async getInterviewGuides(company) {
    let guides = Array.from(this.interviewGuides.values());
    if (company) {
      guides = guides.filter(
        (guide) => guide.company.toLowerCase().includes(company.toLowerCase())
      );
    }
    return guides.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((guide) => ({
      ...guide,
      author: this.users.get(guide.authorId)
    })).filter((guide) => guide.author);
  }
  async createAssessment(assessment) {
    const id = randomUUID();
    const newAssessment = {
      ...assessment,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }
  async getAssessments() {
    return Array.from(this.assessments.values()).sort((a, b) => a.title.localeCompare(b.title));
  }
  async getAssessmentById(id) {
    return this.assessments.get(id);
  }
  async createAssessmentResult(result) {
    const id = randomUUID();
    const newResult = {
      ...result,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.assessmentResults.set(id, newResult);
    return newResult;
  }
  async getAssessmentResults(userId) {
    return Array.from(this.assessmentResults.values()).filter((result) => result.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async getAssessmentResultsForAssessment(assessmentId) {
    return Array.from(this.assessmentResults.values()).filter((result) => result.assessmentId === assessmentId);
  }
  async createEvent(event) {
    const id = randomUUID();
    const newEvent = {
      ...event,
      images: event.images ?? null,
      chiefGuest: event.chiefGuest ?? null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.events.set(id, newEvent);
    return newEvent;
  }
  async getEvents() {
    return Array.from(this.events.values()).sort((a, b) => b.date.getTime() - a.date.getTime()).map((event) => ({
      ...event,
      organizer: this.users.get(event.organizerId)
    })).filter((event) => event.organizer);
  }
  async createPlacement(placement) {
    const id = randomUUID();
    const newPlacement = {
      ...placement,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.placements.set(id, newPlacement);
    return newPlacement;
  }
  async getPlacements() {
    return Array.from(this.placements.values()).sort((a, b) => b.year - a.year).map((placement) => ({
      ...placement,
      student: this.users.get(placement.studentId)
    })).filter((placement) => placement.student);
  }
  async getPlacementStats() {
    const placements2 = Array.from(this.placements.values());
    const students = Array.from(this.users.values()).filter((u) => u.role === "student");
    const totalPlacements = placements2.length;
    const placementRate = students.length > 0 ? totalPlacements / students.length * 100 : 0;
    const packages = placements2.map((p) => p.package);
    const averagePackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
    const companyMap = /* @__PURE__ */ new Map();
    placements2.forEach((placement) => {
      const existing = companyMap.get(placement.company) || { count: 0, packages: [] };
      existing.count++;
      existing.packages.push(placement.package);
      companyMap.set(placement.company, existing);
    });
    const companyStats = Array.from(companyMap.entries()).map(([company, data]) => ({
      company,
      count: data.count,
      minPackage: Math.min(...data.packages),
      maxPackage: Math.max(...data.packages)
    })).sort((a, b) => b.count - a.count);
    return {
      totalPlacements,
      placementRate,
      averagePackage,
      highestPackage,
      companyStats
    };
  }
  async createMentorship(mentorship) {
    const id = randomUUID();
    const newMentorship = {
      ...mentorship,
      status: mentorship.status || "pending",
      field: mentorship.field ?? null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.mentorships.set(id, newMentorship);
    return newMentorship;
  }
  async getMentorships(mentorId, menteeId) {
    let mentorships2 = Array.from(this.mentorships.values());
    if (mentorId) {
      mentorships2 = mentorships2.filter((m) => m.mentorId === mentorId);
    }
    if (menteeId) {
      mentorships2 = mentorships2.filter((m) => m.menteeId === menteeId);
    }
    return mentorships2.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((mentorship) => ({
      ...mentorship,
      mentor: this.users.get(mentorship.mentorId),
      mentee: this.users.get(mentorship.menteeId)
    })).filter((mentorship) => mentorship.mentor && mentorship.mentee);
  }
  async updateMentorshipStatus(id, status) {
    const mentorship = this.mentorships.get(id);
    if (!mentorship) return void 0;
    const updated = { ...mentorship, status };
    this.mentorships.set(id, updated);
    return updated;
  }
};
var storage = new MemStorage();

// server/types.ts
import "express-session";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "alumni", "staff"] }).notNull().default("student"),
  fullName: text("full_name").notNull(),
  graduationYear: integer("graduation_year"),
  department: text("department"),
  company: text("company"),
  position: text("position"),
  location: text("location"),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  company: text("company"),
  field: text("field"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var interviewGuides = pgTable("interview_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  experience: text("experience").notNull(),
  questions: jsonb("questions").$type().notNull(),
  tips: text("tips"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", { enum: ["aptitude", "coding", "general", "cs", "ece", "mba"] }).notNull(),
  questions: jsonb("questions").$type().notNull(),
  timeLimit: integer("time_limit").notNull(),
  // in minutes
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var assessmentResults = pgTable("assessment_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assessmentId: varchar("assessment_id").references(() => assessments.id).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeSpent: integer("time_spent").notNull(),
  // in seconds
  answers: jsonb("answers").$type().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  images: jsonb("images").$type().default([]),
  chiefGuest: text("chief_guest"),
  organizerId: varchar("organizer_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var placements = pgTable("placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  package: integer("package").notNull(),
  // in lakhs
  placementType: text("placement_type", { enum: ["full_time", "internship"] }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var mentorships = pgTable("mentorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").references(() => users.id).notNull(),
  menteeId: varchar("mentee_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "active", "completed"] }).notNull().default("pending"),
  field: text("field"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  authorId: true,
  likes: true,
  comments: true,
  createdAt: true
});
var insertInterviewGuideSchema = createInsertSchema(interviewGuides).omit({
  id: true,
  authorId: true,
  createdAt: true
});
var insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true
});
var insertAssessmentResultSchema = createInsertSchema(assessmentResults).omit({
  id: true,
  createdAt: true
});
var insertEventSchema = createInsertSchema(events).omit({
  id: true,
  organizerId: true,
  createdAt: true
});
var insertPlacementSchema = createInsertSchema(placements).omit({
  id: true,
  createdAt: true
});
var insertMentorshipSchema = createInsertSchema(mentorships).omit({
  id: true,
  createdAt: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// server/routes.ts
import bcrypt from "bcryptjs";
import session from "express-session";
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  const requireRole = (roles) => {
    return async (req, res, next) => {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      req.user = user;
      next();
    };
  };
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username) || await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/feed", async (req, res) => {
    try {
      const { company, field } = req.query;
      const posts2 = await storage.getPosts(
        company,
        field
      );
      res.json(posts2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/feed", requireAuth, async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        ...data,
        authorId: req.session.userId
      });
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/alumni", async (req, res) => {
    try {
      const { company, field } = req.query;
      const alumni = await storage.getAlumniByCompanyOrField(
        company,
        field
      );
      const alumniWithoutPasswords = alumni.map(({ password, ...user }) => user);
      res.json(alumniWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/interview-guides", async (req, res) => {
    try {
      const { company } = req.query;
      const guides = await storage.getInterviewGuides(company);
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/interview-guides", requireRole(["alumni", "staff"]), async (req, res) => {
    try {
      const data = insertInterviewGuideSchema.parse(req.body);
      const guide = await storage.createInterviewGuide({
        ...data,
        authorId: req.session.userId
      });
      res.json(guide);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/assessments", async (req, res) => {
    try {
      const assessments2 = await storage.getAssessments();
      res.json(assessments2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/assessments", requireRole(["staff"]), async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/assessment-results", requireAuth, async (req, res) => {
    try {
      const data = insertAssessmentResultSchema.parse(req.body);
      const result = await storage.createAssessmentResult({
        ...data,
        userId: req.session.userId
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/assessment-results/user/:userId", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (req.params.userId !== req.session.userId && user?.role !== "staff") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const results = await storage.getAssessmentResults(req.params.userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const events2 = await storage.getEvents();
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/events", requireRole(["staff"]), async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...data,
        organizerId: req.session.userId
      });
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/placements", async (req, res) => {
    try {
      const placements2 = await storage.getPlacements();
      res.json(placements2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/placements/stats", async (req, res) => {
    try {
      const stats = await storage.getPlacementStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/placements", requireRole(["staff"]), async (req, res) => {
    try {
      const data = insertPlacementSchema.parse(req.body);
      const placement = await storage.createPlacement(data);
      res.json(placement);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/mentorships", requireAuth, async (req, res) => {
    try {
      const { mentorId, menteeId } = req.query;
      const mentorships2 = await storage.getMentorships(
        mentorId,
        menteeId
      );
      res.json(mentorships2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/mentorships", requireAuth, async (req, res) => {
    try {
      const data = insertMentorshipSchema.parse(req.body);
      const mentorship = await storage.createMentorship(data);
      res.json(mentorship);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/mentorships/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "active", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const mentorship = await storage.updateMentorshipStatus(req.params.id, status);
      if (!mentorship) {
        return res.status(404).json({ message: "Mentorship not found" });
      }
      res.json(mentorship);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5002", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
