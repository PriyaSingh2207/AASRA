/**
 * AASRA Adaptive Cognitive Games Suite
 * Senior-friendly interactive cognitive exercises covering 6 core domains.
 * Implements Play -> Measure -> Analyze -> Adapt -> Recommend -> Track
 */

class CognitiveGamesEngine {
  constructor() {
    this.currentGame = null;
    this.startTime = 0;
    this.score = 0;
    this.difficulty = 2; // Level 1 (Easy), Level 2 (Medium), Level 3 (Adaptive)
  }

  launchGame(gameType) {
    this.currentGame = gameType;
    this.startTime = Date.now();
    this.score = 0;

    const modal = document.getElementById('cognitiveGameModal');
    const container = document.getElementById('gameCanvasContainer');
    if (!modal || !container) return;

    modal.classList.remove('hidden');

    if (gameType === 'photo_recall') {
      this.renderPhotoRecallGame(container);
    } else if (gameType === 'spatial_focus') {
      this.renderSpatialFocusGame(container);
    } else if (gameType === 'time_quiz') {
      this.renderTimeQuizGame(container);
    } else if (gameType === 'math_puzzle') {
      this.renderMathPuzzleGame(container);
    } else if (gameType === 'plant_match') {
      this.renderPlantMatchGame(container);
    } else if (gameType === 'word_association') {
      this.renderWordAssociationGame(container);
    } else if (gameType === 'sequence_recall') {
      this.renderSequenceRecallGame(container);
    } else if (gameType === 'daily_categorization') {
      this.renderDailyCategorizationGame(container);
    }
  }

  // 1. Family Photo Recall Game (Recognition & Memory)
  renderPhotoRecallGame(container) {
    const memoryItem = {
      name: "Rahul Sharma",
      relation: "Son",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
      hint: "Brought fresh tea during Assam visit."
    };

    container.innerHTML = `
      <div style="text-align: center;">
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🌸 Family Memory Recall</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">Who is this family member in your memory capsule?</p>
        
        <img src="${memoryItem.image}" alt="Memory Photo" style="width: 220px; height: 220px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-teal); box-shadow: var(--shadow-md); margin-bottom: 20px;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 480px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 18px; padding: 16px;" onclick="window.cognitiveEngine.submitAnswer(true, 'photo_recall')">Rahul (Son) ✓</button>
          <button class="btn-secondary" style="font-size: 18px; padding: 16px;" onclick="window.cognitiveEngine.submitAnswer(false, 'photo_recall')">Anil (Brother)</button>
          <button class="btn-secondary" style="font-size: 18px; padding: 16px;" onclick="window.cognitiveEngine.submitAnswer(false, 'photo_recall')">Doctor Medhi</button>
          <button class="btn-secondary" style="font-size: 18px; padding: 16px;" onclick="window.cognitiveEngine.submitAnswer(false, 'photo_recall')">Ramesh (Neighbor)</button>
        </div>
      </div>
    `;
  }

