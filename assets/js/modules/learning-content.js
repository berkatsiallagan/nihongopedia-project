/**
 * Learning Content Module
 * Render halaman pembelajaran dengan audio dan kuis
 */

import audioPlayer from './audio-player.js';
import quizManager from './quiz-manager.js';

class LearningContent {
  constructor() {
    this.currentData = null;
    this.currentCategory = null;
  }

  render(data, categorySlug) {
    this.currentData = data;
    this.currentCategory = categorySlug;

    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = this.generateHTML(data, categorySlug);

    // Initialize components
    this.initializeComponents();
  }

  generateHTML(data, categorySlug) {
    const categoryMeta = this.getCategoryMeta(categorySlug);

    return `
      <!-- Header Section -->
      <section class="bg-gradient-to-br from-red-primary to-red-secondary text-white py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <a href="/" class="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Kembali ke Beranda
            </a>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">${categoryMeta.title}</h1>
            <p class="text-xl text-white/90">${categoryMeta.description}</p>
            <div class="flex items-center gap-4 mt-6">
              <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                📚 ${data.items.length} Materi
              </span>
              <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ✅ Level: ${categoryMeta.level}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-12 bg-white-secondary">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <!-- Progress Bar -->
            <div class="bg-white rounded-xl p-6 mb-8 shadow-md">
              <div class="flex items-center justify-between mb-3">
                <span class="font-medium text-gray-dark">Progress Belajar</span>
                <span class="text-red-primary font-bold" id="progress-text">0%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div id="progress-bar" class="bg-gradient-to-r from-red-primary to-red-secondary h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
            </div>

            <!-- Vocabulary List -->
            <div class="space-y-4">
              ${data.items.map((item, index) => this.renderVocabCard(item, index)).join('')}
            </div>

            <!-- Quiz Section -->
            <div class="mt-12 bg-white rounded-xl p-8 shadow-md">
              <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-dark mb-3">
                  Uji Pemahaman <span class="text-gradient-red">Anda</span>
                </h2>
                <p class="text-gray-600">
                  Selesaikan kuis untuk mengetes pemahaman materi ${categoryMeta.title}
                </p>
              </div>
              
              <div id="quiz-container">
                <button id="start-quiz-btn" class="btn btn-primary w-full md:w-auto mx-auto block">
                  Mulai Kuis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderVocabCard(item, index) {
    const hasAudio = item.audio && item.audio.length > 0;
    const hasExamples = item.examples && item.examples.length > 0;

    return `
      <div class="card animate-slide-up" style="animation-delay: ${index * 0.05}s;" data-vocab-id="${item.id}">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Japanese Text -->
          <div class="md:col-span-1">
            <div class="text-center md:text-left">
              <div class="japanese-text text-red-primary mb-2">${item.expression}</div>
              <div class="text-gray-600 mb-2">${item.reading}</div>
              ${item.politeness ? `<span class="inline-block px-3 py-1 bg-red-50 text-red-primary text-xs rounded-full">${item.politeness}</span>` : ''}
            </div>
          </div>

          <!-- Meaning & Audio -->
          <div class="md:col-span-2">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <p class="text-lg text-gray-dark font-medium mb-2">${item.meaning_id}</p>
                ${hasExamples ? `
                  <button class="text-red-primary hover:text-red-secondary text-sm font-medium flex items-center gap-1" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Lihat Contoh
                  </button>
                  <div class="hidden mt-3 p-4 bg-gray-50 rounded-lg">
                    ${item.examples.map(ex => `
                      <div class="mb-2 last:mb-0">
                        <div class="text-sm text-gray-700 japanese-text">${ex.japanese}</div>
                        <div class="text-sm text-gray-600">${ex.romaji}</div>
                        <div class="text-sm text-gray-500 italic">${ex.translation}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              ${hasAudio ? `
                <button class="audio-btn ml-4" data-audio="${item.audio}" data-text="${item.expression}">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                  </svg>
                </button>
              ` : ''}
            </div>

            <!-- Mark as learned checkbox -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="vocab-learned w-4 h-4 text-red-primary rounded" data-id="${item.id}">
              <span class="text-sm text-gray-600">Saya sudah paham materi ini</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  getCategoryMeta(slug) {
    const metadata = {
      greetings: {
        title: 'Salam & Sapaan',
        description: 'Pelajari berbagai cara menyapa dalam bahasa Jepang untuk situasi formal dan informal',
        level: 'Pemula'
      },
      farewells: {
        title: 'Perpisahan',
        description: 'Ungkapan perpisahan dalam berbagai konteks dan tingkat kesopanan',
        level: 'Pemula'
      }
    };

    return metadata[slug] || {
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      description: 'Materi pembelajaran bahasa Jepang',
      level: 'Pemula'
    };
  }

  initializeComponents() {
    // Initialize audio player
    audioPlayer.init();

    // Initialize progress tracking
    this.initializeProgress();

    // Initialize quiz
    this.initializeQuiz();
  }

  initializeProgress() {
    const checkboxes = document.querySelectorAll('.vocab-learned');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    const updateProgress = () => {
      const total = checkboxes.length;
      const checked = document.querySelectorAll('.vocab-learned:checked').length;
      const percentage = Math.round((checked / total) * 100);

      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}%`;

      // Save progress
      this.saveProgress();
    };

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateProgress);
    });

    // Load saved progress
    this.loadProgress();
    updateProgress();
  }

  saveProgress() {
    const progress = {};
    document.querySelectorAll('.vocab-learned').forEach(cb => {
      progress[cb.dataset.id] = cb.checked;
    });

    localStorage.setItem(`progress_${this.currentCategory}`, JSON.stringify(progress));
  }

  loadProgress() {
    const saved = localStorage.getItem(`progress_${this.currentCategory}`);
    if (!saved) return;

    try {
      const progress = JSON.parse(saved);
      Object.entries(progress).forEach(([id, checked]) => {
        const checkbox = document.querySelector(`[data-id="${id}"]`);
        if (checkbox) checkbox.checked = checked;
      });
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  initializeQuiz() {
    const startBtn = document.getElementById('start-quiz-btn');
    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
      quizManager.start(this.currentData, this.currentCategory);
    });
  }
}

export default new LearningContent();