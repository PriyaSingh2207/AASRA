/** AASRA cognitive games: 10 progressively harder levels per activity. */
const GAME_LEVELS = {
  photo_recall: [
    ['Who is Rahul in your family?', ['Your son', 'Your neighbour', 'Your doctor'], 0], ['Who brought tea during the Assam visit?', ['Rahul', 'The postman', 'The gardener'], 0], ['Who is a child in the family?', ['Ananya', 'Rahul', 'Savitri'], 0], ['Who helps with the morning routine?', ['Rahul', 'The taxi driver', 'The shopkeeper'], 0], ['Rahul is Savitri’s…', ['son', 'brother', 'uncle'], 0], ['Who can join a family photo?', ['Ananya', 'A bus conductor', 'A pharmacist'], 0], ['Choose the family connection.', ['Rahul — son', 'Rahul — dentist', 'Rahul — neighbour'], 0], ['Who can share a memory from home?', ['A family member', 'A traffic light', 'A teacup'], 0], ['Which name belongs to a family memory?', ['Rahul', 'Monsoon', 'Garden gate'], 0], ['Complete: Rahul is part of my…', ['family', 'weather report', 'medicine label'], 0]
  ],
  spatial_focus: [
    ['Tap the golden lotus.', ['Golden lotus 🪷', 'Pink flower 🌸', 'Sunflower 🌻'], 0], ['Find the blue circle.', ['Blue circle 🔵', 'Red circle 🔴', 'Green circle 🟢'], 0], ['Choose the star.', ['Star ⭐', 'Moon 🌙', 'Cloud ☁️'], 0], ['Find the leaf.', ['Leaf 🍃', 'Flower 🌼', 'Stone 🪨'], 0], ['Select the warm sun.', ['Sun ☀️', 'Rain 🌧️', 'Snow ❄️'], 0], ['Find the only heart.', ['Heart ❤️', 'Square ⬛', 'Triangle 🔺'], 0], ['Choose the butterfly.', ['Butterfly 🦋', 'Bee 🐝', 'Bird 🐦'], 0], ['Tap the lantern.', ['Lantern 🏮', 'Bell 🔔', 'Book 📖'], 0], ['Find the green sprout.', ['Sprout 🌱', 'Apple 🍎', 'Shell 🐚'], 0], ['Choose the water drop.', ['Water drop 💧', 'Fire 🔥', 'Wind 💨'], 0]
  ],
  time_quiz: [
    ['Which comes after morning?', ['Afternoon', 'Midnight', 'Yesterday'], 0], ['When do we see the sun?', ['Daytime', 'Late night', 'Midnight'], 0], ['Which meal is often first?', ['Breakfast', 'Dinner', 'Supper'], 0], ['What comes after Monday?', ['Tuesday', 'Sunday', 'Friday'], 0], ['Which season is warm?', ['Summer', 'Winter', 'Monsoon night'], 0], ['What comes after afternoon?', ['Evening', 'Morning', 'Breakfast'], 0], ['Which day follows Friday?', ['Saturday', 'Wednesday', 'Monday'], 0], ['When do people usually sleep?', ['Night', 'Noon', 'Breakfast'], 0], ['Which tells us the date?', ['Calendar', 'Teacup', 'Pillow'], 0], ['A week has how many days?', ['Seven', 'Three', 'Ten'], 0]
  ],
  math_puzzle: [
    ['1 tea cup + 1 tea cup = ?', ['2', '1', '3'], 0], ['2 biscuits + 1 biscuit = ?', ['3', '2', '4'], 0], ['2 flowers + 2 flowers = ?', ['4', '3', '5'], 0], ['5 mangoes − 1 mango = ?', ['4', '3', '5'], 0], ['3 cups + 2 cups = ?', ['5', '4', '6'], 0], ['6 sweets − 2 sweets = ?', ['4', '3', '5'], 0], ['4 leaves + 3 leaves = ?', ['7', '6', '8'], 0], ['8 coins − 3 coins = ?', ['5', '4', '6'], 0], ['5 flowers + 4 flowers = ?', ['9', '8', '10'], 0], ['10 biscuits − 4 biscuits = ?', ['6', '5', '7'], 0]
  ],
  plant_match: [
    ['Which plant is holy basil?', ['Tulsi 🌿', 'Cactus 🌵', 'Pine cone'], 0], ['Which plant has a sweet fragrance?', ['Jasmine', 'Stone', 'Spoon'], 0], ['Which needs water to grow?', ['Plant', 'Book', 'Chair'], 0], ['Which is a flower?', ['Marigold 🌼', 'Teapot', 'Key'], 0], ['Which leaf can make herbal tea?', ['Tulsi leaf', 'Plastic leaf', 'Paper clip'], 0], ['Which grows in a garden bed?', ['Rose', 'Pillow', 'Clock'], 0], ['Which part holds a plant in soil?', ['Roots', 'Handle', 'Wheel'], 0], ['Which colour is a healthy leaf?', ['Green', 'Metallic', 'Clear'], 0], ['Which helps a plant grow?', ['Sunlight', 'Television', 'Shoes'], 0], ['Which is used to water plants?', ['Watering can', 'Blanket', 'Plate'], 0]
  ],
  word_association: [
    ['Complete: early to bed and early to rise makes us…', ['wise', 'tired', 'silent'], 0], ['Complete: tea and…', ['biscuits', 'shoes', 'rain'], 0], ['A doctor works in a…', ['clinic', 'garden', 'kitchen'], 0], ['A book is for…', ['reading', 'watering', 'cooking'], 0], ['A bed is for…', ['sleeping', 'driving', 'swimming'], 0], ['A flower smells…', ['fragrant', 'loud', 'heavy'], 0], ['A clock tells the…', ['time', 'taste', 'temperature'], 0], ['A family shares…', ['memories', 'traffic', 'thunder'], 0], ['A warm smile feels…', ['kind', 'sharp', 'cold'], 0], ['Complete: practice makes…', ['better', 'midnight', 'garden'], 0]
  ],
  sequence_recall: [
    ['Which order is correct?', ['Sky → Sun', 'Sun → Sky', 'Leaf → Sky'], 0], ['Which order is correct?', ['Tea → Cup', 'Cup → Tea', 'Cup → Leaf'], 0], ['Which order is correct?', ['Wake → Wash → Eat', 'Eat → Wake → Wash', 'Wash → Eat → Wake'], 0], ['Which order is correct?', ['Seed → Sprout → Flower', 'Flower → Seed → Sprout', 'Sprout → Flower → Seed'], 0], ['Which order is correct?', ['Morning → Afternoon → Evening', 'Evening → Morning → Afternoon', 'Afternoon → Evening → Morning'], 0], ['Which order is correct?', ['Soap → Rinse → Dry', 'Dry → Soap → Rinse', 'Rinse → Dry → Soap'], 0], ['Which order is correct?', ['Door → Path → Garden', 'Garden → Door → Path', 'Path → Garden → Door'], 0], ['Which order is correct?', ['Boil → Pour → Sip', 'Sip → Boil → Pour', 'Pour → Sip → Boil'], 0], ['Which order is correct?', ['Bell → Listen → Reply', 'Reply → Bell → Listen', 'Listen → Reply → Bell'], 0], ['Which order is correct?', ['Read → Remember → Share', 'Share → Read → Remember', 'Remember → Share → Read'], 0]
  ],
  daily_categorization: [
    ['Which belongs on a tea tray?', ['Teapot', 'Broom', 'Hammer'], 0], ['Which belongs in a kitchen?', ['Spoon', 'Pillow', 'Key'], 0], ['Which helps clean a floor?', ['Broom', 'Cup', 'Book'], 0], ['Which opens a door?', ['Key', 'Plate', 'Leaf'], 0], ['Which belongs in a bathroom?', ['Towel', 'Teapot', 'Lamp'], 0], ['Which helps us write?', ['Pen', 'Kettle', 'Pillow'], 0], ['Which belongs in a garden?', ['Watering can', 'Sofa', 'Fork'], 0], ['Which is for eating soup?', ['Spoon', 'Broom', 'Clock'], 0], ['Which belongs on a bed?', ['Pillow', 'Spade', 'Mug'], 0], ['Which helps us travel?', ['Bus', 'Teacup', 'Cushion'], 0]
  ]
};

