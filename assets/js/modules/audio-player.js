/**
 * Audio Player Module
 * Mengelola pemutaran audio dengan Web Audio API dan fallback
 */

class AudioPlayer {
    constructor() {
      this.currentAudio = null;
      this.isPlaying = false;
    }
  
    init() {
      // Bind click events ke audio buttons
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.audio-btn');
        if (!btn) return;
  
        const audioSrc = btn.dataset.audio;
        const text = btn.dataset.text;
  
        this.play(audioSrc, text, btn);
      });
  
      console.log('🔊 Audio player initialized');
    }
  
    async play(audioSrc, text, button) {
      // Stop current audio jika ada
      this.stop();
  
      // Update button state
      this.setButtonPlaying(button, true);
  
      try {
        if (audioSrc) {
          await this.playAudioFile(audioSrc);
        } else {
          // Fallback ke Speech Synthesis
          await this.playTextToSpeech(text);
        }
      } catch (error) {
        console.error('Audio playback error:', error);
        
        // Try fallback
        if (audioSrc) {
          await this.playTextToSpeech(text);
        }
      } finally {
        this.setButtonPlaying(button, false);
      }
    }
  
    async playAudioFile(src) {
      return new Promise((resolve, reject) => {
        this.currentAudio = new Audio(src);
        
        this.currentAudio.addEventListener('ended', () => {
          this.isPlaying = false;
          resolve();
        });
  
        this.currentAudio.addEventListener('error', (e) => {
          this.isPlaying = false;
          reject(e);
        });
  
        this.currentAudio.play()
          .then(() => {
            this.isPlaying = true;
          })
          .catch(reject);
      });
    }
  
    async playTextToSpeech(text) {
      return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
          reject(new Error('Speech Synthesis not supported'));
          return;
        }
  
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8;
  
        utterance.onend = () => {
          this.isPlaying = false;
          resolve();
        };
  
        utterance.onerror = (e) => {
          this.isPlaying = false;
          reject(e);
        };
  
        window.speechSynthesis.speak(utterance);
        this.isPlaying = true;
      });
    }
  
    stop() {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
  
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
  
      this.isPlaying = false;
    }
  
    setButtonPlaying(button, playing) {
      if (playing) {
        button.classList.add('playing');
        button.innerHTML = `
          <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        `;
      } else {
        button.classList.remove('playing');
        button.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
          </svg>
        `;
      }
    }
  }
  
  export default new AudioPlayer();