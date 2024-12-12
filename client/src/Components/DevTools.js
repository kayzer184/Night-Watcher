// DevTools.js
import Stats from 'stats.js';
import * as dat from 'lil-gui';

const createDevTools = () => {
  // Инициализация Stats.js (для FPS и производительности)
  const stats = new Stats();
  // Инициализация lil-gui (для создания интерфейса с параметрами)
  const gui = new dat.GUI({ closeFolders: true });

  // Возвращаем объекты, чтобы их можно было использовать в главном файле
  return { stats, gui };
};

export default createDevTools;
