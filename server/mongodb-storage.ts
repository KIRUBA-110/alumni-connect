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
import mongoose, { Types } from 'mongoose';
import { 
  User as UserModel, 
  Post as PostModel, 
  InterviewGuide as InterviewGuideModel,
  Assessment as AssessmentModel,
  AssessmentResult as AssessmentResultModel,
  Event as EventModel,
  Placement as PlacementModel,
  Mentorship as MentorshipModel,
  Message as MessageModel,
  type IUser,
  type IPost,
  type IInterviewGuide,
  type IAssessment,
  type IAssessmentResult,
  type IEvent,
  type IPlacement,
  type IMentorship,
  type IMessage
} from "./models";

export class MongoDBStorage {
  // Helper function to convert MongoDB document to our schema format
  private convertUser(user: IUser): User {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      fullName: user.fullName,
      college: user.college,
      graduationYear: user.graduationYear || null,
      department: user.department || null,
      company: user.company || null,
      position: user.position || null,
      location: user.location || null,
      bio: user.bio || null,
      avatar: user.avatar || null,
      createdAt: user.createdAt
    };
  }

  private convertMessage(message: IMessage): any {
    return {
      id: message._id.toString(),
      mentorshipId: message.mentorshipId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      messageType: message.messageType,
      isRead: message.isRead,
      createdAt: message.createdAt
    };
  }

  private convertPost(post: IPost): Post {
    return {
      id: post._id.toString(),
      authorId: post.authorId,
      content: post.content,
      company: post.company || null,
      field: post.field || null,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt
    };
  }

  private convertInterviewGuide(guide: IInterviewGuide): InterviewGuide {
    return {
      id: guide._id.toString(),
      authorId: guide.authorId,
      company: guide.company,
      role: guide.role,
      experience: guide.experience,
      questions: guide.questions,
      tips: guide.tips || null,
      difficulty: guide.difficulty,
      createdAt: guide.createdAt
    };
  }

  private convertAssessment(assessment: IAssessment): Assessment {
    return {
      id: assessment._id.toString(),
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      questions: assessment.questions,
      timeLimit: assessment.timeLimit,
      totalQuestions: assessment.totalQuestions,
      createdAt: assessment.createdAt
    };
  }

  private convertAssessmentResult(result: IAssessmentResult): AssessmentResult {
    return {
      id: result._id.toString(),
      userId: result.userId,
      assessmentId: result.assessmentId,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeSpent: result.timeSpent,
      answers: result.answers,
      createdAt: result.createdAt
    };
  }

  private convertEvent(event: IEvent): Event {
    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      location: event.location,
      images: event.images,
      chiefGuest: event.chiefGuest || null,
      organizerId: event.organizerId,
      createdAt: event.createdAt
    };
  }

  private convertPlacement(placement: IPlacement): Placement {
    return {
      id: placement._id.toString(),
      studentId: placement.studentId,
      company: placement.company,
      role: placement.role,
      package: placement.package,
      placementType: placement.placementType,
      year: placement.year,
      createdAt: placement.createdAt
    };
  }

  private convertMentorship(mentorship: IMentorship): Mentorship {
    return {
      id: mentorship._id.toString(),
      mentorId: mentorship.mentorId,
      menteeId: mentorship.menteeId,
      status: mentorship.status,
      field: mentorship.field || null,
      createdAt: mentorship.createdAt
    };
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? this.convertUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? this.convertUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? this.convertUser(user) : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map(user => this.convertUser(user));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel({
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      role: insertUser.role || "student",
      fullName: insertUser.fullName,
      college: insertUser.college,
      graduationYear: insertUser.graduationYear,
      department: insertUser.department,
      company: insertUser.company,
      position: insertUser.position,
      location: insertUser.location,
      bio: insertUser.bio,
      avatar: insertUser.avatar
    });
    
    const savedUser = await user.save();
    return this.convertUser(savedUser);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    return user ? this.convertUser(user) : undefined;
  }

  async getAlumniByCompanyOrField(company?: string, field?: string): Promise<User[]> {
    const query: any = { role: "alumni" };
    
    if (company || field) {
      query.$or = [];
      if (company) {
        query.$or.push({ company: { $regex: company, $options: 'i' } });
      }
      if (field) {
        query.$or.push(
          { department: { $regex: field, $options: 'i' } },
          { position: { $regex: field, $options: 'i' } }
        );
      }
    }

    const users = await UserModel.find(query);
    return users.map(user => this.convertUser(user));
  }

  // Posts/Feed
  async createPost(post: InsertPost & { authorId: string }): Promise<Post> {
    const newPost = new PostModel({
      authorId: post.authorId,
      content: post.content,
      company: post.company,
      field: post.field
    });
    
    const savedPost = await newPost.save();
    return this.convertPost(savedPost);
  }

  async getPosts(company?: string, field?: string): Promise<(Post & { author: User })[]> {
    const query: any = {};
    
    if (company || field) {
      query.$or = [];
      if (company) {
        query.$or.push({ company: { $regex: company, $options: 'i' } });
      }
      if (field) {
        query.$or.push({ field: { $regex: field, $options: 'i' } });
      }
    }

    const posts = await PostModel.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'username fullName role company position avatar');

    return posts.map(post => ({
      ...this.convertPost(post),
      author: this.convertUser(post.authorId as any)
    }));
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const post = await PostModel.findById(id);
    return post ? this.convertPost(post) : undefined;
  }

  // Interview Guides
  async createInterviewGuide(guide: InsertInterviewGuide & { authorId: string }): Promise<InterviewGuide> {
    const newGuide = new InterviewGuideModel({
      authorId: guide.authorId,
      company: guide.company,
      role: guide.role,
      experience: guide.experience,
      questions: guide.questions,
      tips: guide.tips,
      difficulty: guide.difficulty
    });
    
    const savedGuide = await newGuide.save();
    return this.convertInterviewGuide(savedGuide);
  }

  async getInterviewGuides(company?: string): Promise<(InterviewGuide & { author: User })[]> {
    const query: any = {};
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    const guides = await InterviewGuideModel.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'username fullName role company position avatar');

    return guides.map(guide => ({
      ...this.convertInterviewGuide(guide),
      author: this.convertUser(guide.authorId as any)
    }));
  }

  // Assessments
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const newAssessment = new AssessmentModel({
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      questions: assessment.questions,
      timeLimit: assessment.timeLimit,
      totalQuestions: assessment.totalQuestions
    });
    
    const savedAssessment = await newAssessment.save();
    return this.convertAssessment(savedAssessment);
  }

  async getAssessments(): Promise<Assessment[]> {
    const assessments = await AssessmentModel.find().sort({ title: 1 });
    return assessments.map(assessment => this.convertAssessment(assessment));
  }

  async getAssessmentById(id: string): Promise<Assessment | undefined> {
    const assessment = await AssessmentModel.findById(id);
    return assessment ? this.convertAssessment(assessment) : undefined;
  }

  // Assessment Results
  async createAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult> {
    const newResult = new AssessmentResultModel({
      userId: result.userId,
      assessmentId: result.assessmentId,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeSpent: result.timeSpent,
      answers: result.answers
    });
    
    const savedResult = await newResult.save();
    return this.convertAssessmentResult(savedResult);
  }

  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    const results = await AssessmentResultModel.find({ userId }).sort({ createdAt: -1 });
    return results.map(result => this.convertAssessmentResult(result));
  }

  async getAssessmentResultsForAssessment(assessmentId: string): Promise<AssessmentResult[]> {
    const results = await AssessmentResultModel.find({ assessmentId });
    return results.map(result => this.convertAssessmentResult(result));
  }

  // Events
  async createEvent(event: InsertEvent & { organizerId: string }): Promise<Event> {
    const newEvent = new EventModel({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      location: event.location,
      images: event.images || [],
      chiefGuest: event.chiefGuest,
      organizerId: event.organizerId
    });
    
    const savedEvent = await newEvent.save();
    return this.convertEvent(savedEvent);
  }

  async getEvents(): Promise<(Event & { organizer: User })[]> {
    const events = await EventModel.find()
      .sort({ date: -1 })
      .populate('organizerId', 'username fullName role avatar');

    return events.map(event => ({
      ...this.convertEvent(event),
      organizer: this.convertUser(event.organizerId as any)
    }));
  }

  // Placements
  async createPlacement(placement: InsertPlacement): Promise<Placement> {
    const newPlacement = new PlacementModel({
      studentId: placement.studentId,
      company: placement.company,
      role: placement.role,
      package: placement.package,
      placementType: placement.placementType,
      year: placement.year
    });
    
    const savedPlacement = await newPlacement.save();
    return this.convertPlacement(savedPlacement);
  }

  async getPlacements(): Promise<(Placement & { student: User })[]> {
    const placements = await PlacementModel.find()
      .sort({ year: -1 })
      .populate('studentId', 'username fullName role department graduationYear');

    return placements.map(placement => ({
      ...this.convertPlacement(placement),
      student: this.convertUser(placement.studentId as any)
    }));
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
    const placements = await PlacementModel.find();
    const students = await UserModel.find({ role: "student" });
    
    const totalPlacements = placements.length;
    const placementRate = students.length > 0 ? (totalPlacements / students.length) * 100 : 0;
    const packages = placements.map(p => p.package);
    const averagePackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    // Group by company
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

  // Mentorships
  async createMentorship(mentorship: InsertMentorship): Promise<Mentorship> {
    const newMentorship = new MentorshipModel({
      mentorId: mentorship.mentorId,
      menteeId: mentorship.menteeId,
      status: mentorship.status || "pending",
      field: mentorship.field
    });
    
    const savedMentorship = await newMentorship.save();
    return this.convertMentorship(savedMentorship);
  }

  async getMentorships(mentorId?: string, menteeId?: string): Promise<(Mentorship & { mentor: User; mentee: User })[]> {
    const query: any = {};
    if (mentorId) query.mentorId = mentorId;
    if (menteeId) query.menteeId = menteeId;

    const mentorships = await MentorshipModel.find(query)
      .sort({ createdAt: -1 })
      .populate('mentorId', 'username fullName role company position avatar college department graduationYear')
      .populate('menteeId', 'username fullName role department graduationYear avatar college');

    return mentorships
      .filter(mentorship => {
        const mentor = mentorship.mentorId as any;
        const mentee = mentorship.menteeId as any;
        return mentor && mentee; // Only include mentorships with valid mentor and mentee data
      })
      .map(mentorship => {
        const mentor = mentorship.mentorId as any;
        const mentee = mentorship.menteeId as any;
        
        return {
          ...this.convertMentorship(mentorship),
          mentor: this.convertUser(mentor),
          mentee: this.convertUser(mentee)
        };
      });
  }

  async updateMentorshipStatus(id: string, status: string): Promise<Mentorship | null> {
    const mentorship = await MentorshipModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('mentorId menteeId');
    return mentorship ? this.convertMentorship(mentorship) : null;
  }

  async deleteMentorship(id: string): Promise<Mentorship | null> {
    const mentorship = await MentorshipModel.findByIdAndDelete(id);
    return mentorship ? this.convertMentorship(mentorship) : null;
  }

  async getMentorshipBetweenUsers(mentorId: string, menteeId: string): Promise<Mentorship | null> {
    const mentorship = await MentorshipModel.findOne({
      $or: [
        { mentorId, menteeId },
        { mentorId: menteeId, menteeId: mentorId }
      ]
    });
    return mentorship ? this.convertMentorship(mentorship) : null;
  }

  // Messages
  async createMessage(messageData: {
    mentorshipId: string;
    senderId: string;
    receiverId: string;
    content: string;
    messageType: 'text' | 'file' | 'image';
  }): Promise<any> {
    const message = new MessageModel({
      mentorshipId: messageData.mentorshipId,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      messageType: messageData.messageType || 'text'
    });
    
    const savedMessage = await message.save();
    return this.convertMessage(savedMessage);
  }

  async getMessages(mentorshipId: string): Promise<any[]> {
    const messages = await MessageModel.find({ mentorshipId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username fullName avatar')
      .populate('receiverId', 'username fullName avatar');

    return messages.map(message => ({
      ...this.convertMessage(message),
      sender: this.convertUser(message.senderId as any),
      receiver: this.convertUser(message.receiverId as any)
    }));
  }

  async markMessageAsRead(messageId: string): Promise<any | undefined> {
    const message = await MessageModel.findByIdAndUpdate(
      messageId, 
      { isRead: true }, 
      { new: true }
    );
    return message ? this.convertMessage(message) : undefined;
  }

  // Initialize default interview guides
  async initializeDefaultInterviewGuides() {
    try {
      const existingGuides = await InterviewGuideModel.countDocuments();
      if (existingGuides > 0) {
        console.log('Interview guides already exist, skipping initialization');
        return;
      }

      const defaultGuides = [
        {
          authorId: new Types.ObjectId(),
          company: "Google",
          role: "Software Engineer",
          experience: "New Grad",
          questions: [
            "Tell me about yourself",
            "Why do you want to work at Google?",
            "Describe a challenging project you worked on",
            "How would you design a URL shortener?",
            "What's your favorite Google product and how would you improve it?"
          ],
          tips: [
            "Practice coding problems on LeetCode",
            "Be familiar with Google's products and services",
            "Prepare for system design questions",
            "Show enthusiasm for technology and innovation",
            "Ask thoughtful questions about the team and projects"
          ],
          difficulty: "Hard"
        },
        {
          authorId: new Types.ObjectId(),
          company: "Microsoft",
          role: "Software Development Engineer",
          experience: "Entry Level",
          questions: [
            "Why Microsoft?",
            "Describe your experience with cloud technologies",
            "How do you handle debugging complex issues?",
            "Design a chat application",
            "What's your experience with Agile methodologies?"
          ],
          tips: [
            "Understand Microsoft's cloud-first approach",
            "Be prepared to discuss Azure services",
            "Show collaborative mindset",
            "Demonstrate problem-solving skills",
            "Research the specific team you're interviewing with"
          ],
          difficulty: "Medium"
        },
        {
          authorId: new Types.ObjectId(),
          company: "Amazon",
          role: "Software Development Engineer",
          experience: "New Grad",
          questions: [
            "Tell me about a time you had to work with limited resources",
            "How do you prioritize tasks when everything seems urgent?",
            "Describe the most complex system you've worked on",
            "How would you design Amazon's recommendation system?",
            "Give an example of when you had to learn something quickly"
          ],
          tips: [
            "Study Amazon's Leadership Principles thoroughly",
            "Prepare STAR format examples for behavioral questions",
            "Practice system design at scale",
            "Show customer obsession in your examples",
            "Demonstrate ownership and bias for action"
          ],
          difficulty: "Hard"
        }
      ];

      await InterviewGuideModel.insertMany(defaultGuides);
      console.log('✅ Default interview guides created successfully');
    } catch (error) {
      console.error('Failed to initialize default interview guides:', error);
    }
  }

  async initializeSampleData() {
    try {
      // Check if sample data already exists
      const existingUsers = await UserModel.countDocuments();
      if (existingUsers > 3) {
        console.log('Sample data already exists, skipping initialization');
        return;
      }

      // Create sample users
      const sampleUsers = [
        {
          username: "john_doe",
          email: "john@mit.edu",
          password: "$2b$10$example", // This would be properly hashed in real scenario
          fullName: "John Doe",
          role: "alumni",
          college: "MIT",
          department: "Computer Science",
          graduationYear: "2020",
          company: "Google",
          position: "Senior Software Engineer",
          location: "San Francisco, CA",
          bio: "Passionate software engineer with 4+ years of experience in distributed systems and machine learning."
        },
        {
          username: "jane_smith",
          email: "jane@mit.edu",
          password: "$2b$10$example",
          fullName: "Jane Smith",
          role: "student",
          college: "MIT",
          department: "Computer Science",
          graduationYear: "2024",
          location: "Cambridge, MA",
          bio: "Final year CS student interested in AI and web development. Looking for mentorship opportunities."
        },
        {
          username: "mike_wilson",
          email: "mike@stanford.edu",
          password: "$2b$10$example",
          fullName: "Mike Wilson",
          role: "alumni",
          college: "Stanford University",
          department: "Electrical Engineering",
          graduationYear: "2019",
          company: "Tesla",
          position: "Hardware Engineer",
          location: "Palo Alto, CA",
          bio: "Hardware engineer working on autonomous vehicle systems. Love mentoring students in engineering."
        },
        {
          username: "sarah_johnson",
          email: "sarah@stanford.edu",
          password: "$2b$10$example",
          fullName: "Sarah Johnson",
          role: "student",
          college: "Stanford University",
          department: "Electrical Engineering",
          graduationYear: "2025",
          location: "Stanford, CA",
          bio: "Third year EE student passionate about renewable energy and sustainable technology."
        }
      ];

      const createdUsers = await UserModel.insertMany(sampleUsers);
      console.log('✅ Sample users created successfully');

      // Create sample posts
      const samplePosts = [
        {
          authorId: createdUsers[0]._id,
          content: "Just finished an amazing project at Google involving machine learning and distributed systems. Happy to share insights with anyone interested in this field!",
          type: "text"
        },
        {
          authorId: createdUsers[2]._id,
          content: "Working on cutting-edge autonomous vehicle technology at Tesla. The future of transportation is here! Feel free to reach out if you're interested in hardware engineering.",
          type: "text"
        },
        {
          authorId: createdUsers[1]._id,
          content: "Looking for internship opportunities in AI/ML. Would love to connect with alumni working in this space. Any advice would be greatly appreciated!",
          type: "text"
        }
      ];

      await PostModel.insertMany(samplePosts);
      console.log('✅ Sample posts created successfully');

      // Create sample placements
      const samplePlacements = [
        {
          studentId: createdUsers[0]._id,
          company: "Google",
          role: "Software Engineer",
          package: 180000,
          placementType: "Full-time",
          year: 2020
        },
        {
          studentId: createdUsers[2]._id,
          company: "Tesla",
          role: "Hardware Engineer",
          package: 160000,
          placementType: "Full-time",
          year: 2019
        }
      ];

      await PlacementModel.insertMany(samplePlacements);
      console.log('✅ Sample placements created successfully');

      // Create sample events
      const sampleEvents = [
        {
          title: "Tech Career Fair 2024",
          description: "Annual career fair featuring top tech companies. Great opportunity to network and find job opportunities.",
          date: new Date("2024-03-15"),
          location: "MIT Campus Center",
          organizerId: createdUsers[0]._id,
          attendees: [createdUsers[1]._id]
        },
        {
          title: "AI/ML Workshop Series",
          description: "Weekly workshop series covering machine learning fundamentals and advanced topics.",
          date: new Date("2024-02-20"),
          location: "Stanford Engineering Building",
          organizerId: createdUsers[2]._id,
          attendees: [createdUsers[3]._id]
        }
      ];

      await EventModel.insertMany(sampleEvents);
      console.log('✅ Sample events created successfully');

      console.log('🎉 All sample data initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }

  async initializeDefaultAssessments(): Promise<void> {
    const existingAssessments = await AssessmentModel.countDocuments();
    if (existingAssessments > 0) return; // Already initialized

    const defaultAssessments: InsertAssessment[] = [
      {
        title: "General Aptitude Test",
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
        ]
      }
    ];

    await AssessmentModel.insertMany(defaultAssessments);
    console.log('✅ Default assessments created successfully');
  }
}