const GAME_TITLES = { photo_recall: 'Family Memory Recall', spatial_focus: 'Gentle Target Focus', time_quiz: 'Daily Orientation Check', math_puzzle: 'Gentle Number Exercise', plant_match: 'Herbal & Garden Match', word_association: 'Familiar Phrase Completion', sequence_recall: 'Nature Chime Sequence', daily_categorization: 'Morning Tea Tray Sorter' };

class CognitiveGamesEngine {
  constructor() { this.currentGame = null; this.currentLevel = 1; this.startTime = 0; }
  getSavedLevel(gameType) { const level = Number(localStorage.getItem(`aasra_game_level_${gameType}`)); return Number.isInteger(level) && level >= 1 && level <= 10 ? level : 1; }
  launchGame(gameType, level = this.getSavedLevel(gameType)) {
    if (!GAME_LEVELS[gameType]) return;
    this.currentGame = gameType; this.currentLevel = Math.max(1, Math.min(10, Math.round(level))); this.startTime = Date.now();
    const modal = document.getElementById('cognitiveGameModal'); const container = document.getElementById('gameCanvasContainer'); if (!modal || !container) return;
    modal.classList.remove('hidden'); this.renderLevel(container);
  }
  renderLevel(container) {
    const [prompt, options, answer] = GAME_LEVELS[this.currentGame][this.currentLevel - 1];
    const buttons = options.map((option, index) => `<button class="btn-secondary" style="font-size:19px;padding:16px" onclick="window.cognitiveEngine.submitAnswer(${index === answer})">${option}</button>`).join('');
    container.innerHTML = `<div style="text-align:center"><p style="font-size:14px;font-weight:bold;color:var(--primary-teal);margin:0 0 8px">${GAME_TITLES[this.currentGame]} · Level ${this.currentLevel} of 10</p><div style="height:8px;background:#E2E8F0;border-radius:8px;margin:0 auto 20px;max-width:420px"><div style="height:100%;width:${this.currentLevel * 10}%;background:var(--primary-teal);border-radius:8px"></div></div><h3 style="font-size:24px;color:var(--primary-teal-dark);margin-bottom:22px">${prompt}</h3><div style="display:grid;grid-template-columns:1fr;gap:12px;max-width:460px;margin:0 auto">${buttons}</div><button class="btn-secondary" style="margin-top:20px" onclick="window.cognitiveEngine.closeModal()">Close activity</button></div>`;
  }
  async submitAnswer(isCorrect) {
    const elapsedSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000)); const score = isCorrect ? 100 : 45;
    const payload = { game_type: this.currentGame, score, completion_time_sec: elapsedSec, difficulty: this.currentLevel, level: this.currentLevel };
    let evaluation = { next_recommended_level: isCorrect ? Math.min(10, this.currentLevel + 1) : this.currentLevel, adaptation_note: 'Your next activity is ready at a comfortable pace.', ai_engine: 'local_progress' };
    try {
      if (window.offlineEngine && !window.offlineEngine.isOnline) throw new Error('offline');
      const response = await fetch('/api/cognitive/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`Session request failed: ${response.status}`);
      const data = await response.json(); evaluation = { ...evaluation, ...(data.evaluation || {}) };
    } catch (error) { if (window.offlineEngine) window.offlineEngine.enqueueAction('ADD_COGNITIVE', payload); }
    const suggested = Math.round(Number(evaluation.next_recommended_level) || this.currentLevel);
    const nextLevel = isCorrect ? Math.min(10, Math.max(this.currentLevel + 1, suggested)) : this.currentLevel;
    localStorage.setItem(`aasra_game_level_${this.currentGame}`, String(nextLevel));
    if (window.voiceAssistant) window.voiceAssistant.speak(isCorrect ? 'Wonderful job. That was correct.' : 'Good effort. We can practice again together.');
    const container = document.getElementById('gameCanvasContainer'); if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:20px"><div style="font-size:56px">${isCorrect ? '🎉' : '🌷'}</div><h3 style="font-size:26px;color:var(--primary-teal-dark)">${isCorrect ? 'Level completed!' : 'Great effort!'}</h3><p style="font-size:18px;color:var(--slate-muted)">Level ${this.currentLevel} of 10 · ${elapsedSec}s</p><p style="font-size:15px;color:#15803D">${evaluation.adaptation_note}</p><button class="btn-primary" onclick="window.cognitiveEngine.launchGame('${this.currentGame}', ${nextLevel})">${nextLevel > this.currentLevel ? `Play Level ${nextLevel}` : 'Try this level again'}</button><button class="btn-secondary" style="margin-left:10px" onclick="window.cognitiveEngine.closeModal()">Finish</button></div>`;
  }
  closeModal() { document.getElementById('cognitiveGameModal')?.classList.add('hidden'); }
}
window.cognitiveEngine = new CognitiveGamesEngine();
