function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];
    return colors[getRandomInt(0, colors.length - 1)];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isValidPinyin(pinyin) {
    const regex = /^[a-zü]*$/; // Basic regex for pinyin validation
    return regex.test(pinyin);
}

export { getRandomInt, getRandomColor, shuffleArray, isValidPinyin };