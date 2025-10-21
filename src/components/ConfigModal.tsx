import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { storage } from '../services/storage';
import { apiClient } from '../services/api';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (key: string) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(storage.getApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('请输入有效的API密钥');
      return;
    }

    storage.setApiKey(apiKey);
    apiClient.setApiKey(apiKey);
    onApiKeyChange(apiKey);
    setSaved(true);

    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 1000);
  };

  const handleClear = () => {
    if (confirm('确定要删除保存的密钥吗？')) {
      setApiKey('');
      storage.removeApiKey();
      setSaved(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">API配置</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tu-Zi API密钥
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxx..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              从{' '}
              <a
                href="https://dashboard.tu-zi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Tu-Zi Dashboard
              </a>{' '}
              获取您的API密钥
            </p>
          </div>

          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
              ✓ 密钥已保存
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={handleClear}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition"
            >
              清除
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
