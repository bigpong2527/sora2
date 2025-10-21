import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { type TaskRecord } from '../services/taskQueue';

interface TaskListProps {
  tasks: TaskRecord[];
}

const getStatusColor = (status: TaskRecord['status']): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 border-green-200';
    case 'failed':
      return 'bg-red-50 border-red-200';
    case 'processing':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-yellow-50 border-yellow-200';
  }
};

const getStatusIcon = (status: TaskRecord['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'failed':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'processing':
      return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
    default:
      return <Loader className="w-5 h-5 text-yellow-600 animate-spin" />;
  }
};

const getStatusLabel = (status: TaskRecord['status']): string => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'failed':
      return '已失败';
    case 'processing':
      return '处理中';
    default:
      return '待处理';
  }
};

const TaskItem: React.FC<{ task: TaskRecord }> = ({ task }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div
      className={`border rounded-lg p-4 transition ${getStatusColor(task.status)}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <span className="font-semibold text-slate-800">{getStatusLabel(task.status)}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-medium bg-white px-2 py-1 rounded">
            {task.model === 'sora-2' ? '15秒' : '25秒'}
          </span>
        </div>
      </div>

      <p className="text-slate-700 text-sm mb-3 line-clamp-2">{task.prompt}</p>

      <div className="space-y-2 text-xs text-slate-600 mb-3">
        <div className="flex items-center justify-between">
          <span>任务ID: {task.id.substring(0, 12)}...</span>
          <button
            onClick={handleCopyId}
            className="text-blue-600 hover:text-blue-800 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-xs text-slate-500">创建: {formatDate(task.createdAt)}</div>
      </div>

      {task.progress > 0 && task.status !== 'completed' && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-600">进度</span>
            <span className="text-xs font-bold text-slate-700">{task.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(task.progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {task.error && (
        <div className="mb-3 p-2 bg-red-100 rounded text-xs text-red-700">
          {task.error}
        </div>
      )}

      {task.videoUrl && task.status === 'completed' && (
        <div className="space-y-2">
          <video
            src={task.videoUrl}
            controls
            className="w-full rounded-lg border border-slate-300 max-h-48"
          />
          <a
            href={task.videoUrl}
            download={`sora-video-${task.id.substring(0, 8)}.mp4`}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            下载视频
          </a>
        </div>
      )}
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 mb-4">任务历史 ({tasks.length})</h2>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p className="text-sm">暂无任务</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};
