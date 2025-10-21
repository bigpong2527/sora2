interface TaskRecord {
  id: string;
  prompt: string;
  model: 'sora-2' | 'sora-2-pro';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEYS = {
  API_KEY: 'sora_api_key',
  TASKS: 'sora_tasks',
};

class StorageManager {
  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  }

  setApiKey(key: string): void {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    }
  }

  removeApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }

  getTasks(): TaskRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addTask(task: Omit<TaskRecord, 'createdAt' | 'updatedAt'>): TaskRecord {
    const now = Date.now();
    const record: TaskRecord = {
      ...task,
      createdAt: now,
      updatedAt: now,
    };

    const tasks = this.getTasks();
    tasks.unshift(record);

    // Keep only last 100 tasks
    if (tasks.length > 100) {
      tasks.pop();
    }

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return record;
  }

  updateTask(taskId: string, updates: Partial<TaskRecord>): TaskRecord | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return null;
    }

    Object.assign(task, updates, { updatedAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return task;
  }

  getTask(taskId: string): TaskRecord | null {
    const tasks = this.getTasks();
    return tasks.find((t) => t.id === taskId) || null;
  }

  getPendingTasks(): TaskRecord[] {
    const tasks = this.getTasks();
    return tasks.filter((t) => t.status === 'pending' || t.status === 'processing');
  }

  clearCompletedTasks(): void {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.status !== 'completed');
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  }
}

export const storage = new StorageManager();
export type { TaskRecord };
