import React, { useState, useCallback, useEffect } from 'react';
import { Send, Upload, Loader, Sparkles } from 'lucide-react';
import { taskQueue, type TaskRecord } from '../services/taskQueue';
import { storage } from '../services/storage';

// 预设提示词列表
const PRESET_PROMPTS = [
  {
    name: 'Rotoscoping Animation',
    description: 'Rotoscoping animation style (a la Richard Linklater\'s \'A Scanner Darkly\' or \'Undone\'). A scene animated by tracing over live-action footage frame by frame. The result is fluid, lifelike motion combined with a stylized, painterly, or graphic visual layer.'
  },
  {
    name: '90s Skate Video',
    description: '90s skate video aesthetic. Shot on a Sony VX1000 camera with a fisheye lens. The footage of a skateboarder performing a trick is slightly low-resolution, with saturated colors and high contrast. The camera is held low to the ground, capturing the raw energy and sound of the wheels on pavement.'
  },
  {
    name: 'Kitchen Sink Realism',
    description: 'British Kitchen Sink Realism style. A gritty, black and white scene of working-class characters in a cramped, industrial urban setting in Northern England. The cinematography is stark and documentary-like, using natural light. The focus is on the mundane, everyday struggles.'
  },
  {
    name: '8-bit Pixel Art',
    description: '8-bit pixel art animation. A scene rendered in a highly restricted, low-resolution pixel grid with a limited color palette, reminiscent of classic Nintendo (NES) games. The animation is simple, with characters and objects moving in a jerky, frame-by-frame manner.'
  },
  {
    name: 'Busby Berkeley',
    description: 'Busby Berkeley style musical number. An elaborate, kaleidoscopic overhead shot of dozens of dancers moving in perfect, geometric synchronization. The camera cranes and moves to create abstract, mesmerizing patterns. A black and white, art deco spectacle of pure cinematic fantasy.'
  },
  {
    name: 'Stan Brakhage',
    description: 'Experimental film in the style of Stan Brakhage. A non-narrative, abstract sequence created by physically scratching, painting, or collaging directly onto the film strip. The result is a flickering, chaotic, and intensely personal barrage of color, texture, and light.'
  },
  {
    name: 'Travel Video (Sam Kolder)',
    description: 'Cinematic travel video (in the style of Sam Kolder). A dynamic, fast-paced montage of a stunning, exotic location. Features whip pans, smooth gimbal movements, FPV drone shots diving down waterfalls, and speed ramps. The color grading is vibrant.'
  },
  {
    name: 'Tokusatsu (Kaiju)',
    description: 'Japanese Tokusatsu style (e.g., Ultraman, Godzilla). A scene of a giant monster (kaiju) or a costumed hero fighting in a miniature city. The special effects are practical, featuring detailed scale models of buildings that crumble and explode.'
  },
  {
    name: 'Medical Animation',
    description: 'High-end medical animation. A photorealistic 3D visualization of a complex biological process inside the human body. The colors are clean and clinical. The animation is smooth and clear, designed for educational purposes.'
  },
  {
    name: 'Werner Herzog Doc',
    description: 'Werner Herzog style documentary. A long, static shot while Herzog\'s distinct, contemplative voiceover narrates a philosophical or absurd observation about the human condition, nature\'s indifference, or the \'ecstatic truth\'.'
  },
  {
    name: 'Analog Horror',
    description: 'Analog horror aesthetic (e.g., The Mandela Catalogue, Local 58). A video that mimics a piece of found media from the analog era (VHS tape, old TV broadcast). The footage is interrupted by distorted faces, cryptic text, and unsettling audio.'
  },
  {
    name: 'Motion Comic',
    description: 'Motion comic or \'Kirby Krackle\' effect. A scene composed of still comic book panels. The camera pans and zooms across the panels, and individual elements within the panels are given subtle animation and parallax movement.'
  },
  {
    name: 'Olympics Ceremony',
    description: 'Olympics opening ceremony broadcast style. A grand, sweeping, multi-camera shot of a massive, choreographed performance in a stadium. Features thousands of performers, large-scale puppetry, and spectacular pyrotechnics.'
  },
  {
    name: 'Federico Fellini',
    description: 'Federico Fellini style. A surreal, carnivalesque scene blending dreams, memories, and reality. A large, eccentric cast of characters moves through a chaotic, theatrical setting with fluid camera work and tracking shots.'
  },
  {
    name: 'Slow TV',
    description: '\'Slow TV\' aesthetic. A real-time, uninterrupted long take of a mundane but mesmerizing journey (e.g., a 7-hour train ride or a boat sailing up a fjord). There is no narration or dramatic editing. Meditative and immersive.'
  },
  {
    name: 'Apple Think Different',
    description: 'Apple\'s \'Think Different\' commercial style. An elegant, black and white montage of iconic historical figures. Slow, graceful Ken Burns-style moves on archival photos. A sparse, poignant piano score plays under a powerful, inspirational voiceover.'
  },
  {
    name: 'Old Spice Commercial',
    description: 'Surreal, fast-paced commercial style (e.g., Old Spice\'s \'The Man Your Man Could Smell Like\'). A single, long take where a charismatic spokesperson moves seamlessly through rapidly changing, absurd scenarios and locations.'
  },
  {
    name: 'MKBHD Tech Review',
    description: 'A Marques Brownlee (MKBHD) style tech review video. A pristine tech product is showcased with ultra-smooth, robotic camera movements against a minimalist background. Extreme macro shots reveal intricate textures. Crystal clear 8K on a RED camera.'
  },
  {
    name: 'Adam Curtis Doc',
    description: 'An Adam Curtis style documentary montage. A sequence of obscure, grainy, and often unsettling archival footage is juxtaposed to create a new, ironic meaning. A slow, hypnotic electronic track plays. Simple, bold Helvetica text appears on screen.'
  },
  {
    name: 'OK Go Music Video',
    description: 'An OK Go style one-take music video. A single, continuous, and perfectly choreographed shot capturing an incredibly complex sequence of practical effects, Rube Goldberg machines, or synchronized actions.'
  }
];

