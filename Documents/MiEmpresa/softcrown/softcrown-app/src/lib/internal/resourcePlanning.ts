// Resource Planning Service
import {
  TeamMember,
  Availability,
  ResourceAllocation,
  ProjectTimeline,
  TimelinePhase,
  Milestone,
  ProjectDependency,
  ProjectPhase,
  DateRange
} from '@/types/internal';
import { User } from '@/types/auth';

export interface CreateAllocationRequest {
  projectId: string;
  teamMemberId: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  role: string;
  notes?: string;
}

export interface ResourceConflict {
  teamMemberId: string;
  teamMemberName: string;
  conflictDate: Date;
  allocatedHours: number;
  availableHours: number;
  overallocation: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    allocatedHours: number;
  }>;
}

export interface CapacityReport {
  teamMemberId: string;
  teamMemberName: string;
  role: string;
  totalCapacity: number;
  allocatedHours: number;
  availableHours: number;
  utilizationRate: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    allocatedHours: number;
    percentage: number;
  }>;
}

export interface WorkloadDistribution {
  date: Date;
  totalCapacity: number;
  totalAllocated: number;
  utilizationRate: number;
  teamMembers: Array<{
    id: string;
    name: string;
    capacity: number;
    allocated: number;
    utilization: number;
  }>;
}

export class ResourcePlanningService {
  private teamMembers: Map<string, TeamMember> = new Map();
  private allocations: Map<string, ResourceAllocation> = new Map();
  private timelines: Map<string, ProjectTimeline> = new Map();
  private projects: Map<string, { id: string; name: string; status: string }> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Team Member Management
  async createTeamMember(user: User, role: string, department: string, hourlyRate: number, capacity: number, skills: string[]): Promise<{ success: boolean; teamMember?: TeamMember; error?: string }> {
    try {
      const teamMember: TeamMember = {
        id: user.id,
        user,
        role,
        department,
        hourlyRate,
        capacity,
        skills,
        availability: [],
        currentWorkload: 0,
        isActive: true,
      };

      this.teamMembers.set(user.id, teamMember);

      return { success: true, teamMember };
    } catch (error) {
      console.error('Error creating team member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create team member',
      };
    }
  }

  async updateTeamMemberAvailability(teamMemberId: string, availability: Availability[]): Promise<{ success: boolean; error?: string }> {
    try {
      const teamMember = this.teamMembers.get(teamMemberId);
      if (!teamMember) {
        return { success: false, error: 'Team member not found' };
      }

      teamMember.availability = availability;
      this.teamMembers.set(teamMemberId, teamMember);

      // Recalculate workload
      await this.recalculateWorkload(teamMemberId);

      return { success: true };
    } catch (error) {
      console.error('Error updating availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update availability',
      };
    }
  }

  async getTeamMembers(department?: string, skills?: string[]): Promise<TeamMember[]> {
    let members = Array.from(this.teamMembers.values()).filter(member => member.isActive);

    if (department) {
      members = members.filter(member => member.department === department);
    }

    if (skills && skills.length > 0) {
      members = members.filter(member =>
        skills.some(skill => member.skills.includes(skill))
      );
    }

    return members.sort((a, b) => a.user.name.localeCompare(b.user.name));
  }

