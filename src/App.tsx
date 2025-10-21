import React, { useState, useEffect } from 'react';
import { Settings, Wallet } from 'lucide-react';
import { ConfigModal } from './components/ConfigModal';
import { BalanceChecker } from './components/BalanceChecker';
import { VideoGenerator } from './components/VideoGenerator';
import { TaskList } from './components/TaskList';
import { PresetPrompts } from './components/PresetPrompts';
import { storage } from './services/storage';
import { apiClient } from './services/api';
import { taskQueue, type TaskRecord } from './services/taskQueue';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [prompt, setPrompt] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const savedApiKey = storage.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
      apiClient.setApiKey(savedApiKey);
    }

    // Restore unfinished tasks
    taskQueue.resumeUnfinishedTasks();
    setTasks(taskQueue.getAllTasks());

    // Subscribe to task updates
    const unsubscribe = taskQueue.subscribeToTaskStatus(() => {
      setTasks(taskQueue.getAllTasks());
    });

    return () => {
      unsubscribe();
      taskQueue.stopAllPolling();
    };
  }, []);

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
  };

  const handleTaskCreated = (task: TaskRecord) => {
    setTasks(taskQueue.getAllTasks());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-3xl font-bold text-slate-900">
              Sora-2 视频生成器
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBalanceModal(true)}
                disabled={!apiKey}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition text-sm"
              >
                <Wallet className="w-4 h-4" />
                额度
              </button>
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
              >
                <Settings className="w-4 h-4" />
                配置
              </button>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            使用最新的Sora-2模型生成高质量视频
            {apiKey && ' • API密钥已设置'}
          </p>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '180px 1fr 240px' }}>
          {/* Left: Preset Prompts (占 200px) */}
          <div className="h-full">
            <PresetPrompts
              onSelectPrompt={setPrompt}
              isLoading={isLoading}
            />
          </div>

          {/* Middle: Video Generator (主要区域) */}
          <div>
            <VideoGenerator
              onTaskCreated={handleTaskCreated}
              isApiKeySet={!!apiKey}
              prompt={prompt}
              onPromptChange={setPrompt}
            />
          </div>

          {/* Right: Task List (占 260px) */}
          <div>
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center h-full flex items-center justify-center">
                <div className="text-slate-400">
                  <p className="text-lg font-semibold mb-2">暂无任务</p>
                  <p className="text-sm">生成视频后会显示在这里</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onApiKeyChange={handleApiKeyChange}
      />

      <BalanceChecker
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        apiKey={apiKey}
      />
    </div>
  );
}

export default App;
