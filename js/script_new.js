// المتغيرات العامة
let questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
let currentQuestionIndex = 0;
let score = 0;
let maxQuestions = parseInt(localStorage.getItem('maxQuestions')) || 5;
let questionResults = [];
let isEditing = false;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة القيم الأولية
    document.getElementById('max-questions').value = maxQuestions;

    // إضافة مستمعي الأحداث للأزرار
    setupEventListeners();
    
    // إعداد التبويبات
    setupTabHandlers();
    
    // عرض الأسئلة المحفوظة
    displayQuestions();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار الواجهة الرئيسية
    document.getElementById('start-btn').addEventListener('click', startQuiz);
    document.getElementById('next-btn').addEventListener('click', handleNextQuestion);
    document.getElementById('admin-btn').addEventListener('click', showAdminPanel);
    document.getElementById('back-to-start').addEventListener('click', showStartScreen);
    document.getElementById('question-form').addEventListener('submit', handleQuestionSubmit);
    document.getElementById('restart-btn').addEventListener('click', handleRestart);

    // مستمع تغيير عدد الأسئلة
    document.getElementById('max-questions').addEventListener('change', function(e) {
        maxQuestions = parseInt(e.target.value);
        localStorage.setItem('maxQuestions', maxQuestions);
    });
}

// وظائف التنقل
function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        setNextQuestion();
    } else {
        endQuiz();
    }
}

function handleRestart() {
    document.getElementById('final-result').classList.add('hide');
    document.getElementById('start-screen').classList.remove('hide');
    document.getElementById('start-btn').classList.remove('hide');
    document.getElementById('admin-btn').classList.remove('hide');
}

function showAdminPanel() {
    document.getElementById('start-screen').classList.add('hide');
    document.getElementById('admin-panel').classList.remove('hide');
}

function showStartScreen() {
    document.getElementById('admin-panel').classList.add('hide');
    document.getElementById('start-screen').classList.remove('hide');
}

// وظائف المسابقة
function startQuiz() {
    if (questions.length === 0) {
        alert('لا توجد أسئلة بعد! يرجى إضافة أسئلة من لوحة الإدارة.');
        return;
    }
    if (questions.length < maxQuestions) {
        alert(`عدد الأسئلة المضافة (${questions.length}) أقل من العدد المطلوب (${maxQuestions})! يرجى إضافة المزيد من الأسئلة.`);
        return;
    }

    // خلط الأسئلة واختيار العدد المطلوب
    let selectedQuestions = shuffleArray([...questions]).slice(0, maxQuestions);
    questions = selectedQuestions;

    document.getElementById('start-btn').classList.add('hide');
    document.getElementById('admin-btn').classList.add('hide');
    document.getElementById('quiz-container').classList.remove('hide');
    
    currentQuestionIndex = 0;
    score = 0;
    questionResults = [];
    updateScore();
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
    } else {
        endQuiz();
    }
}

function showQuestion(question) {
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    
    questionElement.innerText = `السؤال ${currentQuestionIndex + 1} من ${questions.length}\n${question.question}`;
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(index === question.correctAnswer, button));
        answerButtonsElement.appendChild(button);
    });
}

