import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { apiClient, type BalanceData } from '../services/api';

interface BalanceCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export const BalanceChecker: React.FC<BalanceCheckerProps> = ({ isOpen, onClose, apiKey }) => {
  const [balanceInfo, setBalanceInfo] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('请先在"配置"中设置您的API密钥');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBalanceInfo(null);

    try {
      const data = await apiClient.getBalance();
      setBalanceInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生了一个未知错误');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (isOpen) {
      handleQuery();
    }
  }, [isOpen, handleQuery]);

  if (!isOpen) return null;

  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">额度查询</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-600">加载中...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-bold text-red-700">查询失败</p>
            <p className="text-sm text-red-600 break-all mt-1">{error}</p>
          </div>
        )}

        {balanceInfo && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium">总额度</span>
              <span className="font-bold text-lg text-blue-600">
                ${balanceInfo.totalLimit.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium">已使用</span>
              <span className="font-bold text-lg text-orange-600">
                ${balanceInfo.totalUsage.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-slate-600 font-medium">剩余额度</span>
              <span className="font-bold text-lg text-green-600">
                ${balanceInfo.remaining.toFixed(2)}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">使用率</span>
                <span className="text-sm font-semibold text-slate-700">
                  {balanceInfo.usagePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(
                    balanceInfo.usagePercentage
                  )}`}
                  style={{ width: `${Math.min(balanceInfo.usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleQuery}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
