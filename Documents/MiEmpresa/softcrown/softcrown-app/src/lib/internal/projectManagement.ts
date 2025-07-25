// Project Management Service
import { 
  ProjectTask, 
  KanbanColumn, 
  TimeEntry, 
  TaskStatus, 
  Priority, 
  ProjectPhase,
  TaskComment,
  TaskAttachment,
  PaginatedResponse,
  FilterOptions,
  SortOptions
} from '@/types/internal';
import { User } from '@/types/auth';

export interface CreateTaskRequest {
  title: string;
  description: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  dueDate: Date;
  projectId: string;
  phase: ProjectPhase;
  tags: string[];
  dependencies: string[];
}

export interface UpdateTaskRequest {
  taskId: string;
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  tags?: string[];
  dependencies?: string[];
}

export interface TaskFilters extends FilterOptions {
  phase?: ProjectPhase[];
  projectId?: string;
  overdue?: boolean;
}

export class ProjectManagementService {
  private tasks: Map<string, ProjectTask> = new Map();
  private timeEntries: Map<string, TimeEntry> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Task Management
  async createTask(request: CreateTaskRequest): Promise<{ success: boolean; task?: ProjectTask; error?: string }> {
    try {
      const assignee = this.users.get(request.assigneeId);
      if (!assignee) {
        return { success: false, error: 'Assignee not found' };
      }

      const taskId = this.generateTaskId();
      const task: ProjectTask = {
        id: taskId,
        title: request.title,
        description: request.description,
        assignee,
        status: request.status,
        priority: request.priority,
        estimatedHours: request.estimatedHours,
        actualHours: 0,
        dueDate: request.dueDate,
        dependencies: request.dependencies,
        projectId: request.projectId,
        phase: request.phase,
        tags: request.tags,
        attachments: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.tasks.set(taskId, task);

      // Track analytics
      this.trackTaskCreated(task);

      return { success: true, task };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      };
    }
  }

  async updateTask(request: UpdateTaskRequest): Promise<{ success: boolean; task?: ProjectTask; error?: string }> {
    try {
      const task = this.tasks.get(request.taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      // Update fields
      if (request.title !== undefined) task.title = request.title;
      if (request.description !== undefined) task.description = request.description;
      if (request.status !== undefined) {
        const oldStatus = task.status;
        task.status = request.status;
        
        // Mark as completed if status changed to done
        if (request.status === 'done' && oldStatus !== 'done') {
          task.completedAt = new Date();
        } else if (request.status !== 'done') {
          task.completedAt = undefined;
        }
      }
      if (request.priority !== undefined) task.priority = request.priority;
      if (request.estimatedHours !== undefined) task.estimatedHours = request.estimatedHours;
      if (request.actualHours !== undefined) task.actualHours = request.actualHours;
      if (request.dueDate !== undefined) task.dueDate = request.dueDate;
      if (request.tags !== undefined) task.tags = request.tags;
      if (request.dependencies !== undefined) task.dependencies = request.dependencies;

      if (request.assigneeId) {
        const assignee = this.users.get(request.assigneeId);
        if (assignee) {
          task.assignee = assignee;
        }
      }

      task.updatedAt = new Date();
      this.tasks.set(request.taskId, task);

      // Track analytics
      this.trackTaskUpdated(task);

      return { success: true, task };
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      };
    }
  }

  async deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      // Check for dependencies
      const dependentTasks = Array.from(this.tasks.values())
        .filter(t => t.dependencies.includes(taskId));
      
      if (dependentTasks.length > 0) {
        return { 
          success: false, 
          error: `Cannot delete task. ${dependentTasks.length} tasks depend on it.` 
        };
      }

      this.tasks.delete(taskId);

