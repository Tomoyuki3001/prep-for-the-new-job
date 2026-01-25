export interface AISuggestedTask {
    title: string;
    priority: 'high' | 'medium' | 'low';
    subtasks: string[];
    estimatedMinutes: number;
}