  // Resource Allocation
  async createAllocation(request: CreateAllocationRequest): Promise<{ success: boolean; allocation?: ResourceAllocation; error?: string }> {
    try {
      const teamMember = this.teamMembers.get(request.teamMemberId);
      if (!teamMember) {
        return { success: false, error: 'Team member not found' };
      }

      // Check for conflicts
      const conflicts = await this.checkResourceConflicts(
        request.teamMemberId,
        request.startDate,
        request.endDate,
        request.allocatedHours
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          error: `Resource conflict detected. Overallocation of ${conflicts[0].overallocation} hours on ${conflicts[0].conflictDate.toDateString()}`,
        };
      }

      const allocationId = this.generateAllocationId();
      const allocation: ResourceAllocation = {
        id: allocationId,
        projectId: request.projectId,
        teamMemberId: request.teamMemberId,
        startDate: request.startDate,
        endDate: request.endDate,
        allocatedHours: request.allocatedHours,
        actualHours: 0,
        role: request.role,
        notes: request.notes,
      };

      this.allocations.set(allocationId, allocation);

      // Update team member workload
      await this.recalculateWorkload(request.teamMemberId);

      return { success: true, allocation };
    } catch (error) {
      console.error('Error creating allocation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create allocation',
      };
    }
  }

  async updateAllocation(allocationId: string, updates: Partial<ResourceAllocation>): Promise<{ success: boolean; error?: string }> {
    try {
      const allocation = this.allocations.get(allocationId);
      if (!allocation) {
        return { success: false, error: 'Allocation not found' };
      }

      // Check for conflicts if dates or hours are being updated
      if (updates.startDate || updates.endDate || updates.allocatedHours) {
        const conflicts = await this.checkResourceConflicts(
          allocation.teamMemberId,
          updates.startDate || allocation.startDate,
          updates.endDate || allocation.endDate,
          updates.allocatedHours || allocation.allocatedHours,
          allocationId // Exclude current allocation from conflict check
        );

        if (conflicts.length > 0) {
          return {
            success: false,
            error: `Resource conflict detected. Overallocation of ${conflicts[0].overallocation} hours on ${conflicts[0].conflictDate.toDateString()}`,
          };
        }
      }

      // Apply updates
      Object.assign(allocation, updates);
      this.allocations.set(allocationId, allocation);

      // Update team member workload
      await this.recalculateWorkload(allocation.teamMemberId);

      return { success: true };
    } catch (error) {
      console.error('Error updating allocation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update allocation',
      };
    }
  }

  async deleteAllocation(allocationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const allocation = this.allocations.get(allocationId);
      if (!allocation) {
        return { success: false, error: 'Allocation not found' };
      }

      this.allocations.delete(allocationId);

      // Update team member workload
      await this.recalculateWorkload(allocation.teamMemberId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting allocation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete allocation',
      };
    }
  }

  async getAllocations(projectId?: string, teamMemberId?: string, dateRange?: DateRange): Promise<ResourceAllocation[]> {
    let allocations = Array.from(this.allocations.values());

    if (projectId) {
      allocations = allocations.filter(allocation => allocation.projectId === projectId);
    }

    if (teamMemberId) {
      allocations = allocations.filter(allocation => allocation.teamMemberId === teamMemberId);
    }

    if (dateRange) {
      allocations = allocations.filter(allocation =>
        allocation.startDate <= dateRange.endDate && allocation.endDate >= dateRange.startDate
      );
    }

    return allocations.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  // Conflict Detection
  async checkResourceConflicts(teamMemberId: string, startDate: Date, endDate: Date, allocatedHours: number, excludeAllocationId?: string): Promise<ResourceConflict[]> {
    const teamMember = this.teamMembers.get(teamMemberId);
    if (!teamMember) return [];

    const conflicts: ResourceConflict[] = [];
    const existingAllocations = Array.from(this.allocations.values())
      .filter(allocation =>
        allocation.teamMemberId === teamMemberId &&
        allocation.id !== excludeAllocationId &&
        allocation.startDate <= endDate &&
        allocation.endDate >= startDate
      );

    // Check each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Skip weekends for now (could be configurable)
      if (!isWeekend) {
        const dailyCapacity = teamMember.capacity / 5; // Assuming 5-day work week
        const dailyAllocation = allocatedHours / this.getWorkingDays(startDate, endDate);

        // Check availability for this date
        const availability = teamMember.availability.find(avail =>
          avail.date.toDateString() === currentDate.toDateString()
        );

        let availableHours = dailyCapacity;
        if (availability) {
          if (availability.type === 'vacation' || availability.type === 'sick') {
            availableHours = 0;
          } else if (availability.type === 'busy') {
            availableHours = Math.max(0, dailyCapacity - availability.hours);
          } else {
            availableHours = availability.hours;
          }
        }

        // Calculate existing allocations for this date
        const existingDailyAllocations = existingAllocations
          .filter(allocation =>
            allocation.startDate <= currentDate && allocation.endDate >= currentDate
          )
          .reduce((sum, allocation) => {
            const allocationDays = this.getWorkingDays(allocation.startDate, allocation.endDate);
            return sum + (allocation.allocatedHours / allocationDays);
          }, 0);

        const totalAllocated = existingDailyAllocations + dailyAllocation;

        if (totalAllocated > availableHours) {
          const overallocation = totalAllocated - availableHours;
          const projectAllocations = existingAllocations
            .filter(allocation =>
              allocation.startDate <= currentDate && allocation.endDate >= currentDate
            )
            .map(allocation => {
              const project = this.projects.get(allocation.projectId);
              const allocationDays = this.getWorkingDays(allocation.startDate, allocation.endDate);
              return {
                projectId: allocation.projectId,
                projectName: project?.name || 'Unknown Project',
                allocatedHours: allocation.allocatedHours / allocationDays,
              };
            });

          conflicts.push({
            teamMemberId,
            teamMemberName: teamMember.user.name,
            conflictDate: new Date(currentDate),
            allocatedHours: totalAllocated,
            availableHours,
            overallocation,
            projects: projectAllocations,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return conflicts;
  }

  async getResourceConflicts(dateRange?: DateRange): Promise<ResourceConflict[]> {
    const allConflicts: ResourceConflict[] = [];
    const teamMembers = Array.from(this.teamMembers.values());

    for (const teamMember of teamMembers) {
      const memberAllocations = Array.from(this.allocations.values())
        .filter(allocation => allocation.teamMemberId === teamMember.id);

      if (dateRange) {
        memberAllocations.filter(allocation =>
          allocation.startDate <= dateRange.endDate && allocation.endDate >= dateRange.startDate
        );
      }

      // Check each allocation for conflicts
      for (const allocation of memberAllocations) {
        const conflicts = await this.checkResourceConflicts(
          teamMember.id,
          allocation.startDate,
          allocation.endDate,
          allocation.allocatedHours,
          allocation.id
        );
        allConflicts.push(...conflicts);
      }
    }

    // Remove duplicates and sort by date
    const uniqueConflicts = allConflicts.filter((conflict, index, array) =>
      index === array.findIndex(c =>
        c.teamMemberId === conflict.teamMemberId &&
        c.conflictDate.getTime() === conflict.conflictDate.getTime()
      )
    );

    return uniqueConflicts.sort((a, b) => a.conflictDate.getTime() - b.conflictDate.getTime());
  }

  // Capacity Planning
  async getCapacityReport(dateRange: DateRange): Promise<CapacityReport[]> {
    const reports: CapacityReport[] = [];
    const teamMembers = Array.from(this.teamMembers.values()).filter(member => member.isActive);

    for (const teamMember of teamMembers) {
      const allocations = Array.from(this.allocations.values())
        .filter(allocation =>
          allocation.teamMemberId === teamMember.id &&
          allocation.startDate <= dateRange.endDate &&
          allocation.endDate >= dateRange.startDate
        );

      const workingDays = this.getWorkingDays(dateRange.startDate, dateRange.endDate);
      const totalCapacity = (teamMember.capacity / 5) * workingDays; // Assuming 5-day work week

      let totalAllocated = 0;
      const projectAllocations: Array<{ projectId: string; projectName: string; allocatedHours: number; percentage: number }> = [];

      for (const allocation of allocations) {
        const overlapStart = new Date(Math.max(allocation.startDate.getTime(), dateRange.startDate.getTime()));
        const overlapEnd = new Date(Math.min(allocation.endDate.getTime(), dateRange.endDate.getTime()));
        const overlapDays = this.getWorkingDays(overlapStart, overlapEnd);
        const allocationDays = this.getWorkingDays(allocation.startDate, allocation.endDate);
        const allocatedHours = (allocation.allocatedHours / allocationDays) * overlapDays;

        totalAllocated += allocatedHours;

        const project = this.projects.get(allocation.projectId);
        const existingProject = projectAllocations.find(p => p.projectId === allocation.projectId);
        
        if (existingProject) {
          existingProject.allocatedHours += allocatedHours;
        } else {
          projectAllocations.push({
            projectId: allocation.projectId,
            projectName: project?.name || 'Unknown Project',
            allocatedHours,
            percentage: 0, // Will be calculated below
          });
        }
      }

      // Calculate percentages
      projectAllocations.forEach(project => {
        project.percentage = totalCapacity > 0 ? (project.allocatedHours / totalCapacity) * 100 : 0;
      });

      reports.push({
        teamMemberId: teamMember.id,
        teamMemberName: teamMember.user.name,
        role: teamMember.role,
        totalCapacity,
        allocatedHours: totalAllocated,
        availableHours: Math.max(0, totalCapacity - totalAllocated),
        utilizationRate: totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0,
        projects: projectAllocations.sort((a, b) => b.allocatedHours - a.allocatedHours),
      });
    }

    return reports.sort((a, b) => b.utilizationRate - a.utilizationRate);
  }

  async getWorkloadDistribution(dateRange: DateRange, interval: 'week' | 'month' = 'week'): Promise<WorkloadDistribution[]> {
    const distributions: WorkloadDistribution[] = [];
    const teamMembers = Array.from(this.teamMembers.values()).filter(member => member.isActive);

    const currentDate = new Date(dateRange.startDate);
    while (currentDate <= dateRange.endDate) {
      const periodEnd = new Date(currentDate);
      if (interval === 'week') {
        periodEnd.setDate(periodEnd.getDate() + 6);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0); // Last day of month
      }

      const workingDays = this.getWorkingDays(currentDate, Math.min(periodEnd.getTime(), dateRange.endDate.getTime()));
      let totalCapacity = 0;
      let totalAllocated = 0;

      const memberData = teamMembers.map(member => {
        const memberCapacity = (member.capacity / 5) * workingDays;
        totalCapacity += memberCapacity;

        const memberAllocations = Array.from(this.allocations.values())
          .filter(allocation =>
            allocation.teamMemberId === member.id &&
            allocation.startDate <= periodEnd &&
            allocation.endDate >= currentDate
          );

        let memberAllocated = 0;
        for (const allocation of memberAllocations) {
          const overlapStart = new Date(Math.max(allocation.startDate.getTime(), currentDate.getTime()));
          const overlapEnd = new Date(Math.min(allocation.endDate.getTime(), periodEnd.getTime()));
          const overlapDays = this.getWorkingDays(overlapStart, overlapEnd);
          const allocationDays = this.getWorkingDays(allocation.startDate, allocation.endDate);
          memberAllocated += (allocation.allocatedHours / allocationDays) * overlapDays;
        }

        totalAllocated += memberAllocated;

        return {
          id: member.id,
          name: member.user.name,
          capacity: memberCapacity,
          allocated: memberAllocated,
          utilization: memberCapacity > 0 ? (memberAllocated / memberCapacity) * 100 : 0,
        };
      });

      distributions.push({
        date: new Date(currentDate),
        totalCapacity,
        totalAllocated,
        utilizationRate: totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0,
        teamMembers: memberData.sort((a, b) => b.utilization - a.utilization),
      });

      // Move to next period
      if (interval === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
      }
    }

    return distributions;
  }

  // Project Timeline Management
  async createProjectTimeline(projectId: string, phases: TimelinePhase[], milestones: Milestone[], dependencies: ProjectDependency[]): Promise<{ success: boolean; timeline?: ProjectTimeline; error?: string }> {
    try {
      const startDate = new Date(Math.min(...phases.map(p => p.startDate.getTime())));
      const endDate = new Date(Math.max(...phases.map(p => p.endDate.getTime())));

      const timeline: ProjectTimeline = {
        id: this.generateTimelineId(),
        projectId,
        phases,
        milestones,
        dependencies,
        startDate,
        endDate,
      };

      this.timelines.set(timeline.id, timeline);

      return { success: true, timeline };
    } catch (error) {
      console.error('Error creating project timeline:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project timeline',
      };
    }
  }

  async getProjectTimeline(projectId: string): Promise<ProjectTimeline | null> {
    return Array.from(this.timelines.values()).find(timeline => timeline.projectId === projectId) || null;
  }

  // Private helper methods
  private async recalculateWorkload(teamMemberId: string): Promise<void> {
    const teamMember = this.teamMembers.get(teamMemberId);
    if (!teamMember) return;

    const currentAllocations = Array.from(this.allocations.values())
      .filter(allocation =>
        allocation.teamMemberId === teamMemberId &&
        allocation.startDate <= new Date() &&
        allocation.endDate >= new Date()
      );

    const currentWorkload = currentAllocations.reduce((sum, allocation) => {
      const allocationDays = this.getWorkingDays(allocation.startDate, allocation.endDate);
      const dailyHours = allocation.allocatedHours / allocationDays;
      return sum + dailyHours;
    }, 0);

    teamMember.currentWorkload = currentWorkload;
    this.teamMembers.set(teamMemberId, teamMember);
  }

  private getWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  private initializeMockData(): void {
    // Initialize mock projects
    const mockProjects = [
      { id: 'project1', name: 'E-commerce Platform', status: 'active' },
      { id: 'project2', name: 'Corporate Website', status: 'active' },
      { id: 'project3', name: 'Mobile App', status: 'planning' },
    ];

    mockProjects.forEach(project => this.projects.set(project.id, project));

    // Initialize mock team members
    const mockUsers: User[] = [
      {
        id: 'user1',
        email: 'dev1@softcrown.com',
        name: 'Senior Developer',
        role: 'developer',
        avatar: '/avatars/dev1.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        email: 'designer@softcrown.com',
        name: 'UI/UX Designer',
        role: 'designer',
        avatar: '/avatars/designer.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user3',
        email: 'dev2@softcrown.com',
        name: 'Junior Developer',
        role: 'developer',
        avatar: '/avatars/dev2.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockTeamMembers: TeamMember[] = [
      {
        id: 'user1',
        user: mockUsers[0],
        role: 'Senior Developer',
        department: 'Development',
        hourlyRate: 75,
        capacity: 40, // hours per week
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        availability: [],
        currentWorkload: 0,
        isActive: true,
      },
      {
        id: 'user2',
        user: mockUsers[1],
        role: 'UI/UX Designer',
        department: 'Design',
        hourlyRate: 60,
        capacity: 40,
        skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        availability: [],
        currentWorkload: 0,
        isActive: true,
      },
      {
        id: 'user3',
        user: mockUsers[2],
        role: 'Junior Developer',
        department: 'Development',
        hourlyRate: 45,
        capacity: 40,
        skills: ['React', 'JavaScript', 'CSS', 'Git'],
        availability: [],
        currentWorkload: 0,
        isActive: true,
      },
    ];

    mockTeamMembers.forEach(member => this.teamMembers.set(member.id, member));

    // Initialize mock allocations
    const mockAllocations: ResourceAllocation[] = [
      {
        id: 'alloc1',
        projectId: 'project1',
        teamMemberId: 'user1',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        allocatedHours: 60,
        actualHours: 25,
        role: 'Lead Developer',
        notes: 'Leading the backend development',
      },
      {
        id: 'alloc2',
        projectId: 'project1',
        teamMemberId: 'user2',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        allocatedHours: 40,
        actualHours: 15,
        role: 'UI Designer',
        notes: 'Designing user interface components',
      },
    ];

    mockAllocations.forEach(allocation => this.allocations.set(allocation.id, allocation));

    // Recalculate workloads
    mockTeamMembers.forEach(member => {
      this.recalculateWorkload(member.id);
    });
  }

  private generateAllocationId(): string {
    return `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTimelineId(): string {
    return `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const resourcePlanningService = new ResourcePlanningService();
