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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-2 sm:py-4 px-2 sm:px-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Sora-2 视频生成器
            </h1>
            <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowBalanceModal(true)}
                disabled={!apiKey}
                className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition text-xs sm:text-sm"
              >
                <Wallet className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="hidden sm:inline">额度</span>
              </button>
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-xs sm:text-sm"
              >
                <Settings className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="hidden sm:inline">配置</span>
              </button>
            </div>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm">
            使用最新的Sora-2模型生成高质量视频
            {apiKey && ' • API密钥已设置'}
          </p>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid gap-2 sm:gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-5" style={{ gridTemplateColumns: 'auto' }}>
          {/* Left: Preset Prompts (隐藏在移动端，显示在md及以上) */}
          <div className="hidden md:block md:col-span-1 h-full">
            <PresetPrompts
              onSelectPrompt={setPrompt}
              isLoading={isLoading}
            />
          </div>

          {/* Middle: Video Generator (移动端占满，桌面端占中间) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <VideoGenerator
              onTaskCreated={handleTaskCreated}
              isApiKeySet={!!apiKey}
              prompt={prompt}
              onPromptChange={setPrompt}
            />
          </div>

          {/* Right: Task List (移动端隐藏，桌面端显示) */}
          <div className="hidden md:block md:col-span-1">
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 text-center h-full flex items-center justify-center">
                <div className="text-slate-400">
                  <p className="text-sm font-semibold mb-1">暂无任务</p>
                  <p className="text-xs">生成视频后会显示在这里</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Task List (仅在移动端显示) */}
          <div className="col-span-1 md:hidden">
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-3 text-center flex items-center justify-center min-h-48">
                <div className="text-slate-400">
                  <p className="text-xs font-semibold mb-0.5">暂无任务</p>
                  <p className="text-xs">生成视频后会显示在这里</p>
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