      // Remove from other tasks' dependencies
      this.tasks.forEach(t => {
        t.dependencies = t.dependencies.filter(dep => dep !== taskId);
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      };
    }
  }

  async getTasks(filters: TaskFilters = {}, page = 1, limit = 50, sort?: SortOptions): Promise<PaginatedResponse<ProjectTask>> {
    let filteredTasks = Array.from(this.tasks.values());

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.assignee.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.assignee!.includes(task.assignee.id));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.phase && filters.phase.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.phase!.includes(task.phase));
    }

    if (filters.projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === filters.projectId);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        filters.tags!.some(tag => task.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      filteredTasks = filteredTasks.filter(task =>
        task.dueDate >= filters.dateRange!.startDate &&
        task.dueDate <= filters.dateRange!.endDate
      );
    }

    if (filters.overdue) {
      const now = new Date();
      filteredTasks = filteredTasks.filter(task =>
        task.dueDate < now && task.status !== 'done'
      );
    }

    // Apply sorting
    if (sort) {
      filteredTasks.sort((a, b) => {
        let aValue: any = a[sort.field as keyof ProjectTask];
        let bValue: any = b[sort.field as keyof ProjectTask];

        // Handle nested properties
        if (sort.field === 'assignee.name') {
          aValue = a.assignee.name;
          bValue = b.assignee.name;
        }

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by priority and due date
      filteredTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    }

    // Pagination
    const total = filteredTasks.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    return {
      data: paginatedTasks,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  async getTask(taskId: string): Promise<ProjectTask | null> {
    return this.tasks.get(taskId) || null;
  }

  // Kanban Board
  async getKanbanBoard(projectId?: string): Promise<KanbanColumn[]> {
    const tasks = projectId 
      ? Array.from(this.tasks.values()).filter(task => task.projectId === projectId)
      : Array.from(this.tasks.values());

    const columns: KanbanColumn[] = [
      { id: 'todo', title: 'To Do', status: 'todo', tasks: [], order: 1 },
      { id: 'in_progress', title: 'In Progress', status: 'in_progress', tasks: [], order: 2, limit: 3 },
      { id: 'review', title: 'Review', status: 'review', tasks: [], order: 3 },
      { id: 'done', title: 'Done', status: 'done', tasks: [], order: 4 },
      { id: 'blocked', title: 'Blocked', status: 'blocked', tasks: [], order: 5 },
    ];

    // Group tasks by status
    tasks.forEach(task => {
      const column = columns.find(col => col.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });

    // Sort tasks within each column by priority and due date
    columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    });

    return columns;
  }

  async moveTask(taskId: string, newStatus: TaskStatus, newPosition?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      // Check column limits
      if (newStatus === 'in_progress') {
        const inProgressTasks = Array.from(this.tasks.values())
          .filter(t => t.status === 'in_progress' && t.id !== taskId);
        
        if (inProgressTasks.length >= 3) {
          return { success: false, error: 'In Progress column is at capacity (3 tasks max)' };
        }
      }

      const oldStatus = task.status;
      task.status = newStatus;
      task.updatedAt = new Date();

      // Mark as completed if moved to done
      if (newStatus === 'done' && oldStatus !== 'done') {
        task.completedAt = new Date();
      } else if (newStatus !== 'done') {
        task.completedAt = undefined;
      }

      this.tasks.set(taskId, task);

      // Track analytics
      this.trackTaskMoved(task, oldStatus, newStatus);

      return { success: true };
    } catch (error) {
      console.error('Error moving task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move task',
      };
    }
  }

  // Time Tracking
  async logTime(taskId: string, userId: string, hours: number, description: string, date: Date, billable = true): Promise<{ success: boolean; timeEntry?: TimeEntry; error?: string }> {
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const entryId = this.generateTimeEntryId();
      const timeEntry: TimeEntry = {
        id: entryId,
        taskId,
        userId,
        description,
        hours,
        date,
        billable,
        hourlyRate: user.role === 'admin' ? 75 : user.role === 'developer' ? 60 : 45, // Mock rates
      };

      this.timeEntries.set(entryId, timeEntry);

      // Update task actual hours
      task.actualHours += hours;
      task.updatedAt = new Date();
      this.tasks.set(taskId, task);

      return { success: true, timeEntry };
    } catch (error) {
      console.error('Error logging time:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log time',
      };
    }
  }

  async getTimeEntries(taskId?: string, userId?: string, dateRange?: { startDate: Date; endDate: Date }): Promise<TimeEntry[]> {
    let entries = Array.from(this.timeEntries.values());

    if (taskId) {
      entries = entries.filter(entry => entry.taskId === taskId);
    }

    if (userId) {
      entries = entries.filter(entry => entry.userId === userId);
    }

    if (dateRange) {
      entries = entries.filter(entry =>
        entry.date >= dateRange.startDate && entry.date <= dateRange.endDate
      );
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Comments
  async addComment(taskId: string, userId: string, content: string, mentions: string[] = []): Promise<{ success: boolean; comment?: TaskComment; error?: string }> {
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const commentId = this.generateCommentId();
      const comment: TaskComment = {
        id: commentId,
        content,
        author: user,
        createdAt: new Date(),
        updatedAt: new Date(),
        mentions,
      };

      task.comments.push(comment);
      task.updatedAt = new Date();
      this.tasks.set(taskId, task);

      // Send notifications to mentioned users
      if (mentions.length > 0) {
        this.sendMentionNotifications(task, comment, mentions);
      }

      return { success: true, comment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add comment',
      };
    }
  }

  // Attachments
  async addAttachment(taskId: string, file: { name: string; url: string; type: string; size: number }, uploadedBy: string): Promise<{ success: boolean; attachment?: TaskAttachment; error?: string }> {
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const attachmentId = this.generateAttachmentId();
      const attachment: TaskAttachment = {
        id: attachmentId,
        name: file.name,
        url: file.url,
        type: file.type,
        size: file.size,
        uploadedBy,
        uploadedAt: new Date(),
      };

      task.attachments.push(attachment);
      task.updatedAt = new Date();
      this.tasks.set(taskId, task);

      return { success: true, attachment };
    } catch (error) {
      console.error('Error adding attachment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add attachment',
      };
    }
  }

  // Analytics and Reporting
  async getTaskAnalytics(projectId?: string, dateRange?: { startDate: Date; endDate: Date }) {
    let tasks = Array.from(this.tasks.values());

    if (projectId) {
      tasks = tasks.filter(task => task.projectId === projectId);
    }

    if (dateRange) {
      tasks = tasks.filter(task =>
        task.createdAt >= dateRange.startDate && task.createdAt <= dateRange.endDate
      );
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const overdueTasks = tasks.filter(task => task.dueDate < new Date() && task.status !== 'done').length;
    const blockedTasks = tasks.filter(task => task.status === 'blocked').length;

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + task.actualHours, 0);
    const efficiency = totalEstimatedHours > 0 ? (totalEstimatedHours / totalActualHours) * 100 : 0;

    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    const tasksByPhase = tasks.reduce((acc, task) => {
      acc[task.phase] = (acc[task.phase] || 0) + 1;
      return acc;
    }, {} as Record<ProjectPhase, number>);

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      blockedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalEstimatedHours,
      totalActualHours,
      efficiency,
      tasksByStatus,
      tasksByPriority,
      tasksByPhase,
    };
  }

  // Private helper methods
  private initializeMockData(): void {
    // Initialize mock users
    const mockUsers: User[] = [
      {
        id: 'user1',
        email: 'admin@softcrown.com',
        name: 'Admin User',
        role: 'admin',
        avatar: '/avatars/admin.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        email: 'dev@softcrown.com',
        name: 'Developer',
        role: 'developer',
        avatar: '/avatars/dev.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user3',
        email: 'designer@softcrown.com',
        name: 'Designer',
        role: 'designer',
        avatar: '/avatars/designer.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUsers.forEach(user => this.users.set(user.id, user));

    // Initialize mock tasks
    const mockTasks: Partial<ProjectTask>[] = [
      {
        title: 'Design Homepage Layout',
        description: 'Create wireframes and mockups for the new homepage design',
        assignee: mockUsers[2],
        status: 'in_progress',
        priority: 'high',
        estimatedHours: 16,
        actualHours: 8,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        projectId: 'project1',
        phase: 'design',
        tags: ['design', 'homepage', 'ui'],
        dependencies: [],
      },
      {
        title: 'Implement User Authentication',
        description: 'Set up JWT-based authentication system',
        assignee: mockUsers[1],
        status: 'todo',
        priority: 'urgent',
        estimatedHours: 24,
        actualHours: 0,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        projectId: 'project1',
        phase: 'development',
        tags: ['backend', 'auth', 'security'],
        dependencies: [],
      },
      {
        title: 'Database Schema Design',
        description: 'Design and implement the database schema',
        assignee: mockUsers[1],
        status: 'done',
        priority: 'high',
        estimatedHours: 12,
        actualHours: 14,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        projectId: 'project1',
        phase: 'development',
        tags: ['database', 'schema'],
        dependencies: [],
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    mockTasks.forEach((taskData, index) => {
      const taskId = `task${index + 1}`;
      const task: ProjectTask = {
        id: taskId,
        attachments: [],
        comments: [],
        createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        ...taskData as ProjectTask,
      };
      this.tasks.set(taskId, task);
    });
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTimeEntryId(): string {
    return `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCommentId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAttachmentId(): string {
    return `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackTaskCreated(task: ProjectTask): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'task_created', {
        task_id: task.id,
        project_id: task.projectId,
        priority: task.priority,
        phase: task.phase,
        estimated_hours: task.estimatedHours,
      });
    }
  }

  private trackTaskUpdated(task: ProjectTask): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'task_updated', {
        task_id: task.id,
        project_id: task.projectId,
        status: task.status,
        priority: task.priority,
      });
    }
  }

  private trackTaskMoved(task: ProjectTask, oldStatus: TaskStatus, newStatus: TaskStatus): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'task_moved', {
        task_id: task.id,
        project_id: task.projectId,
        from_status: oldStatus,
        to_status: newStatus,
      });
    }
  }

  private sendMentionNotifications(task: ProjectTask, comment: TaskComment, mentions: string[]): void {
    // In a real app, this would send notifications to mentioned users
    console.log(`Sending mention notifications for task ${task.id} to users:`, mentions);
  }
}

// Export singleton instance
export const projectManagementService = new ProjectManagementService();
