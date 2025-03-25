document.addEventListener('DOMContentLoaded', function () {
  // ======================================
  // SECCIÓN DE RELOJ Y ANIMACIONES ESPACIALES
  // ======================================

  // Función para actualizar el reloj en tiempo real
  function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    document.querySelector('.time-display').textContent = timeString;
  }

  // Iniciar el reloj
  setInterval(updateTime, 1000);
  updateTime();

  // Crear una estrella fugaz
  function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Configuración aleatoria de posición y tamaño
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * 50;
    const size = 2 + Math.random() * 3;
    const duration = 1 + Math.random() * 2;
    const brightness = 0.7 + Math.random() * 0.3;

    star.style.cssText = `
      left: ${startX}px;
      top: ${startY}px;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${duration}s;
      opacity: ${brightness};
    `;

    document.body.appendChild(star);

    // Eliminar después de la animación
    setTimeout(() => {
      star.remove();
    }, duration * 1000);
  }

  // Crear estrellas estáticas de fondo
  function createStaticStars(count) {
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'static-star';

      const size = Math.random() * 1.5;
      const opacity = 0.3 + Math.random() * 0.7;
      const delay = Math.random() * 5;
      const twinkleDuration = 3 + Math.random() * 4;

      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px white;
        opacity: ${opacity};
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: twinkle ${twinkleDuration}s ease-in-out ${delay}s infinite alternate;
      `;

      document.body.appendChild(star);
    }
  }

  // Inicializar animaciones
  setInterval(createShootingStar, 30000); // Cada 30 segundos
  createShootingStar(); // Una estrella al inicio
  createStaticStars(150); // 150 estrellas estáticas

  // ======================================
  // SECCIÓN DE GESTIÓN DE NOTAS
  // ======================================

  const NotesManager = {
    notepad: document.querySelector('.notepad'),
    saveTimeout: null,
    lastSave: null,

    init() {
      this.setupEventListeners();
      this.loadDailyNotes();
      this.setupAutoSave();
    },

    setupEventListeners() {
      // Guardado con debounce al escribir
      this.notepad.addEventListener('input', () => {
        this.handleInput();
      });

      // Guardado al perder foco
      this.notepad.addEventListener('blur', () => {
        this.saveDailyNotes();
      });

      // Atajo Ctrl+S para guardar
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          this.saveDailyNotes(true);
        }
      });

      // Mostrar estadísticas al hacer hover en el time-display
      document
        .querySelector('.time-display')
        .addEventListener('mouseenter', () => {
          this.showStats();
        });
    },

    setupAutoSave() {
      // Guardado automático cada 30 segundos si hay cambios
      setInterval(() => {
        if (this.lastSave && new Date() - this.lastSave > 30000) {
          this.saveDailyNotes();
        }
      }, 30000);
    },

    handleInput() {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        this.saveDailyNotes();
      }, 1500);
    },

    getCurrentDate() {
      return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    },

    getAllNotes() {
      try {
        return JSON.parse(localStorage.getItem('universalNotes')) || {};
      } catch (e) {
        console.error('Error al leer notas:', e);
        return {};
      }
    },

    loadDailyNotes() {
      const today = this.getCurrentDate();
      const allNotes = this.getAllNotes();

      if (allNotes[today]) {
        this.notepad.value = allNotes[today].content || '';
        this.showToast(
          `Notas cargadas (${allNotes[today].wordCount || 0} palabras)`
        );
      }
    },

    saveDailyNotes(manual = false) {
      const today = this.getCurrentDate();
      const allNotes = this.getAllNotes();
      const content = this.notepad.value.trim();

      // No guardar si no hay cambios
      if (allNotes[today]?.content === content && !manual) return;

      allNotes[today] = {
        content: content,
        lastUpdated: new Date().toISOString(),
        wordCount: content ? content.split(/\s+/).length : 0,
        charCount: content.length,
        lines: content ? content.split('\n').length : 0,
      };

      localStorage.setItem('universalNotes', JSON.stringify(allNotes));
      this.lastSave = new Date();

      if (manual) {
        this.showToast('Notas guardadas manualmente');
      }
    },

    showStats() {
      const today = this.getCurrentDate();
      const notes = this.getAllNotes()[today] || {};
      const stats = [
        `Palabras: ${notes.wordCount || 0}`,
        `Caracteres: ${notes.charCount || 0}`,
        `Líneas: ${notes.lines || 0}`,
        `Última modificación: ${
          notes.lastUpdated
            ? new Date(notes.lastUpdated).toLocaleTimeString()
            : 'Nunca'
        }`,
      ];

      this.showToast(stats.join(' · '), 5000);
    },

    showToast(message, duration = 3000) {
      // Eliminar toast existente
      const existing = document.querySelector('.notes-toast');
      if (existing) existing.remove();

      // Crear nuevo toast
      const toast = document.createElement('div');
      toast.className = 'notes-toast';
      toast.textContent = message;

      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 12px 18px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(5px);
        animation: toast-fadeIn 0.3s ease-out;
        max-width: 80%;
        word-break: break-word;
      `;

      document.body.appendChild(toast);

      // Auto-eliminación después de 'duration' ms
      setTimeout(() => {
        toast.style.animation = 'toast-fadeOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },
  };

  // Añadir estilos dinámicos
  const dynamicStyles = document.createElement('style');
  dynamicStyles.textContent = `
    @keyframes twinkle {
      0% { opacity: 0.3; }
      100% { opacity: 1; }
    }
    
    @keyframes shooting {
      0% { transform: translate(0, 0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translate(100vw, 50vh); opacity: 0; }
    }
    
    @keyframes toast-fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes toast-fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
    
    .shooting-star {
      position: absolute;
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 0 10px 2px white;
      animation: shooting linear forwards;
      z-index: 1;
    }
    
    .static-star {
      position: absolute;
      will-change: opacity;
      z-index: 1;
    }
  `;
  document.head.appendChild(dynamicStyles);

  // Inicializar el gestor de notas
  NotesManager.init();
});