function selectAnswer(correct, button) {
    if (button.disabled) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerButtonsElement = document.getElementById('answer-buttons');
    
    Array.from(answerButtonsElement.children).forEach((btn, index) => {
        btn.disabled = true;
        if (index === currentQuestion.correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (correct) {
        score++;
        updateScore();
        button.classList.add('correct');
        showAnswerResult(true);
    } else {
        button.classList.add('wrong');
        showAnswerResult(false, currentQuestion.answers[currentQuestion.correctAnswer]);
    }

    questionResults.push({
        question: currentQuestion.question,
        userAnswer: button.innerText,
        correctAnswer: currentQuestion.answers[currentQuestion.correctAnswer],
        isCorrect: correct
    });

    document.getElementById('next-btn').classList.remove('hide');
}

function resetState() {
    const nextButton = document.getElementById('next-btn');
    const answerResult = document.getElementById('answer-result');
    const answerButtonsElement = document.getElementById('answer-buttons');
    
    nextButton.classList.add('hide');
    answerResult.classList.add('hide');
    
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function updateScore() {
    document.getElementById('score').innerText = `النتيجة: ${score} من ${questions.length}`;
}

function showAnswerResult(isCorrect, correctAnswer = '') {
    const answerResult = document.getElementById('answer-result');
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

// وظائف لوحة الإدارة
function setupTabHandlers() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-question-tab`).classList.add('active');
            
            if (tabId === 'manage') {
                displayQuestions();
            }
        });
    });
}

function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const newQuestion = {
        id: isEditing ? parseInt(document.getElementById('edit-question-id').value) : Date.now(),
        question: document.getElementById('new-question').value,
        answers: [
            document.getElementById('answer1').value,
            document.getElementById('answer2').value,
            document.getElementById('answer3').value,
            document.getElementById('answer4').value
        ],
        correctAnswer: parseInt(document.querySelector('input[name="correct"]:checked').value)
    };

    if (isEditing) {
        const index = questions.findIndex(q => q.id === newQuestion.id);
        questions[index] = newQuestion;
        isEditing = false;
        document.getElementById('question-submit-btn').innerText = 'إضافة السؤال';
    } else {
        questions.push(newQuestion);
    }

    localStorage.setItem('quizQuestions', JSON.stringify(questions));
    document.getElementById('question-form').reset();
    document.getElementById('edit-question-id').value = '';
    displayQuestions();
    
    alert(isEditing ? 'تم تحديث السؤال بنجاح!' : 'تم إضافة السؤال بنجاح!');
}

function displayQuestions() {
    const questionsList = document.querySelector('.questions-list');
    if (!questionsList) return;
    
    questionsList.innerHTML = questions.map((q, index) => `
        <div class="question-item">
            <div class="question-content">
                <strong>السؤال ${index + 1}:</strong> ${q.question}
                <div class="answers-list">
                    ${q.answers.map((answer, i) => `
                        <div class="answer-item ${i === q.correctAnswer ? 'correct' : ''}">
                            ${answer} ${i === q.correctAnswer ? '✓' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="question-actions">
                <button class="edit-btn" onclick="editQuestion(${q.id})">تعديل</button>
                <button class="delete-btn" onclick="deleteQuestion(${q.id})">حذف</button>
            </div>
        </div>
    `).join('');
}

function editQuestion(id) {
    const question = questions.find(q => q.id === id);
    if (!question) return;

    document.getElementById('new-question').value = question.question;
    question.answers.forEach((answer, index) => {
        document.getElementById(`answer${index + 1}`).value = answer;
    });
    document.querySelector(`input[name="correct"][value="${question.correctAnswer}"]`).checked = true;
    document.getElementById('edit-question-id').value = id;
    isEditing = true;
    document.getElementById('question-submit-btn').innerText = 'تحديث السؤال';

    document.querySelector('.tab-btn[data-tab="add"]').click();
}

function deleteQuestion(id) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
        questions = questions.filter(q => q.id !== id);
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
        displayQuestions();
    }
}

function endQuiz() {
    const finalResult = document.getElementById('final-result');
    const questionContainer = document.getElementById('quiz-container');
    
    questionContainer.classList.add('hide');
    finalResult.classList.remove('hide');
    
    const percentage = (score / questions.length * 100).toFixed(1);
    finalResult.querySelector('.final-score').innerHTML = 
        `النتيجة النهائية: ${score} من ${questions.length} (${percentage}%)`;
    
    const questionResultsElement = finalResult.querySelector('.question-results');
    questionResultsElement.innerHTML = '';
    
    questionResults.forEach((result, index) => {
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
        questionResultsElement.appendChild(resultItem);
    });
}

// وظائف مساعدة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}