interface VideoGeneratorProps {
  onTaskCreated: (task: TaskRecord) => void;
  isApiKeySet: boolean;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onTaskCreated, isApiKeySet }) => {
  const [prompt, setPrompt] = useState('');
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
        setPrompt('');
        setImageFile(null);
        setImagePreview(null);
      } catch (error) {
        alert(error instanceof Error ? error.message : '提交任务失败');
      } finally {
        setIsLoading(false);
      }
    },
    [prompt, model, imageFile, isApiKeySet, onTaskCreated]
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">视频生成</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            视频提示词 (Prompt) *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：A cinematic shot of a golden retriever puppy playing in a field of flowers..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 mt-1">详细的提示词能生成更好的效果</p>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              预设提示词
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {PRESET_PROMPTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setPrompt(preset.description)}
                  disabled={isLoading}
                  title={preset.description}
                  className="px-2 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 border border-blue-200 rounded transition truncate"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
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
            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 cursor-pointer transition">
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-slate-600 font-medium">点击选择或拖拽上传</span>
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
          <label className="block text-sm font-semibold text-slate-700 mb-3">视频模型</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition" style={{borderColor: model === 'sora-2' ? '#3b82f6' : '#e2e8f0'}}>
              <input
                type="radio"
                name="model"
                value="sora-2"
                checked={model === 'sora-2'}
                onChange={(e) => setModel(e.target.value as 'sora-2' | 'sora-2-pro')}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <p className="font-semibold text-slate-800">Sora-2</p>
                <p className="text-sm text-slate-500">时长: 15秒 | 价格: ¥0.14</p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition" style={{borderColor: model === 'sora-2-pro' ? '#3b82f6' : '#e2e8f0'}}>
              <input
                type="radio"
                name="model"
                value="sora-2-pro"
                checked={model === 'sora-2-pro'}
                onChange={(e) => setModel(e.target.value as 'sora-2' | 'sora-2-pro')}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <p className="font-semibold text-slate-800">Sora-2 Pro</p>
                <p className="text-sm text-slate-500">时长: 25秒 | 价格: ¥0.21</p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isApiKeySet}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 rounded-lg transition"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              生成视频
            </>
          )}
        </button>
      </form>
    </div>
  );
};
