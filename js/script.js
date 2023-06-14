const flashcardContainer = document.getElementById('flashcard-container');
const newFlashcardBtn = document.getElementById('new-flashcard-btn');
const newFlashcardModal = document.getElementById('new-flashcard-modal');
const closeNewFlashcardModalBtn = document.getElementsByClassName('close')[0];
const newFlashcardForm = document.getElementById('new-flashcard-form');
const startLearningBtn = document.getElementById('start-learning-btn');

function getFlashcards() {
    fetch('http://localhost:8000/api/v1/flashcards/')
        .then(response => response.json())
        .then(data => {
            for (let flashcard of data) {
                const flashcardDiv = document.createElement('div');
                const deleteBtn = document.createElement('button');
                flashcardDiv.classList.add('flashcard');
                flashcardDiv.innerHTML = `
                    <h2>${flashcard.question}</h2>
                    <p>${flashcard.answer}</p>
                `;
                flashcardContainer.appendChild(flashcardDiv);
                deleteBtn.innerHTML = 'Delete';
                deleteBtn.onclick = function() {
                    fetch(`http://localhost:8000/api/v1/flashcards/${flashcard.id}/delete_flashcard/`, {
                        method: 'DELETE',
                    })
                    .then(() => {
                        flashcardDiv.remove();
                    });
                };
                flashcardDiv.appendChild(deleteBtn);
                flashcardDiv.onclick = function() {
                    flashcardDiv.classList.toggle('show');
                };
            }
        });
}

getFlashcards();

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

function startLearning() {
    fetch('http://localhost:8000/api/v1/flashcards/?ordering=knowledgeLevel')
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < Math.min(data.length, 10); i++) {
                let flashcard = data[i];
                const flashcardDiv = document.createElement('div');
                flashcardDiv.classList.add('flashcard');
                flashcardDiv.innerHTML = `
                    <h2>${flashcard.question}</h2>
                    <p class="answer">${flashcard.answer}</p>
                    <button class="known">I knew this</button>
                    <button class="unknown">I didn't know this</button>
                `;
                flashcardDiv.onclick = function() {
                    flashcardDiv.classList.toggle('show');
                };
                flashcardContainer.appendChild(flashcardDiv);
                flashcardDiv.querySelector('.known').onclick = function() {
                    fetch(`http://localhost:8000/api/v1/flashcards/${flashcard.id}/`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            correct_answers: flashcard.correct_answers + 1,
                        }),
                    });
                };
            }
        });
}

// Start learning function

let learningFlashcards = [];
let currentFlashcardIndex = 0;

function startLearning() {
    fetch('http://localhost:8000/api/v1/flashcards/?ordering=correct_answers')
        .then(response => response.json())
        .then(data => {
            learningFlashcards = data.slice(0, 10);
            displayFlashcard(learningFlashcards[currentFlashcardIndex]);
        });
}

function displayFlashcard(flashcard) {
    flashcardContainer.innerHTML = '';
    const flashcardDiv = document.createElement('div');
    flashcardDiv.classList.add('flashcard');
    flashcardDiv.innerHTML = `
        <h2>${flashcard.question}</h2>
        <p style="display: none;">${flashcard.answer}</p>
        <button class="known">I knew this</button>
        <button class="unknown">I didn't know this</button>
    `;
    flashcardContainer.appendChild(flashcardDiv);

    flashcardDiv.onclick = function() {
        flashcardDiv.getElementsByTagName('p')[0].style.display = 'block';
    }

    flashcardDiv.querySelector('.known').onclick = function(e) {
        e.stopPropagation();
        fetch(`http://localhost:8000/api/v1/flashcards/${flashcard.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correct_answers: flashcard.correct_answers + 1,
            }),
        })
        .then(response => response.json())
        .then(data => {
            currentFlashcardIndex++;
            if (currentFlashcardIndex < learningFlashcards.length) {
                displayFlashcard(learningFlashcards[currentFlashcardIndex]);
            } else {
                flashcardContainer.innerHTML = '<p>You have finished this learning session.</p>';
            }
        });
    };

    flashcardDiv.querySelector('.unknown').onclick = function(e) {
        e.stopPropagation();
        currentFlashcardIndex++;
        if (currentFlashcardIndex < learningFlashcards.length) {
            displayFlashcard(learningFlashcards[currentFlashcardIndex]);
        } else {
            flashcardContainer.innerHTML = '<p>You have finished this learning session.</p>';
        }
    };
}

startLearningBtn.onclick = startLearning;