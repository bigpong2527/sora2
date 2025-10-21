- 改造项目：
自行填写密钥
使用现代化前端
增加任务队列
缓存生成记录和密钥信息在浏览器
自动轮询尚未成功的任务
提供sora-2和sora-2-pro两种选项，时长分别为15秒和25秒
提供密钥额度查询
请确保项目稳定运行

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sora-2 视频生成器</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 600px;
            text-align: center;
        }
        h1 {
            color: #1a73e8;
            margin-bottom: 25px;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #5f6368;
        }
        textarea, input[type="file"], input[type="number"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        textarea:focus, input[type="file"]:focus, input[type="number"]:focus {
            outline: none;
            border-color: #1a73e8;
        }
        textarea {
            resize: vertical;
            min-height: 120px;
        }
        button {
            background-color: #1a73e8;
            color: white;
            padding: 14px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            font-weight: 600;
            transition: background-color 0.3s, transform 0.1s;
            width: 100%;
        }
        button:hover {
            background-color: #185abc;
        }
        button:active {
            transform: scale(0.98);
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .status-area {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: left;
            display: none; /* Initially hidden */
        }
        .status-area p {
            margin: 0 0 10px 0;
            word-wrap: break-word;
        }
        .status-area .label {
            font-weight: 600;
        }
        .progress-bar {
            width: 100%;
            background-color: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
            margin-top: 10px;
        }
        .progress-bar-inner {
            height: 10px;
            width: 0%;
            background-color: #1a73e8;
            transition: width 0.5s;
        }
        .video-container {
            margin-top: 20px;
            display: none; /* Initially hidden */
        }
        video {
            width: 100%;
            max-width: 100%;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .download-link {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background-color: #34a853;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        .download-link:hover {
            background-color: #2c8a42;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Sora-2 视频生成器</h1>
    
    <div class="form-group">
        <label for="prompt">视频提示词 (Prompt)</label>
        <textarea id="prompt" placeholder="例如：A cinematic shot of a golden retriever puppy playing in a field of flowers..."></textarea>
    </div>

    <div class="form-group">
        <label for="imageFile">参考图 (可选)</label>
        <input type="file" id="imageFile" accept="image/png, image/jpeg, image/webp">
    </div>

    <div class="form-group">
        <label for="seconds">视频时长 (秒)</label>
        <input type="number" id="seconds" value="10" min="1" max="25">
    </div>

    <button id="generateBtn">生成视频</button>

    <div id="statusArea" class="status-area">
        <p><span class="label">任务ID:</span> <span id="taskId"></span></p>
        <p><span class="label">状态:</span> <span id="statusText"></span></p>
        <p><span class="label">进度:</span> <span id="progressText"></span></p>
        <div class="progress-bar">
            <div id="progressBarInner" class="progress-bar-inner"></div>
        </div>
    </div>

    <div id="videoContainer" class="video-container">
        <h2>生成结果</h2>
        <video id="resultVideo" controls></video>
        <a id="downloadLink" class="download-link" href="#" download="sora_video.mp4">下载视频</a>
    </div>
</div>

<script>
    // --- 配置 ---
    const API_KEY = "sk-nAxsOc7ZNa37ZsSLiNTW7ARAUx2OKqE5O9oaTn0DFmKx9M9Q"; // ⚠️ 请将这里替换为您的 Tu-Zi API Key
    const API_BASE_URL = "https://api.tu-zi.com/v1";
    const POLLING_INTERVAL = 10000; // 轮询间隔，10秒
    const POLLING_TIMEOUT = 20 * 60 * 1000; // 轮询超时，20分钟

    // --- DOM 元素 ---
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt');
    const imageFileInput = document.getElementById('imageFile');
    const secondsInput = document.getElementById('seconds');
    const statusArea = document.getElementById('statusArea');
    const taskIdSpan = document.getElementById('taskId');
    const statusTextSpan = document.getElementById('statusText');
    const progressTextSpan = document.getElementById('progressText');
    const progressBarInner = document.getElementById('progressBarInner');
    const videoContainer = document.getElementById('videoContainer');
    const resultVideo = document.getElementById('resultVideo');
    const downloadLink = document.getElementById('downloadLink');

    let pollingTimeoutId = null;

    // --- 核心函数 ---

    /**
     * 提交视频生成任务
     */
    async function submitTask() {
        const prompt = promptInput.value.trim();
        const imageFile = imageFileInput.files[0];
        const seconds = secondsInput.value;

        if (!prompt) {
            alert('请输入视频提示词！');
            return;
        }

        setLoadingState(true, '正在提交任务...');

        const formData = new FormData();
        formData.append('model', 'sora-2-pro');
        formData.append('prompt', prompt);
        formData.append('seconds', seconds);
        formData.append('size', '720x1280'); // 默认为竖屏，可根据需要修改
        if (imageFile) {
            formData.append('input_reference', imageFile);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/videos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`任务提交失败 (HTTP ${response.status}): ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            const taskId = result.id;

            if (taskId) {
                console.log('任务提交成功，ID:', taskId);
                localStorage.setItem('soraTaskId', taskId); // 缓存任务ID
                localStorage.setItem('soraTaskStartTime', Date.now()); // 缓存开始时间
                startPolling(taskId);
            } else {
                throw new Error('API响应中未找到任务ID。');
            }

        } catch (error) {
            console.error('提交任务时出错:', error);
            alert(`提交任务时出错: ${error.message}`);
            setLoadingState(false);
        }
    }

    /**
     * 开始轮询任务状态
     * @param {string} taskId 任务ID
     */
    function startPolling(taskId) {
        console.log(`开始轮询任务: ${taskId}`);
        statusArea.style.display = 'block';
        videoContainer.style.display = 'none';
        taskIdSpan.textContent = taskId;
        
        // 清除可能存在的旧的超时计时器
        if (pollingTimeoutId) {
            clearTimeout(pollingTimeoutId);
        }

        const poll = async () => {
            const startTime = parseInt(localStorage.getItem('soraTaskStartTime'), 10);
            if (Date.now() - startTime > POLLING_TIMEOUT) {
                console.error('轮询超时！');
                updateStatus('超时', '任务在20分钟内未完成。');
                setLoadingState(false);
                clearTask();
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/videos/${taskId}`, {
                    headers: { 'Authorization': `Bearer ${API_KEY}` }
                });

                if (!response.ok) {
                    // 如果任务ID失效（例如服务器清理了），则停止轮询
                    if (response.status === 404) {
                        throw new Error('任务未找到 (404)，可能已过期。');
                    }
                    throw new Error(`查询失败 (HTTP ${response.status})`);
                }

                const data = await response.json();
                updateStatus(data.status, `${data.progress}%`);

                if (data.status === 'completed') {
                    console.log('任务完成!', data);
                    displayVideo(data.video_url);
                    setLoadingState(false);
                    clearTask();
                } else if (data.status === 'failed') {
                    console.error('任务失败:', data);
                    alert('视频生成失败，请检查API后台或提示词。');
                    setLoadingState(false);
                    clearTask();
                } else {
                    // 如果任务未完成，继续轮询
                    pollingTimeoutId = setTimeout(poll, POLLING_INTERVAL);
                }

            } catch (error) {
                console.error('轮询时出错:', error);
                updateStatus('错误', error.message);
                setLoadingState(false);
                clearTask(); // 发生错误时清除任务，避免无限重试
            }
        };

        poll(); // 立即开始第一次轮询
    }

    /**
     * 更新状态显示
     * @param {string} status 状态文本
     * @param {string} progress 进度文本
     */
    function updateStatus(status, progress) {
        statusTextSpan.textContent = status;
        progressTextSpan.textContent = progress;
        progressBarInner.style.width = progress;
    }

    /**
     * 显示生成的视频
     * @param {string} videoUrl 视频URL
     */
    function displayVideo(videoUrl) {
        statusArea.style.display = 'none';
        videoContainer.style.display = 'block';
        resultVideo.src = videoUrl;
        downloadLink.href = videoUrl;
    }

    /**
     * 设置加载状态（禁用/启用按钮）
     * @param {boolean} isLoading 是否正在加载
     * @param {string} [text='生成视频'] 按钮文本
     */
    function setLoadingState(isLoading, text = '生成视频') {
        generateBtn.disabled = isLoading;
        generateBtn.textContent = isLoading ? text : '生成视频';
    }

    /**
     * 从 localStorage 清除任务信息
     */
    function clearTask() {
        localStorage.removeItem('soraTaskId');
        localStorage.removeItem('soraTaskStartTime');
        if (pollingTimeoutId) {
            clearTimeout(pollingTimeoutId);
            pollingTimeoutId = null;
        }
    }

    // --- 事件监听和初始化 ---

    generateBtn.addEventListener('click', submitTask);

    // 页面加载时，检查是否有未完成的任务
    window.addEventListener('load', () => {
        const cachedTaskId = localStorage.getItem('soraTaskId');
        if (cachedTaskId) {
            console.log('发现缓存的任务ID:', cachedTaskId);
            alert(`检测到上次未完成的任务 ${cachedTaskId}，将继续轮询。`);
            setLoadingState(true, '正在恢复任务...');
            startPolling(cachedTaskId);
        }
    });

</script>
</body>
</html>


额度查询：
```
// /src/components/BalanceChecker.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface BalanceInfo {
  totalLimit: number;
  totalUsage: number;
  remaining: number;
  usagePercentage: number;
}

async function fetchBalanceInfo(apiKey: string): Promise<BalanceInfo> {
  const headers = { "Authorization": `Bearer ${apiKey}` };
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const subscriptionUrl = "https://api.tu-zi.com/v1/dashboard/billing/subscription";
  const usageUrl = `https://api.tu-zi.com/v1/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`;

  const [subscriptionResponse, usageResponse] = await Promise.all([
    fetch(subscriptionUrl, { headers }),
    fetch(usageUrl, { headers })
  ]);

  if (!subscriptionResponse.ok) {
    const errorText = await subscriptionResponse.text();
    throw new Error(`获取总额度失败: ${subscriptionResponse.status} - ${errorText || '未知错误'}`);
  }
  if (!usageResponse.ok) {
    const errorText = await usageResponse.text();
    throw new Error(`获取已使用额度失败: ${usageResponse.status} - ${errorText || '未知错误'}`);
  }

  const subscriptionData = await subscriptionResponse.json();
  const usageData = await usageResponse.json();

  const totalLimit = subscriptionData.hard_limit_usd || 0;
  const totalUsage = (usageData.total_usage || 0) / 100;
  const remaining = totalLimit - totalUsage;
  const usagePercentage = totalLimit > 0 ? (totalUsage / totalLimit * 100) : 0;

  return { totalLimit, totalUsage, remaining, usagePercentage };
}

interface BalanceCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export const BalanceChecker: React.FC<BalanceCheckerProps> = ({ isOpen, onClose, apiKey }) => {
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('请先在“配置”中设置您的密钥。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setBalanceInfo(null);
    try {
      const data = await fetchBalanceInfo(apiKey);
      setBalanceInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生了一个未知错误。');
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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">额度查询 (近30天)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <p className="font-bold">查询失败</p>
            <p className="text-sm break-all">{error}</p>
          </div>
        )}

        {balanceInfo && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">总额度</span>
              {/* --- MODIFICATION START 1 of 3 --- */}
              <span className="font-bold text-lg text-blue-600">${(balanceInfo.totalLimit * 2).toFixed(2)}</span>
              {/* --- MODIFICATION END 1 of 3 --- */}
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">已使用</span>
              {/* --- MODIFICATION START 2 of 3 --- */}
              <span className="font-bold text-lg text-orange-600">${(balanceInfo.totalUsage * 2).toFixed(2)}</span>
              {/* --- MODIFICATION END 2 of 3 --- */}
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">剩余额度</span>
              {/* --- MODIFICATION START 3 of 3 --- */}
              <span className="font-bold text-lg text-green-600">${(balanceInfo.remaining * 2).toFixed(2)}</span>
              {/* --- MODIFICATION END 3 of 3 --- */}
            </div>
            <div className="mt-2">
              <div className="w-full bg-slate-200 rounded-full h-6">
                <div
                  className={`h-6 rounded-full text-white text-xs flex items-center justify-center ${getProgressBarColor(balanceInfo.usagePercentage)}`}
                  style={{ width: `${Math.min(balanceInfo.usagePercentage, 100).toFixed(2)}%` }}
                >
                  {balanceInfo.usagePercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleQuery}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```