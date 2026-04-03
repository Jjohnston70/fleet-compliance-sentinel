import { ActionItem } from '../data/schema.js';

export interface EmailData {
  thread_id: string;
  subject: string;
  sender: string;
  body: string;
  received_at: Date;
}

export interface VIPConfig {
  vip_senders?: string[];
}

export class ActionItemExtractor {
  private urgentKeywords = [
    'urgent',
    'asap',
    'action required',
    'deadline',
    'critical',
    'immediate',
    'attention needed',
    'please review',
  ];

  constructor(private vipConfig?: VIPConfig) {}

  /**
   * Extract action items from email data
   */
  extractActionItems(email: EmailData, digestId: string): ActionItem | null {
    const priority = this.calculatePriority(email);

    // Only create action items for medium priority or higher
    if (priority === 'low') return null;

    const actionItem: ActionItem = {
      id: crypto.randomUUID?.() ?? this.generateId(),
      digest_id: digestId,
      email_thread_id: email.thread_id,
      subject: email.subject,
      sender: email.sender,
      description: this.extractDescription(email),
      priority,
      due_date: this.extractDueDate(email),
      status: 'pending',
      created_at: new Date(),
    };

    return actionItem;
  }

  /**
   * Calculate priority based on VIP status, keywords, and other signals
   */
  private calculatePriority(email: EmailData): 'critical' | 'high' | 'medium' | 'low' {
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';

    // VIP sender
    const isVIP = this.vipConfig?.vip_senders?.includes(email.sender) ?? false;

    // Check for urgent keywords in subject and body
    const combinedText = `${email.subject} ${email.body}`.toLowerCase();
    const hasUrgentKeyword = this.urgentKeywords.some((keyword) => combinedText.includes(keyword));

    // Age factor - older emails with action items become more urgent
    const ageHours = (new Date().getTime() - email.received_at.getTime()) / (1000 * 60 * 60);
    const isOld = ageHours > 24;

    if (isVIP && hasUrgentKeyword) {
      priority = 'critical';
    } else if (isVIP || (hasUrgentKeyword && isOld)) {
      priority = 'high';
    } else if (hasUrgentKeyword || isOld) {
      priority = 'medium';
    }

    return priority;
  }

  /**
   * Extract a description from email subject/body
   */
  private extractDescription(email: EmailData): string {
    const subject = email.subject.substring(0, 100);
    const bodyLines = email.body.split('\n').slice(0, 3).join(' ').substring(0, 200);
    return `${subject} - ${bodyLines}`.trim();
  }

  /**
   * Try to extract a due date from email content
   */
  private extractDueDate(email: EmailData): Date | undefined {
    const datePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|tomorrow|next\s+\w+day|in\s+\d+\s+days)/gi;
    const matches = email.body.match(datePattern);

    if (!matches || matches.length === 0) return undefined;

    const dateStr = matches[0].toLowerCase();

    if (dateStr === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    if (dateStr.includes('next')) {
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.findIndex((day) => dateStr.includes(day));
      if (targetDay !== -1) {
        const nextDate = new Date();
        const currentDay = nextDate.getDay();
        const daysAhead = targetDay - currentDay;
        nextDate.setDate(nextDate.getDate() + (daysAhead <= 0 ? daysAhead + 7 : daysAhead));
        return nextDate;
      }
    }

    if (dateStr.includes('in')) {
      const dayMatch = dateStr.match(/in\s+(\d+)\s+days/);
      if (dayMatch) {
        const daysOffset = parseInt(dayMatch[1], 10);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysOffset);
        return dueDate;
      }
    }

    // Try to parse as a date
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      // Ignore parse errors
    }

    return undefined;
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
