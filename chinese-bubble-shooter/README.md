# Chinese Bubble Shooter

## Overview
Chinese Bubble Shooter is an engaging educational game designed to help players learn Chinese polyphonic characters through interactive gameplay. The game combines elements of classic match-three and bubble shooter mechanics, providing a fun way to master the pronunciation and usage of polyphonic characters.

## Game Features
- **Bubble Shooter**: Players control a bubble shooter at the bottom of the screen to aim and shoot bubbles containing Chinese characters.
- **Matching Mechanism**: Bubbles above display pinyin corresponding to the characters in the shooter. Players must match the character with the correct pinyin to clear bubbles.
- **Levels**: The game includes multiple levels, each with increasing difficulty and a variety of characters to learn.
- **Sound Effects**: Enjoy immersive sound effects for shooting, collisions, and level completions.

## File Structure
```
chinese-bubble-shooter
├── src
│   ├── index.html          # Main HTML document for the game interface
│   ├── styles
│   │   └── main.css       # CSS styles for layout and animations
│   ├── scripts
│   │   ├── game.js        # Main game logic and state management
│   │   ├── bubble.js      # Bubble class definition
│   │   ├── shooter.js     # Shooter class definition
│   │   ├── collision.js    # Collision detection and handling
│   │   ├── level.js       # Level management and character loading
│   │   └── utils.js       # Utility functions
│   ├── data
│   │   └── characters.json # Polyphonic characters and pinyin data
│   └── assets
│       └── sounds         # Sound files for the game
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Getting Started
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd chinese-bubble-shooter
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Run the Game**: 
   Open `src/index.html` in your web browser to start playing.

## How to Play
- Use the control buttons to adjust the angle of the bubble shooter.
- Aim and shoot the bubble containing the Chinese character at the corresponding pinyin bubble above.
- Match the bubbles to clear them from the screen. If the bubbles reach the red line, the level fails.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.