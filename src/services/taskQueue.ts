import { storage, type TaskRecord } from './storage';
import { apiClient } from './api';

const POLLING_INTERVAL = 10000; // 10 seconds
const POLLING_TIMEOUT = 20 * 60 * 1000; // 20 minutes

type TaskStatusCallback = (task: TaskRecord) => void;

class TaskQueueManager {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private pollingStartTimes: Map<string, number> = new Map();
  private statusCallbacks: Set<TaskStatusCallback> = new Set();

  subscribeToTaskStatus(callback: TaskStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  private notifySubscribers(task: TaskRecord): void {
    this.statusCallbacks.forEach((callback) => callback(task));
  }

  async submitTask(
    prompt: string,
    model: 'sora-2' | 'sora-2-pro',
    imageFile?: File
  ): Promise<TaskRecord> {
    try {
      const taskId = await apiClient.submitVideoGenerationTask(prompt, model, imageFile);

      const task = storage.addTask({
        id: taskId,
        prompt,
        model,
        status: 'pending',
        progress: 0,
      });

      this.startPolling(taskId);
      this.notifySubscribers(task);

      return task;
    } catch (error) {
      throw error;
    }
  }

  private startPolling(taskId: string): void {
    if (this.pollingIntervals.has(taskId)) {
      return;
    }

    this.pollingStartTimes.set(taskId, Date.now());

    const poll = async () => {
      try {
        const startTime = this.pollingStartTimes.get(taskId);
        if (!startTime || Date.now() - startTime > POLLING_TIMEOUT) {
          storage.updateTask(taskId, {
            status: 'failed',
            error: '任务轮询超时（20分钟）',
          });
          this.stopPolling(taskId);
          const task = storage.getTask(taskId);
          if (task) {
            this.notifySubscribers(task);
          }
          return;
        }

        const status = await apiClient.getTaskStatus(taskId);
        let localStatus: TaskRecord['status'] = 'processing';

        if (status.status === 'completed') {
          localStatus = 'completed';
        } else if (status.status === 'failed') {
          localStatus = 'failed';
        }

        const task = storage.updateTask(taskId, {
          status: localStatus,
          progress: status.progress || 0,
          videoUrl: status.video_url,
          error: status.error,
        });

        if (task) {
          this.notifySubscribers(task);
        }

        if (localStatus === 'completed' || localStatus === 'failed') {
          this.stopPolling(taskId);
        } else {
          const intervalId = setTimeout(poll, POLLING_INTERVAL);
          this.pollingIntervals.set(taskId, intervalId);
        }
      } catch (error) {
        console.error(`轮询任务 ${taskId} 时出错:`, error);

        const task = storage.updateTask(taskId, {
          status: 'failed',
          error: error instanceof Error ? error.message : '轮询失败',
        });

        if (task) {
          this.notifySubscribers(task);
        }

        this.stopPolling(taskId);
      }
    };

    poll();
  }

  private stopPolling(taskId: string): void {
    const intervalId = this.pollingIntervals.get(taskId);
    if (intervalId) {
      clearTimeout(intervalId);
      this.pollingIntervals.delete(taskId);
    }
    this.pollingStartTimes.delete(taskId);
  }

  resumeUnfinishedTasks(): void {
    const pendingTasks = storage.getPendingTasks();
    pendingTasks.forEach((task) => {
      this.startPolling(task.id);
    });
  }

  getAllTasks(): TaskRecord[] {
    return storage.getTasks();
  }

  getTask(taskId: string): TaskRecord | null {
    return storage.getTask(taskId);
  }

  stopAllPolling(): void {
    this.pollingIntervals.forEach((intervalId) => clearTimeout(intervalId));
    this.pollingIntervals.clear();
    this.pollingStartTimes.clear();
  }
}

export const taskQueue = new TaskQueueManager();
export type { TaskRecord };