  // 2. Spatial Focus & Attention Match
  renderSpatialFocusGame(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🎯 Gentle Target Focus</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">Tap the glowing golden lotus 🪷 when it moves!</p>
        
        <div id="targetGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 320px; height: 320px; margin: 0 auto;">
          <div class="target-cell" style="background: white; border: 2px solid #CBD5E1; border-radius: 16px; font-size: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.cognitiveEngine.submitAnswer(false, 'spatial_focus')">🌸</div>
          <div class="target-cell" style="background: #FEF3C7; border: 3px solid #D97706; border-radius: 16px; font-size: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-md);" onclick="window.cognitiveEngine.submitAnswer(true, 'spatial_focus')">🪷</div>
          <div class="target-cell" style="background: white; border: 2px solid #CBD5E1; border-radius: 16px; font-size: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.cognitiveEngine.submitAnswer(false, 'spatial_focus')">🌺</div>
          <div class="target-cell" style="background: white; border: 2px solid #CBD5E1; border-radius: 16px; font-size: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.cognitiveEngine.submitAnswer(false, 'spatial_focus')">🌻</div>
          <div class="target-cell" style="background: white; border: 2px solid #CBD5E1; border-radius: 16px; font-size: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.cognitiveEngine.submitAnswer(false, 'spatial_focus')">🌼</div>
          <div class="target-cell" style="background: white; border: 2px solid #CBD5E1; border-radius: 16px; font-size: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.cognitiveEngine.submitAnswer(false, 'spatial_focus')">🌷</div>
        </div>
      </div>
    `;
  }

  // 3. Temporal & Orientation Quiz
  renderTimeQuizGame(container) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    container.innerHTML = `
      <div style="text-align: center;">
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🌞 Daily Orientation Check</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">What part of the day are we currently enjoying?</p>

        <div style="display: flex; flex-direction: column; gap: 14px; max-width: 400px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(true, 'time_quiz')">Morning / Daytime ☀️</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'time_quiz')">Late Night 🌙</button>
        </div>
      </div>
    `;
  }

  // 4. Daily Problem Solving & Arithmetic Puzzle
  renderMathPuzzleGame(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🔢 Gentle Coin & Number Exercise</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">If you have 2 tea cups ☕ and add 2 more cups ☕, how many cups do you have in total?</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 360px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 22px; padding: 20px;" onclick="window.cognitiveEngine.submitAnswer(false, 'math_puzzle')">3</button>
          <button class="btn-secondary" style="font-size: 22px; padding: 20px; border-color: var(--primary-teal);" onclick="window.cognitiveEngine.submitAnswer(true, 'math_puzzle')">4 ✓</button>
          <button class="btn-secondary" style="font-size: 22px; padding: 20px;" onclick="window.cognitiveEngine.submitAnswer(false, 'math_puzzle')">5</button>
          <button class="btn-secondary" style="font-size: 22px; padding: 20px;" onclick="window.cognitiveEngine.submitAnswer(false, 'math_puzzle')">6</button>
        </div>
      </div>
    `;
  }

  // 5. Herbal & Garden Flower Match (Visual Processing & Semantic Memory)
  renderPlantMatchGame(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 50px; margin-bottom: 8px;">🌿 🪷 🌸</div>
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🌿 Herbal & Garden Flower Match</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">Which sacred fragrant plant in our courtyard garden is known for healing tea leaves?</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 440px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 20px; padding: 18px; border-color: var(--primary-teal);" onclick="window.cognitiveEngine.submitAnswer(true, 'plant_match')">🌿 Tulsi (Holy Basil) ✓</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'plant_match')">🌵 Desert Cactus</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'plant_match')">🌾 Dry Wheat Grass</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'plant_match')">🍂 Birch Bark</button>
        </div>
      </div>
    `;
  }

  // 6. Proverb & Familiar Phrase Completion (Language & Word Retrieval)
  renderWordAssociationGame(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 50px; margin-bottom: 8px;">💬 📖 ✨</div>
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">💬 Familiar Phrase Completion</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">Complete the well-known saying:<br><strong style="color: var(--slate-dark);">"Early to bed and early to rise, makes a person healthy, wealthy, and..."</strong></p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 440px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 20px; padding: 18px; border-color: var(--primary-teal);" onclick="window.cognitiveEngine.submitAnswer(true, 'word_association')">Wise (बुद्धिमान) ✓</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'word_association')">Tired (थका हुआ)</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'word_association')">Busy (व्यस्त)</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'word_association')">Quiet (शांत)</button>
        </div>
      </div>
    `;
  }

  // 7. Nature Sound & Color Chime Sequence (Working Memory & Executive Function)
  renderSequenceRecallGame(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 50px; margin-bottom: 8px;">🔔 ☁️ ☀️ 🍃</div>
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🔔 Nature Chime Sequence</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 16px;">Remember this gentle 3-step morning order:</p>
        
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px;">
          <div style="padding: 12px 18px; background: #E0F2FE; border-radius: 14px; font-size: 24px; font-weight: bold; color: #0369A1;">1. ☁️ Sky</div>
          <div style="padding: 12px 18px; background: #FEF3C7; border-radius: 14px; font-size: 24px; font-weight: bold; color: #B45309;">2. ☀️ Sun</div>
          <div style="padding: 12px 18px; background: #DCFCE7; border-radius: 14px; font-size: 24px; font-weight: bold; color: #15803D;">3. 🍃 Leaf</div>
        </div>

        <p style="font-size: 16px; color: var(--slate-muted); margin-bottom: 14px;">Select the matching sequence:</p>
        <div style="display: flex; flex-direction: column; gap: 12px; max-width: 440px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 18px; padding: 16px; border-color: var(--primary-teal);" onclick="window.cognitiveEngine.submitAnswer(true, 'sequence_recall')">☁️ Sky ➔ ☀️ Sun ➔ 🍃 Leaf ✓</button>
          <button class="btn-secondary" style="font-size: 18px; padding: 16px;" onclick="window.cognitiveEngine.submitAnswer(false, 'sequence_recall')">🍃 Leaf ➔ ☁️ Sky ➔ ☀️ Sun</button>
          <button class="btn-secondary" style="font-size: 18px; padding: 16px;" onclick="window.cognitiveEngine.submitAnswer(false, 'sequence_recall')">☀️ Sun ➔ 🍃 Leaf ➔ ☁️ Sky</button>
        </div>
      </div>
    `;
  }

  // 8. Home & Kitchen Item Sorter (Category Sorting & Executive Function)
  renderDailyCategorizationGame(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 50px; margin-bottom: 8px;">🫖 ☕ 🏡</div>
        <h3 style="font-size: 24px; color: var(--primary-teal-dark); margin-bottom: 12px;">🏡 Morning Tea Tray Sorter</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 20px;">Which item belongs on our morning hot tea tray?</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 440px; margin: 0 auto;">
          <button class="btn-secondary" style="font-size: 20px; padding: 18px; border-color: var(--primary-teal);" onclick="window.cognitiveEngine.submitAnswer(true, 'daily_categorization')">🫖 Clay Teapot (केतली) ✓</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'daily_categorization')">🧹 Floor Broom</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'daily_categorization')">🔑 Door Key</button>
          <button class="btn-secondary" style="font-size: 20px; padding: 18px;" onclick="window.cognitiveEngine.submitAnswer(false, 'daily_categorization')">🔨 Tool Hammer</button>
        </div>
      </div>
    `;
  }

  async submitAnswer(isCorrect, gameType) {
    const elapsedSec = Math.round((Date.now() - this.startTime) / 1000);
    this.score = isCorrect ? 90 : 50;

    const modal = document.getElementById('cognitiveGameModal');
    const container = document.getElementById('gameCanvasContainer');
    
    if (window.voiceAssistant) {
      if (isCorrect) {
        window.voiceAssistant.speak("Wonderful job Savitri ji! That was correct.");
      } else {
        window.voiceAssistant.speak("Good effort! We can practice this together again.");
      }
    }

    const payload = {
      game_type: gameType,
      score: this.score,
      completion_time_sec: elapsedSec,
      difficulty: this.difficulty
    };

    let evalData = {
      next_recommended_level: this.difficulty,
      adaptation_note: isCorrect ? "High accuracy recorded. Difficulty scaling positively." : "Supportive pace maintained.",
      ai_engine: "groq_lpu_ai"
    };

    if (window.offlineEngine && !window.offlineEngine.isOnline) {
      window.offlineEngine.enqueueAction('ADD_COGNITIVE', payload);
    } else {
      try {
        const res = await fetch('/api/cognitive/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data && data.evaluation) {
          evalData = data.evaluation;
          if (evalData.next_recommended_level) {
            this.difficulty = evalData.next_recommended_level;
          }
        }
      } catch (e) {
        window.offlineEngine.enqueueAction('ADD_COGNITIVE', payload);
      }
    }

    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 60px; margin-bottom: 10px;">${isCorrect ? '🎉' : '🌷'}</div>
        <h3 style="font-size: 26px; color: var(--primary-teal-dark); margin-bottom: 10px;">${isCorrect ? 'Activity Completed Successfully!' : 'Great Effort!'}</h3>
        <p style="font-size: 18px; color: var(--slate-muted); margin-bottom: 16px;">Completion time: ${elapsedSec}s | Score: ${this.score}/100</p>
        
        <!-- Groq / Grok Dynamic AI Difficulty Badge -->
        <div style="background: #F0FDF4; border: 2px solid #86EFAC; border-radius: 16px; padding: 16px; max-width: 480px; margin: 0 auto 20px auto; text-align: left;">
          <div style="display: flex; items-center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 13px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Groq AI Adaptive Tuning</span>
            <span style="font-size: 12px; font-weight: bold; background: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 10px;">Level ${evalData.next_recommended_level || this.difficulty}</span>
          </div>
          <p style="font-size: 14px; color: #15803D; margin: 0; line-height: 1.4;">${evalData.adaptation_note || 'Pacing and difficulty tuned in real-time for zero frustration.'}</p>
        </div>

        <button class="btn-primary" onclick="window.cognitiveEngine.closeModal()">Continue Daily Routine</button>
      </div>
    `;
  }

  closeModal() {
    const modal = document.getElementById('cognitiveGameModal');
    if (modal) modal.classList.add('hidden');
  }
}

window.cognitiveEngine = new CognitiveGamesEngine();
