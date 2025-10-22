// تهيئة المسابقة
function initQuiz() {
    state.currentIndex = 0;
    state.score = 0;
    state.results = [];
    
    if (state.quizQuestions.length) {
        setNextQuestion();
    } else {
        alert('لا توجد أسئلة في المسابقة');
    }
}

function setNextQuestion() {
    resetState();
    if (state.currentIndex < state.quizQuestions.length) {
        const currentQuestion = state.quizQuestions[state.currentIndex];
        document.getElementById('question').innerText = 
            `السؤال ${state.currentIndex + 1} من ${state.quizQuestions.length}\n${currentQuestion.question}`;
        
        const answerButtonsElement = document.getElementById('answer-buttons');
        currentQuestion.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.innerText = answer;
            button.classList.add('btn');
            button.addEventListener('click', () => selectAnswer(index === currentQuestion.correctAnswer, button, currentQuestion));
            answerButtonsElement.appendChild(button);
        });
    } else {
        endQuiz();
    }
}

function selectAnswer(correct, button, question) {
    if (button.disabled) return;
    
    const answerButtonsElement = document.getElementById('answer-buttons');
    Array.from(answerButtonsElement.children).forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (correct) {
        state.score++;
        button.classList.add('correct');
        showAnswerResult(true);
    } else {
        button.classList.add('wrong');
        showAnswerResult(false, question.answers[question.correctAnswer]);
    }

    state.results.push({
        question: question.question,
        userAnswer: button.innerText,
        correctAnswer: question.answers[question.correctAnswer],
        isCorrect: correct
    });

    document.getElementById('next-btn').classList.remove('hide');
    updateScore();
}

function resetState() {
    const nextButton = document.getElementById('next-btn');
    const answerResult = document.getElementById('answer-result');
    const answerButtonsElement = document.getElementById('answer-buttons');
    
    nextButton.classList.add('hide');
    if (answerResult) {
        answerResult.classList.add('hide');
    }
    
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.innerText = `النتيجة: ${state.score} من ${state.quizQuestions.length}`;
    }
}

function showAnswerResult(isCorrect, correctAnswer = '') {
    const answerResult = document.getElementById('answer-result');
    if (!answerResult) return;

    const resultIcon = answerResult.querySelector('.result-icon');
    const resultText = answerResult.querySelector('.result-text');
    
    resultIcon.innerHTML = isCorrect ? '✓' : '✕';
    resultIcon.className = 'result-icon ' + (isCorrect ? 'correct-answer' : 'wrong-answer');
    
    if (isCorrect) {
        resultText.innerHTML = 'إجابة صحيحة!';
        resultText.className = 'result-text correct-answer';
    } else {
        resultText.innerHTML = `إجابة خاطئة!<br>الإجابة الصحيحة هي: ${correctAnswer}`;
        resultText.className = 'result-text wrong-answer';
    }
    
    answerResult.classList.remove('hide');
}

function endQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const finalResult = document.getElementById('final-result');
    
    quizContainer.classList.add('hide');
    finalResult.classList.remove('hide');
    
    const percentage = (state.score / state.quizQuestions.length * 100).toFixed(1);
    const finalScoreElement = finalResult.querySelector('.final-score');
    if (finalScoreElement) {
        finalScoreElement.innerHTML = 
            `النتيجة النهائية: ${state.score} من ${state.quizQuestions.length} (${percentage}%)`;
    }
    
    const resultsContainer = finalResult.querySelector('.question-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        
        state.results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'question-result-item';
            resultItem.innerHTML = `
                <div>
                    <span class="question-number">السؤال ${index + 1}:</span>
                    ${result.question}
                    <br>
                    <small class="${result.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                        إجابتك: ${result.userAnswer}
                        ${!result.isCorrect ? `<br>الإجابة الصحيحة: ${result.correctAnswer}` : ''}
                    </small>
                </div>
                <div class="result-indicator ${result.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                    ${result.isCorrect ? '✓' : '✕'}
                </div>
            `;
            resultsContainer.appendChild(resultItem);
        });
    }
}

// إعداد الأزرار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الأسئلة عند بدء التطبيق
    loadQuestions();
    
    // زر السؤال التالي
    const nextButton = document.getElementById('next-btn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            state.currentIndex++;
            setNextQuestion();
        });
    }

    // زر إعادة المسابقة
    const restartButton = document.getElementById('restart-btn');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            document.getElementById('final-result').classList.add('hide');
            document.getElementById('start-screen').classList.remove('hide');
            document.getElementById('start-btn').classList.remove('hide');
            document.getElementById('admin-btn').classList.remove('hide');
        });
    }
});