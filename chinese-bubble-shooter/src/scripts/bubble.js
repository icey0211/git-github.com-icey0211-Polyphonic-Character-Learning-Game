class Bubble {
    constructor(character, pinyin, x, y, radius) {
        this.character = character;
        this.pinyin = pinyin;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = this.getColor();
    }

    getColor() {
        // Assign a color based on the character or pinyin
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.stroke();
        context.closePath();
        
        // Draw the character in the bubble
        context.fillStyle = '#FFFFFF'; // White color for text
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.character, this.x, this.y);
    }

    move() {
        // Logic for moving the bubble can be added here
    }
}