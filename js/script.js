const flashcardContainer = document.getElementById('flashcard-container');
const newFlashcardBtn = document.getElementById('new-flashcard-btn');
const newFlashcardModal = document.getElementById('new-flashcard-modal');
const closeNewFlashcardModalBtn = document.getElementsByClassName('close')[0];
const newFlashcardForm = document.getElementById('new-flashcard-form');

function getFlashcards() {
    fetch('http://localhost:8000/api/v1/flashcards/')
        .then(response => response.json())
        .then(data => {
            for (let flashcard of data) {
                const flashcardDiv = document.createElement('div');
                flashcardDiv.classList.add('flashcard');
                flashcardDiv.innerHTML = `
                    <h2>${flashcard.question}</h2>
                    <p>${flashcard.answer}</p>
                `;
                flashcardContainer.appendChild(flashcardDiv);
            }
        });
}

newFlashcardBtn.onclick = function() {
    newFlashcardModal.style.display = 'block';
}

closeNewFlashcardModalBtn.onclick = function() {
    newFlashcardModal.style.display = 'none';
}

newFlashcardForm.onsubmit = function(e) {
    e.preventDefault();
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    const url = document.getElementById('url').value;

    if (url) {
        createFlashcardsFromUrl(url);
        newFlashcardModal.style.display = 'none';
        return;
    }

    fetch('http://localhost:8000/api/v1/flashcards/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question: question,
            answer: answer,
        }),
    })
    .then(response => response.json())
    .then(data => {
        const flashcardDiv = document.createElement('div');
        flashcardDiv.classList.add('flashcard');
        flashcardDiv.innerHTML = `
            <h2>${data.question}</h2>
            <p>${data.answer}</p>
        `;
        flashcardContainer.appendChild(flashcardDiv);
        newFlashcardModal.style.display = 'none';
    });
}

getFlashcards();

function createFlashcardsFromUrl(url) {
    fetch('http://localhost:8000/api/v1/flashcards/from-url/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: url,
        }),
    })
    .then(response => response.json())
    .then(flashcards => {
        for (let flashcard of flashcards) {
            const flashcardDiv = document.createElement('div');
            flashcardDiv.classList.add('flashcard');
            flashcardDiv.innerHTML = `
                <h2>${flashcard.question}</h2>
                <p>${flashcard.answer}</p>
            `;
            flashcardContainer.appendChild(flashcardDiv);
        }
    });
}