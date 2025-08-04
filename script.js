//script.js
// 1. Get references to all the necessary DOM elements
const form = document.getElementById('fen-form');
const pieceInput = document.getElementById('piece-input');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const fenOutput = document.getElementById('fen-output');
const errorMessage = document.getElementById('error-message');

// 2. Add event listeners
form.addEventListener('submit', handleFormSubmit);
pieceInput.addEventListener('input', handleInputChange);
copyBtn.addEventListener('click', handleCopyClick);

// 3. Handler Functions

function handleInputChange() {
    // Immediately normalize input and reflect back to user
    const cleaned = pieceInput.value.toLowerCase().replace(/[^a-z]/g, '');
    pieceInput.value = cleaned;

    // Reset UI state on any input change
    errorMessage.textContent = '';
    fenOutput.value = '';
    copyBtn.disabled = true;
    copyBtn.textContent = 'Copy';
    
    // Enable generate button only if input is exactly 8 valid pieces
    if (cleaned.length === 8) {
        const error = validateInput(cleaned);
        generateBtn.disabled = error !== null;
    } else {
        generateBtn.disabled = true;
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    // Reset copy button text in case of immediate resubmission
    copyBtn.textContent = 'Copy';
    const cleanedInput = pieceInput.value;

    // Add defensive validation back, even though the UI should prevent this.
    const error = validateInput(cleanedInput);
    if (error) {
        errorMessage.textContent = error;
        return;
    }
    
    const playerColor = document.querySelector('input[name="player-color"]:checked').value;

    // Generate and display the FEN
    const fen = generateFen(cleanedInput, playerColor);
    fenOutput.value = fen;
    copyBtn.disabled = false;
}

function handleCopyClick() {
    if (!fenOutput.value) return;

    navigator.clipboard.writeText(fenOutput.value).then(() => {
        copyBtn.textContent = 'Copied!';
        // Restore the "Copied!" label back to "Copy" after 2 seconds.
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        errorMessage.textContent = 'Failed to copy.';
    });
}

// 4. Helper Functions (Core Logic)

function validateInput(str) {
    const s = str.toLowerCase();
    if (s.length !== 8) return "Input must be 8 characters long.";

    const requiredPieces = { k: 1, q: 1, r: 2, n: 2, b: 2 };
    const counts = {};
    for (const char of s) {
        counts[char] = (counts[char] || 0) + 1;
    }
    for (const piece in requiredPieces) {
        if (counts[piece] !== requiredPieces[piece]) {
            return "Invalid set of pieces.";
        }
    }
    return null;
}

function generateFen(pieceString, playerColor) {
    const s = pieceString.toLowerCase();
    console.log('Original input (s):', s);
  
    const baseString = (playerColor === 'black') 
        ? s.split('').reverse().join('') 
        : s;
    console.log('BaseString after reversal:', baseString);
    console.log('Player color:', playerColor);

    const blackRow = baseString.toLowerCase();
    const whiteRow = baseString.toUpperCase();

    const files = "ABCDEFGH";
    let whiteRooks = "";
    for (let i = 0; i < baseString.length; i++) {
        if (baseString[i] === 'r') { // Scan the new 's'--baseString
            console.log(`Found rook at position ${i}, file ${files[i]}`);
            whiteRooks += files[i];
        }
    }
    console.log('White rooks:', whiteRooks);
    const castlingRights = whiteRooks + whiteRooks.toLowerCase();
    console.log('Final castling rights:', castlingRights);

    const piecePlacement = `${baseString}/pppppppp/8/8/8/8/PPPPPPPP/${baseString.toUpperCase()}`;
    console.log('Piece placement:', piecePlacement);
    return `${piecePlacement} w ${castlingRights || '-'} - 0 1`;

}

// 5. Service Worker Registration for PWA/Offline capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.error('Service Worker registration failed:', err);
        });
    });
}