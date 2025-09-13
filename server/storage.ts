import { 
  type User, 
  type InsertUser, 
  type Post,
  type InsertPost,
  type InterviewGuide,
  type InsertInterviewGuide,
  type Assessment,
  type InsertAssessment,
  type AssessmentResult,
  type InsertAssessmentResult,
  type Event,
  type InsertEvent,
  type Placement,
  type InsertPlacement,
  type Mentorship,
  type InsertMentorship
} from "@shared/schema";
import { MongoDBStorage } from "./mongodb-storage";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAlumniByCompanyOrField(company?: string, field?: string): Promise<User[]>;
  
  // Posts/Feed
  createPost(post: InsertPost & { authorId: string }): Promise<Post>;
  getPosts(company?: string, field?: string): Promise<(Post & { author: User })[]>;
  getPostById(id: string): Promise<Post | undefined>;
  
  // Interview Guides
  createInterviewGuide(guide: InsertInterviewGuide & { authorId: string }): Promise<InterviewGuide>;
  getInterviewGuides(company?: string): Promise<(InterviewGuide & { author: User })[]>;
  
  // Assessments
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessments(): Promise<Assessment[]>;
  getAssessmentById(id: string): Promise<Assessment | undefined>;
  
  // Assessment Results
  createAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult>;
  getAssessmentResults(userId: string): Promise<AssessmentResult[]>;
  getAssessmentResultsForAssessment(assessmentId: string): Promise<AssessmentResult[]>;
  
  // Events
  createEvent(event: InsertEvent & { organizerId: string }): Promise<Event>;
  getEvents(): Promise<(Event & { organizer: User })[]>;
  
  // Placements
  createPlacement(placement: InsertPlacement): Promise<Placement>;
  getPlacements(): Promise<(Placement & { student: User })[]>;
  getPlacementStats(): Promise<{
    totalPlacements: number;
    placementRate: number;
    averagePackage: number;
    highestPackage: number;
    companyStats: Array<{
      company: string;
      count: number;
      minPackage: number;
      maxPackage: number;
    }>;
  }>;
  
  // Mentorships
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  getMentorships(mentorId?: string, menteeId?: string): Promise<(Mentorship & { mentor: User; mentee: User })[]>;
  updateMentorshipStatus(id: string, status: "pending" | "active" | "completed"): Promise<Mentorship | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private interviewGuides: Map<string, InterviewGuide>;
  private assessments: Map<string, Assessment>;
  private assessmentResults: Map<string, AssessmentResult>;
  private events: Map<string, Event>;
  private placements: Map<string, Placement>;
  private mentorships: Map<string, Mentorship>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.interviewGuides = new Map();
    this.assessments = new Map();
    this.assessmentResults = new Map();
    this.events = new Map();
    this.placements = new Map();
    this.mentorships = new Map();

    // Initialize with some default assessments
    this.initializeDefaultAssessments();
  }

  private initializeDefaultAssessments() {
    const defaultAssessments: Array<InsertAssessment & { id: string; createdAt: Date }> = [
      {
        id: randomUUID(),
        title: "Aptitude Test",
        description: "Logical reasoning, quantitative ability, and verbal skills",
        category: "aptitude" as const,
        timeLimit: 30,
        totalQuestions: 25,
        questions: [
          {
            question: "If A can complete a work in 6 days and B can complete the same work in 8 days, how many days will they take to complete the work together?",
            options: ["3.43 days", "4.5 days", "5 days", "6 days"],
            correctAnswer: 0,
            explanation: "Combined rate = 1/6 + 1/8 = 7/24, so time = 24/7 ≈ 3.43 days"
          },
          {
            question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
            options: ["40", "42", "44", "46"],
            correctAnswer: 1,
            explanation: "Pattern: n(n+1) where n = 2,3,4,5,6,7... Next is 7×8 = 42"
          }
        ],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Coding Assessment",
        description: "Data structures, algorithms, and problem solving",
        category: "coding" as const,
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
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Computer Science Fundamentals",
        description: "Core CS concepts, DBMS, OS, Networks",
        category: "cs" as const,
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
        createdAt: new Date(),
      }
    ];

    defaultAssessments.forEach(assessment => {
      this.assessments.set(assessment.id, assessment);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
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
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAlumniByCompanyOrField(company?: string, field?: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => {
      if (user.role !== "alumni") return false;
      if (company && user.company?.toLowerCase().includes(company.toLowerCase())) return true;
      if (field && (user.department?.toLowerCase().includes(field.toLowerCase()) || 
                   user.position?.toLowerCase().includes(field.toLowerCase()))) return true;
      return !company && !field;
    });
  }

  async createPost(post: InsertPost & { authorId: string }): Promise<Post> {
    const id = randomUUID();
    const newPost: Post = {
      ...post,
      company: post.company ?? null,
      field: post.field ?? null,
      id,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPosts(company?: string, field?: string): Promise<(Post & { author: User })[]> {
    let posts = Array.from(this.posts.values());
    
    if (company || field) {
      posts = posts.filter(post => {
        if (company && post.company?.toLowerCase().includes(company.toLowerCase())) return true;
        if (field && post.field?.toLowerCase().includes(field.toLowerCase())) return true;
        return false;
      });
    }

    return posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(post => ({
        ...post,
        author: this.users.get(post.authorId)!
      }))
      .filter(post => post.author);
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createInterviewGuide(guide: InsertInterviewGuide & { authorId: string }): Promise<InterviewGuide> {
    const id = randomUUID();
    const newGuide: InterviewGuide = {
      ...guide,
      id,
      createdAt: new Date()
    };
    this.interviewGuides.set(id, newGuide);
    return newGuide;
  }

  async getInterviewGuides(company?: string): Promise<(InterviewGuide & { author: User })[]> {
    let guides = Array.from(this.interviewGuides.values());
    
    if (company) {
      guides = guides.filter(guide => 
        guide.company.toLowerCase().includes(company.toLowerCase())
      );
    }

    return guides
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(guide => ({
        ...guide,
        author: this.users.get(guide.authorId)!
      }))
      .filter(guide => guide.author);
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const newAssessment: Assessment = {
      ...assessment,
      id,
      createdAt: new Date()
    };
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async getAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values())
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async getAssessmentById(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async createAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult> {
    const id = randomUUID();
    const newResult: AssessmentResult = {
      ...result,
      id,
      createdAt: new Date()
    };
    this.assessmentResults.set(id, newResult);
    return newResult;
  }

  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    return Array.from(this.assessmentResults.values())
      .filter(result => result.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAssessmentResultsForAssessment(assessmentId: string): Promise<AssessmentResult[]> {
    return Array.from(this.assessmentResults.values())
      .filter(result => result.assessmentId === assessmentId);
  }

  async createEvent(event: InsertEvent & { organizerId: string }): Promise<Event> {
    const id = randomUUID();
    const newEvent: Event = {
      ...event,
      images: event.images ?? null,
      chiefGuest: event.chiefGuest ?? null,
      id,
      createdAt: new Date()
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async getEvents(): Promise<(Event & { organizer: User })[]> {
    return Array.from(this.events.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(event => ({
        ...event,
        organizer: this.users.get(event.organizerId)!
      }))
      .filter(event => event.organizer);
  }

  async createPlacement(placement: InsertPlacement): Promise<Placement> {
    const id = randomUUID();
    const newPlacement: Placement = {
      ...placement,
      id,
      createdAt: new Date()
    };
    this.placements.set(id, newPlacement);
    return newPlacement;
  }

  async getPlacements(): Promise<(Placement & { student: User })[]> {
    return Array.from(this.placements.values())
      .sort((a, b) => b.year - a.year)
      .map(placement => ({
        ...placement,
        student: this.users.get(placement.studentId)!
      }))
      .filter(placement => placement.student);
  }

  async getPlacementStats(): Promise<{
    totalPlacements: number;
    placementRate: number;
    averagePackage: number;
    highestPackage: number;
    companyStats: Array<{
      company: string;
      count: number;
      minPackage: number;
      maxPackage: number;
    }>;
  }> {
    const placements = Array.from(this.placements.values());
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    
    const totalPlacements = placements.length;
    const placementRate = students.length > 0 ? (totalPlacements / students.length) * 100 : 0;
    const packages = placements.map(p => p.package);
    const averagePackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    const companyMap = new Map<string, { count: number; packages: number[] }>();
    placements.forEach(placement => {
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

  async createMentorship(mentorship: InsertMentorship): Promise<Mentorship> {
    const id = randomUUID();
    const newMentorship: Mentorship = {
      ...mentorship,
      status: mentorship.status || "pending",
      field: mentorship.field ?? null,
      id,
      createdAt: new Date()
    };
    this.mentorships.set(id, newMentorship);
    return newMentorship;
  }

  async getMentorships(mentorId?: string, menteeId?: string): Promise<(Mentorship & { mentor: User; mentee: User })[]> {
    let mentorships = Array.from(this.mentorships.values());
    
    if (mentorId) {
      mentorships = mentorships.filter(m => m.mentorId === mentorId);
    }
    if (menteeId) {
      mentorships = mentorships.filter(m => m.menteeId === menteeId);
    }

    return mentorships
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(mentorship => ({
        ...mentorship,
        mentor: this.users.get(mentorship.mentorId)!,
        mentee: this.users.get(mentorship.menteeId)!
      }))
      .filter(mentorship => mentorship.mentor && mentorship.mentee);
  }

  async updateMentorshipStatus(id: string, status: "pending" | "active" | "completed"): Promise<Mentorship | undefined> {
    const mentorship = this.mentorships.get(id);
    if (!mentorship) return undefined;
    
    const updated = { ...mentorship, status };
    this.mentorships.set(id, updated);
    return updated;
  }
}

// Create a singleton instance of MongoDB storage
let storageInstance: MongoDBStorage | null = null;

export const getStorage = (): MongoDBStorage => {
  if (!storageInstance) {
    storageInstance = new MongoDBStorage();
  }
  return storageInstance;
};

// For backward compatibility, export storage as a getter
export const storage = new Proxy({} as MongoDBStorage, {
  get(target, prop) {
    return getStorage()[prop as keyof MongoDBStorage];
  }
});
