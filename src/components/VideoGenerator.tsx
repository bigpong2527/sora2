import React, { useState, useCallback, useEffect } from 'react';
import { Send, Upload, Loader } from 'lucide-react';
import { taskQueue, type TaskRecord } from '../services/taskQueue';
import { storage } from '../services/storage';

interface VideoGeneratorProps {
  onTaskCreated: (task: TaskRecord) => void;
  isApiKeySet: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onTaskCreated, isApiKeySet, prompt, onPromptChange }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [model, setModel] = useState<'sora-2' | 'sora-2-pro'>('sora-2-pro');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isApiKeySet) {
        alert('请先设置API密钥');
        return;
      }

      if (!prompt.trim()) {
        alert('请输入视频提示词');
        return;
      }

      setIsLoading(true);

      try {
        const task = await taskQueue.submitTask(prompt, model, imageFile || undefined);
        onTaskCreated(task);
        onPromptChange('');
        setImageFile(null);
        setImagePreview(null);
      } catch (error) {
        alert(error instanceof Error ? error.message : '提交任务失败');
      } finally {
        setIsLoading(false);
      }
    },
    [prompt, model, imageFile, isApiKeySet, onTaskCreated, onPromptChange]
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">视频生成</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            视频提示词 (Prompt) *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="例如：A cinematic shot of a golden retriever puppy playing in a field of flowers..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 mt-1">详细的提示词能生成更好的效果</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">参考图 (可选)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover border border-slate-300"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-full px-3 py-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 cursor-pointer transition">
              <div className="text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-600 font-medium text-sm">点击选择或拖拽上传</span>
              </div>
              <input
                type="file"
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">视频模型</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: model === 'sora-2' ? '#3b82f6' : '#e2e8f0'}}>
              <input
                type="radio"
                name="model"
                value="sora-2"
                checked={model === 'sora-2'}
                onChange={(e) => setModel(e.target.value as 'sora-2' | 'sora-2-pro')}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <div className="ml-2">
                <p className="font-semibold text-slate-800 text-sm">Sora-2</p>
                <p className="text-xs text-slate-500">时长: 15秒 | 价格: ¥0.14</p>
              </div>
            </label>

            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: model === 'sora-2-pro' ? '#3b82f6' : '#e2e8f0'}}>
              <input
                type="radio"
                name="model"
                value="sora-2-pro"
                checked={model === 'sora-2-pro'}
                onChange={(e) => setModel(e.target.value as 'sora-2' | 'sora-2-pro')}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <div className="ml-2">
                <p className="font-semibold text-slate-800 text-sm">Sora-2 Pro</p>
                <p className="text-xs text-slate-500">时长: 25秒 | 价格: ¥2.1</p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isApiKeySet}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2 rounded-lg transition text-sm"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              生成视频
            </>
          )}
        </button>
      </form>
    </div>
  );
};
