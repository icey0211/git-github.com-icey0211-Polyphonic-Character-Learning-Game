// level.js

class Level {
    constructor() {
        this.currentLevel = 0;
        this.characterData = [];
        this.loadCharacterData();
    }

    loadCharacterData() {
        fetch('data/characters.json')
            .then(response => response.json())
            .then(data => {
                this.characterData = data;
                this.startLevel();
            })
            .catch(error => console.error('Error loading character data:', error));
    }

    startLevel() {
        // Logic to initialize the level with characters
        this.setupBubbles();
    }

    setupBubbles() {
        // Logic to set up bubbles for the current level
    }

    checkLevelCompletion() {
        // Logic to check if the level is completed
    }

    resetLevel() {
        // Logic to reset the level if the player fails
        this.currentLevel = 0;
        this.loadCharacterData();
    }
}

const level = new Level();