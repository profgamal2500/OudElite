// تهيئة حالة التطبيق
const state = {
    questions: [],
    quizQuestions: [],
    currentIndex: 0,
    score: 0,
    results: []
};

// استرجاع الأسئلة المحفوظة
function loadQuestions() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
        state.questions = JSON.parse(savedQuestions);
        updateQuestionsList();
    }
}

// حفظ الأسئلة في التخزين المحلي
function saveQuestions() {
    localStorage.setItem('quizQuestions', JSON.stringify(state.questions));
}

// إضافة سؤال جديد
function addQuestion() {
    const questionText = document.getElementById('question-text').value.trim();
    const answerInputs = document.querySelectorAll('.answer-input');
    const correctAnswer = document.getElementById('correct-answer').value;
    
    if (!questionText || !correctAnswer) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    const answers = Array.from(answerInputs).map(input => input.value.trim());
    if (answers.some(answer => !answer)) {
        alert('يرجى ملء جميع الإجابات');
        return;
    }
    
    const question = {
        id: Date.now(),
        question: questionText,
        answers: answers,
        correctAnswer: parseInt(correctAnswer)
    };
    
    state.questions.push(question);
    saveQuestions();
    updateQuestionsList();
    resetForm();
}

// تحديث قائمة الأسئلة في لوحة التحكم
function updateQuestionsList() {
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';
    
    state.questions.forEach((q, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.innerHTML = `
            <div class="question-content">
                <span class="question-number">${index + 1}. </span>
                ${q.question}
                <div class="answers-list">
                    ${q.answers.map((answer, i) => `
                        <div class="answer ${i === q.correctAnswer ? 'correct' : ''}">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="question-actions">
                <button onclick="deleteQuestion(${q.id})" class="delete-btn">حذف</button>
            </div>
        `;
        questionsList.appendChild(questionElement);
    });
}

// حذف سؤال
function deleteQuestion(id) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
        state.questions = state.questions.filter(q => q.id !== id);
        saveQuestions();
        updateQuestionsList();
    }
}

// إعادة تعيين نموذج إضافة السؤال
function resetForm() {
    document.getElementById('question-text').value = '';
    document.querySelectorAll('.answer-input').forEach(input => input.value = '');
    document.getElementById('correct-answer').value = '';
}

// بدء المسابقة
function startQuiz() {
    if (state.questions.length < 1) {
        alert('لا توجد أسئلة متاحة. يرجى إضافة أسئلة أولاً.');
        return;
    }
    
    // خلط الأسئلة
    state.quizQuestions = [...state.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(state.questions.length, 10));
    
    document.getElementById('start-screen').classList.add('hide');
    document.getElementById('quiz-container').classList.remove('hide');
    
    initQuiz();
}

// إعداد الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    
    // زر إضافة سؤال
    const addQuestionBtn = document.getElementById('add-question');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }
    
    // زر بدء المسابقة
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
    
    // زر لوحة التحكم
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hide');
            document.getElementById('admin-panel').classList.remove('hide');
        });
    }
    
    // زر العودة للمسابقة
    const backToQuizBtn = document.getElementById('back-to-quiz');
    if (backToQuizBtn) {
        backToQuizBtn.addEventListener('click', () => {
            document.getElementById('admin-panel').classList.add('hide');
            document.getElementById('start-screen').classList.remove('hide');
        });
    }
});