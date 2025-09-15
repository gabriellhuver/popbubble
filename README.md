# 🫧 Pop! Bubbles

A fun and addictive bubble-popping game built with vanilla HTML, CSS, and JavaScript. Perfect for quick gaming sessions and stress relief!

## 🎮 Game Features

- **4 Difficulty Levels**: Easy, Medium, Hard, and Pro
- **Custom Mode**: Create your own difficulty with sliders
- **Combo System**: Chain pops for higher scores
- **Streak System**: Guitar Hero-style consecutive hits
- **Lives System**: 3 lives with game over
- **Particle Effects**: Beautiful visual feedback
- **Procedural Audio**: Dynamic sound generation
- **Responsive Design**: Works on desktop and mobile
- **High Score Tracking**: LocalStorage persistence

## 🚀 Play Now

[**Play on GitHub Pages**](https://gabriellhuver.github.io/popbubble/)

## 🎯 How to Play

1. **Select Difficulty**: Choose Easy, Medium, Hard, Pro, or create Custom
2. **Pop Bubbles**: Click/tap on bubbles to pop them
3. **Build Combos**: Pop bubbles quickly for combo multipliers
4. **Maintain Streak**: Don't miss any bubbles to keep your streak alive
5. **Survive**: You have 3 lives - don't let bubbles escape!

## 🎛️ Controls

- **Mouse/Touch**: Click or tap to pop bubbles
- **R**: Restart game
- **M**: Toggle mute
- **P**: Pause game

## 🏆 Scoring

- **Base Score**: Based on bubble size (smaller = more points)
- **Combo Multiplier**: Up to 4x for consecutive pops
- **Streak Bonus**: 5% bonus per consecutive hit
- **Penalty**: Lose points for missing bubbles

## 🛠️ Technical Details

- **Pure Vanilla**: No frameworks or dependencies
- **WebAudio API**: Procedural sound generation
- **Canvas API**: Smooth 60fps rendering
- **LocalStorage**: High score persistence
- **Responsive**: DPR-aware canvas scaling

## 📱 Mobile Support

- Touch-optimized controls
- Responsive design
- No accidental scrolling
- Visual feedback for all interactions

## 🎨 Customization

The Custom mode allows you to adjust:
- **Spawn Rate**: How fast bubbles appear
- **Max Bubbles**: Maximum bubbles on screen
- **Size Range**: Min and max bubble sizes
- **Speed**: How fast bubbles move
- **Penalty**: Points lost for missing

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/gabriellhuver/popbubble.git
   cd popbubble
   ```

2. Serve the files (any method works):
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx serve docs
   
   # PHP
   php -S localhost:8000 -t docs
   ```

3. Open `http://localhost:8000` in your browser

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🎉 Credits

Created with ❤️ using vanilla web technologies. No frameworks, no bundlers, just pure fun!

---

**Enjoy popping bubbles!** 🫧✨
