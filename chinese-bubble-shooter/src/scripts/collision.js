function checkCollision(bubble1, bubble2) {
    const dx = bubble1.x - bubble2.x;
    const dy = bubble1.y - bubble2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (bubble1.radius + bubble2.radius);
}

function handleBubbleCollision(bubbles, shooterBubble) {
    for (let i = 0; i < bubbles.length; i++) {
        if (checkCollision(bubbles[i], shooterBubble)) {
            if (bubbles[i].character === shooterBubble.character) {
                bubbles.splice(i, 1);
                return true; // Match found and bubble removed
            }
        }
    }
    return false; // No match found
}

function removeMatchedBubbles(bubbles) {
    const matchedBubbles = [];
    for (let i = 0; i < bubbles.length; i++) {
        if (bubbles[i].isMatched) {
            matchedBubbles.push(i);
        }
    }
    for (let i = matchedBubbles.length - 1; i >= 0; i--) {
        bubbles.splice(matchedBubbles[i], 1);
    }
}

export { checkCollision, handleBubbleCollision, removeMatchedBubbles };
