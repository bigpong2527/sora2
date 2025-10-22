import React from 'react';
import { Sparkles } from 'lucide-react';

export interface PresetPrompt {
  name: string;
  description: string;
}

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    name: '线条动画',
    description: 'Rotoscoping animation style (a la Richard Linklater\'s \'A Scanner Darkly\' or \'Undone\'). A scene animated by tracing over live-action footage frame by frame. The result is fluid, lifelike motion combined with a stylized, painterly, or graphic visual layer.'
  },
  {
    name: '90年代滑板',
    description: '90s skate video aesthetic. Shot on a Sony VX1000 camera with a fisheye lens. The footage of a skateboarder performing a trick is slightly low-resolution, with saturated colors and high contrast. The camera is held low to the ground, capturing the raw energy and sound of the wheels on pavement.'
  },
  {
    name: '英国现实主义',
    description: 'British Kitchen Sink Realism style. A gritty, black and white scene of working-class characters in a cramped, industrial urban setting in Northern England. The cinematography is stark and documentary-like, using natural light. The focus is on the mundane, everyday struggles.'
  },
  {
    name: '像素艺术',
    description: '8-bit pixel art animation. A scene rendered in a highly restricted, low-resolution pixel grid with a limited color palette, reminiscent of classic Nintendo (NES) games. The animation is simple, with characters and objects moving in a jerky, frame-by-frame manner.'
  },
  {
    name: '百年舞蹈',
    description: 'Busby Berkeley style musical number. An elaborate, kaleidoscopic overhead shot of dozens of dancers moving in perfect, geometric synchronization. The camera cranes and moves to create abstract, mesmerizing patterns. A black and white, art deco spectacle of pure cinematic fantasy.'
  },
  {
    name: '实验电影',
    description: 'Experimental film in the style of Stan Brakhage. A non-narrative, abstract sequence created by physically scratching, painting, or collaging directly onto the film strip. The result is a flickering, chaotic, and intensely personal barrage of color, texture, and light.'
  },
  {
    name: '旅游视频',
    description: 'Cinematic travel video (in the style of Sam Kolder). A dynamic, fast-paced montage of a stunning, exotic location. Features whip pans, smooth gimbal movements, FPV drone shots diving down waterfalls, and speed ramps. The color grading is vibrant.'
  },
  {
    name: '怪兽特摄',
    description: 'Japanese Tokusatsu style (e.g., Ultraman, Godzilla). A scene of a giant monster (kaiju) or a costumed hero fighting in a miniature city. The special effects are practical, featuring detailed scale models of buildings that crumble and explode.'
  },
  {
    name: '医学动画',
    description: 'High-end medical animation. A photorealistic 3D visualization of a complex biological process inside the human body. The colors are clean and clinical. The animation is smooth and clear, designed for educational purposes.'
  },
  {
    name: '赫尔佐格纪录',
    description: 'Werner Herzog style documentary. A long, static shot while Herzog\'s distinct, contemplative voiceover narrates a philosophical or absurd observation about the human condition, nature\'s indifference, or the \'ecstatic truth\'.'
  },
  {
    name: '模拟恐怖',
    description: 'Analog horror aesthetic (e.g., The Mandela Catalogue, Local 58). A video that mimics a piece of found media from the analog era (VHS tape, old TV broadcast). The footage is interrupted by distorted faces, cryptic text, and unsettling audio.'
  },
  {
    name: '动漫连环',
    description: 'Motion comic or \'Kirby Krackle\' effect. A scene composed of still comic book panels. The camera pans and zooms across the panels, and individual elements within the panels are given subtle animation and parallax movement.'
  },
  {
    name: '奥运开幕',
    description: 'Olympics opening ceremony broadcast style. A grand, sweeping, multi-camera shot of a massive, choreographed performance in a stadium. Features thousands of performers, large-scale puppetry, and spectacular pyrotechnics.'
  },
  {
    name: '费里尼风格',
    description: 'Federico Fellini style. A surreal, carnivalesque scene blending dreams, memories, and reality. A large, eccentric cast of characters moves through a chaotic, theatrical setting with fluid camera work and tracking shots.'
  },
  {
    name: '慢电视',
    description: '\'Slow TV\' aesthetic. A real-time, uninterrupted long take of a mundane but mesmerizing journey (e.g., a 7-hour train ride or a boat sailing up a fjord). There is no narration or dramatic editing. Meditative and immersive.'
  },
  {
    name: '苹果广告',
    description: 'Apple\'s \'Think Different\' commercial style. An elegant, black and white montage of iconic historical figures. Slow, graceful Ken Burns-style moves on archival photos. A sparse, poignant piano score plays under a powerful, inspirational voiceover.'
  },
  {
    name: '古龙香水',
    description: 'Surreal, fast-paced commercial style (e.g., Old Spice\'s \'The Man Your Man Could Smell Like\'). A single, long take where a charismatic spokesperson moves seamlessly through rapidly changing, absurd scenarios and locations.'
  },
  {
    name: '科技评测',
    description: 'A Marques Brownlee (MKBHD) style tech review video. A pristine tech product is showcased with ultra-smooth, robotic camera movements against a minimalist background. Extreme macro shots reveal intricate textures. Crystal clear 8K on a RED camera.'
  },
  {
    name: '纪录蒙太奇',
    description: 'An Adam Curtis style documentary montage. A sequence of obscure, grainy, and often unsettling archival footage is juxtaposed to create a new, ironic meaning. A slow, hypnotic electronic track plays. Simple, bold Helvetica text appears on screen.'
  },
  {
    name: '音乐一镜',
    description: 'An OK Go style one-take music video. A single, continuous, and perfectly choreographed shot capturing an incredibly complex sequence of practical effects, Rube Goldberg machines, or synchronized actions.'
  }
];

interface PresetPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

export const PresetPrompts: React.FC<PresetPromptsProps> = ({
  onSelectPrompt,
  isLoading = false,
  isMobile = false
}) => {
  // Mobile: Horizontal scrollable layout
  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <h3 className="font-bold text-slate-800 text-xs">预设提示词</h3>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onSelectPrompt(preset.description)}
              disabled={isLoading}
              title={preset.description}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 active:from-blue-200 active:to-blue-300 disabled:opacity-50 disabled:cursor-not-allowed text-blue-800 border border-blue-200 rounded-full transition whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Vertical scrollable sidebar
  return (
    <div className="bg-white rounded-lg shadow-md p-3 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <h3 className="font-bold text-slate-800 text-sm">预设提示词</h3>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelectPrompt(preset.description)}
            disabled={isLoading}
            title={preset.description}
            className="w-full text-left px-2 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-blue-800 border border-blue-200 rounded transition truncate"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};
