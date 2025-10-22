// تهيئة حالة التطبيق
const state = {
    questions: [],
    currentQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    contestant: {
        name: '',
        phone: ''
    },
    rewards: []
};

// تحميل البيانات
function loadData() {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
        state.questions = JSON.parse(savedQuestions);
        updateQuestionsList();
    }
    
    const savedRewards = localStorage.getItem('rewards');
    if (savedRewards) {
        state.rewards = JSON.parse(savedRewards);
        updateRewardsList();
    }
}

// تحديث النتيجة
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `النتيجة: ${state.score} من ${state.currentQuestions.length}`;
    }
}

// وظائف المسابقة الرئيسية
function startQuiz() {
    const nameInput = document.getElementById('contestant-name');
    const phoneInput = document.getElementById('contestant-phone');

    if (!nameInput?.value.trim() || !phoneInput?.value.trim()) {
        alert('يرجى إدخال اسم المتسابق ورقم الجوال');
        return;
    }

    if (phoneInput.value.length !== 10 || !/^[0-9]+$/.test(phoneInput.value)) {
        alert('يرجى إدخال رقم جوال صحيح من 10 أرقام');
        return;
    }

    if (state.questions.length === 0) {
        alert('لا توجد أسئلة متاحة. يرجى إضافة أسئلة في لوحة التحكم أولاً.');
        return;
    }

    // حفظ بيانات المتسابق
    state.contestant = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    // اختيار الأسئلة العشوائية
    const questionCount = Math.min(5, state.questions.length);
    state.currentQuestions = [...state.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    
    state.currentQuestionIndex = 0;
    state.score = 0;

    // عرض شاشة المسابقة
    document.getElementById('start-screen').classList.add('hide');
    document.getElementById('quiz-container').classList.remove('hide');
    showQuestion();
}

// وظائف إدارة الأسئلة والبيانات
function loadData() {
    // تحميل الأسئلة
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
        state.questions = JSON.parse(savedQuestions);
        updateQuestionsList();
    }
    
    // تحميل الجوائز
    const savedRewards = localStorage.getItem('rewards');
    if (savedRewards) {
        state.rewards = JSON.parse(savedRewards);
        updateRewardsList();
    }
    
    // تحميل عدد الأسئلة المحفوظ
    const savedMaxQuestions = localStorage.getItem('maxQuestions');
    if (savedMaxQuestions) {
        const maxQuestionsInput = document.getElementById('max-questions');
        if (maxQuestionsInput) {
            maxQuestionsInput.value = savedMaxQuestions;
        }
    }
}

function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(state.questions));
}

function addQuestion(event) {
    event.preventDefault();
    
    // حفظ عدد الأسئلة المحدد في localStorage
    const maxQuestionsInput = document.getElementById('max-questions');
    if (maxQuestionsInput) {
        localStorage.setItem('maxQuestions', maxQuestionsInput.value);
    }
    
    const questionText = document.getElementById('new-question').value.trim();
    const answers = [
        document.getElementById('answer1').value.trim(),
        document.getElementById('answer2').value.trim(),
        document.getElementById('answer3').value.trim(),
        document.getElementById('answer4').value.trim()
    ];
    
    const correctAnswer = document.querySelector('input[name="correct"]:checked');
    
    if (!questionText || answers.some(a => !a) || !correctAnswer) {
        alert('يرجى ملء جميع الحقول واختيار الإجابة الصحيحة');
        return;
    }
    
    const questionId = document.getElementById('edit-question-id').value;
    const question = {
        id: questionId || Date.now().toString(),
        question: questionText,
        answers: answers,
        correctAnswer: parseInt(correctAnswer.value)
    };
    
    if (questionId) {
        const index = state.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            state.questions[index] = question;
        }
    } else {
        state.questions.push(question);
    }
    
    saveQuestions();
    updateQuestionsList();
    resetForm();
}

function deleteQuestion(id) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
        state.questions = state.questions.filter(q => q.id !== id);
        saveQuestions();
        updateQuestionsList();
    }
}

function editQuestion(id) {
    const question = state.questions.find(q => q.id === id);
    if (question) {
        document.getElementById('new-question').value = question.question;
        question.answers.forEach((answer, index) => {
            document.getElementById(`answer${index + 1}`).value = answer;
        });
        document.querySelector(`input[name="correct"][value="${question.correctAnswer}"]`).checked = true;
        document.getElementById('edit-question-id').value = id;
        document.getElementById('question-submit-btn').textContent = 'تحديث السؤال';
        
        // التبديل إلى تبويب الإضافة
        showTab('add');
    }
}

function resetForm() {
    document.getElementById('question-form').reset();
    document.getElementById('edit-question-id').value = '';
    document.getElementById('question-submit-btn').textContent = 'إضافة السؤال';
}

function updateQuestionsList() {
    const questionsList = document.querySelector('.questions-list');
    questionsList.innerHTML = state.questions.length ? '' : '<p>لا توجد أسئلة حالياً</p>';
    
    state.questions.forEach((q, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.innerHTML = `
            <div class="question-content">
                <div class="question-header">
                    <span class="question-number">${index + 1}.</span>
                    <span class="question-text">${q.question}</span>
                </div>
                <div class="answers-list">
                    ${q.answers.map((answer, i) => `
                        <div class="answer ${i === q.correctAnswer ? 'correct' : ''}">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="question-actions">
                <button onclick="editQuestion('${q.id}')" class="btn edit-btn">تعديل</button>
                <button onclick="deleteQuestion('${q.id}')" class="btn delete-btn">حذف</button>
            </div>
        `;
        questionsList.appendChild(questionElement);
    });
}

// وظائف المسابقة
function startQuiz() {
    // الحصول على بيانات المتسابق
    const nameInput = document.getElementById('contestant-name');
    const phoneInput = document.getElementById('contestant-phone');

    if (!nameInput || !phoneInput) {
        console.error('لم يتم العثور على حقول بيانات المتسابق');
        return;
    }

    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
        alert('يرجى إدخال اسم المتسابق ورقم الجوال');
        return;
    }

    // التحقق من صحة رقم الجوال
    if (phoneInput.value.length !== 10 || !/^[0-9]+$/.test(phoneInput.value)) {
        alert('يرجى إدخال رقم جوال صحيح من 10 أرقام');
        return;
    }

    // حفظ بيانات المتسابق
    state.contestant.name = nameInput.value.trim();
    state.contestant.phone = phoneInput.value.trim();

    // التحقق من وجود أسئلة
    if (state.questions.length === 0) {
        alert('لا توجد أسئلة متاحة. يرجى إضافة أسئلة في لوحة التحكم أولاً.');
        return;
    }

    // الحصول على عدد الأسئلة المحدد من لوحة الإدارة
    const maxQuestionsInput = document.getElementById('max-questions');
    const maxQuestions = parseInt(maxQuestionsInput?.value) || 5;
    
    if (state.questions.length < 1) {
        alert('لا توجد أسئلة متاحة. يرجى إضافة أسئلة أولاً.');
        return;
    }
    
    if (maxQuestions > state.questions.length) {
        alert(`عذراً، لديك فقط ${state.questions.length} سؤال متاح. سيتم استخدام جميع الأسئلة المتاحة.`);
    }
    
    // اختيار الأسئلة وبدء المسابقة
    state.currentQuestions = [...state.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(state.questions.length, maxQuestions));

    state.currentQuestionIndex = 0;
    state.score = 0;

    // إخفاء شاشة البداية وعرض المسابقة
    document.getElementById('start-screen').classList.add('hide');
    document.getElementById('quiz-container').classList.remove('hide');
    
    // عرض السؤال الأول
    showQuestion();

    console.log('تم حفظ بيانات المتسابق:', state.contestant);
    showQuestion();
}

function showQuestion() {
    const question = state.currentQuestions[state.currentQuestionIndex];
    if (!question) {
        endQuiz();
        return;
    }
    
    // عرض رقم السؤال الحالي
    document.getElementById('question').textContent = 
        `السؤال ${state.currentQuestionIndex + 1} من ${state.currentQuestions.length}: ${question.question}`;
    
    // تجهيز أزرار الإجابات
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';
    
    // إنشاء أزرار الإجابات
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(index));
        buttonsContainer.appendChild(button);
    });
    
    // إخفاء زر السؤال التالي ونتيجة الإجابة
    document.getElementById('next-btn').classList.add('hide');
    document.getElementById('answer-result').classList.add('hide');
    
    document.getElementById('next-btn').classList.add('hide');
    document.getElementById('answer-result').classList.add('hide');
    updateScore();
}

function selectAnswer(selectedIndex) {
    const question = state.currentQuestions[state.currentQuestionIndex];
    const buttons = document.getElementById('answer-buttons').children;
    const resultElement = document.getElementById('answer-result');
    const resultIcon = resultElement.querySelector('.result-icon');
    const resultText = resultElement.querySelector('.result-text');
    
    Array.from(buttons).forEach(button => button.disabled = true);
    
    const isCorrect = selectedIndex === question.correctAnswer;
    if (isCorrect) {
        state.score++;
        buttons[selectedIndex].classList.add('correct');
        resultIcon.textContent = '✓';
        resultText.textContent = 'إجابة صحيحة!';
    } else {
        buttons[selectedIndex].classList.add('wrong');
        buttons[question.correctAnswer].classList.add('correct');
        resultIcon.textContent = '✕';
        resultText.textContent = `إجابة خاطئة! الإجابة الصحيحة هي: ${question.answers[question.correctAnswer]}`;
    }
    
    resultElement.classList.remove('hide');
    document.getElementById('next-btn').classList.remove('hide');
    updateScore();
}

function updateScore() {
    document.getElementById('score').textContent = 
        `النتيجة: ${state.score} من ${state.currentQuestions.length}`;
}

function nextQuestion() {
    state.currentQuestionIndex++;
    showQuestion();
}

function resetQuiz() {
    state.currentQuestions = [];
    state.currentQuestionIndex = 0;
    state.score = 0;
    
    // إزالة جميع عناصر الاحتفال السابقة
    const finalResult = document.getElementById('final-result');
    const celebration = finalResult.querySelector('.celebration');
    if (celebration) {
        celebration.remove();
    }
}

function endQuiz() {
    document.getElementById('quiz-container').classList.add('hide');
    const finalResult = document.getElementById('final-result');
    finalResult.classList.remove('hide');
    
    const percentage = ((state.score / state.currentQuestions.length) * 100).toFixed(1);
    
    // تنظيف النتائج السابقة
    while (finalResult.firstChild) {
        finalResult.removeChild(finalResult.firstChild);
    }

    // إضافة المحتوى الاحتفالي
    finalResult.innerHTML = `
        <div class="celebration-header">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAzNiI+PHBhdGggZmlsbD0iI0ZGRDM0RiIgZD0iTTI3IDEzYzAtNy0xNy03LTE3IDBzMTcgNyAxNyAweiIvPjxwYXRoIGZpbGw9IiNGRkQzNEYiIGQ9Ik0yNyAyM2MwLTctMTctNy0xNyAwczE3IDcgMTcgMHoiLz48L3N2Zz4=" class="celebration-icon" alt="celebration" />
            <h1>تهانينا! 🎉</h1>
        </div>
        <div class="score-display">${percentage}%</div>
        <div class="celebration-text">
            ${percentage >= 100 ? 'أداء رائع! ⭐' : 
              percentage >= 80 ? 'أداء ممتاز! 🌟' : 
              percentage >= 60 ? 'أداء جيد! 👏' : 'شكراً لمشاركتك! 💫'}
        </div>
        <div class="contestant-info">
            <div class="contestant-detail">الاسم: ${state.contestant.name}</div>
            <div class="contestant-detail">رقم الجوال: ${state.contestant.phone}</div>
        </div>
        <div class="result-buttons">
            <button id="restart-btn" class="btn">إعادة المسابقة</button>
            <button id="home-btn" class="btn">العودة للرئيسية</button>
        </div>
    `;

    // إعادة ربط أحداث الأزرار
    document.getElementById('restart-btn').addEventListener('click', () => {
        resetQuiz();
        startQuiz();
    });
    document.getElementById('home-btn').addEventListener('click', () => {
        resetQuiz();
        document.getElementById('final-result').classList.add('hide');
        document.getElementById('start-screen').classList.remove('hide');
    });

    // تشغيل تأثيرات الكونفيتي
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // تشغيل الكونفيتي بألوان مختلفة حسب النتيجة
    const colors = percentage >= 80 ? ['#FFD700', '#FFA500', '#FF6B6B'] : ['#00ff00', '#4CAF50', '#45a049'];
    
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors
        }));
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors
        }));
    }, 250);
    
    // إنشاء عنصر النتيجة النهائية
    const finalScoreElement = document.createElement('div');
    finalScoreElement.className = 'final-score';
    
    // إضافة العناصر الجديدة للنتيجة
    const celebrationElement = document.createElement('div');
    celebrationElement.className = 'celebration';
    
    if (percentage == 100) {
        // إضافة الاحتفال للنتيجة الكاملة
        celebrationElement.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji">🎉</div>
                <div class="celebration-text">
                    <h3>تهانينا! 🎊</h3>
                    <p>لقد حصلت على العلامة الكاملة! أداء رائع! ⭐</p>
                </div>
            </div>
            <div class="fireworks">
                <div class="firework"></div>
                <div class="firework"></div>
                <div class="firework"></div>
                <div class="firework"></div>
                <div class="firework"></div>
            </div>
            <div class="sparkles">
                ${Array.from({length: 20}, (_, i) => `
                    <div class="sparkle" style="
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                        animation-delay: ${Math.random() * 2}s;
                    "></div>
                `).join('')}
            </div>
        `;
        
        // إضافة تأثيرات صوتية للاحتفال
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVuihzw1QAAAAAAA');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play prevented'));

        // إضافة المزيد من الحركة
        setTimeout(() => {
            const emoji = celebrationElement.querySelector('.celebration-emoji');
            emoji.style.transform = 'scale(1.5)';
            setTimeout(() => {
                emoji.style.transform = 'scale(1)';
            }, 200);
        }, 100);
        finalScoreElement.className = 'final-score perfect-score';
    } else if (percentage >= 80) {
        // نتيجة ممتازة ولكن ليست كاملة
        celebrationElement.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji">🌟</div>
                <div class="celebration-text">
                    <h3>أداء ممتاز!</h3>
                    <p>أحسنت! استمر في التقدم! يمكنك المحاولة مرة أخرى للحصول على العلامة الكاملة.</p>
                </div>
            </div>
        `;
        finalScoreElement.className = 'final-score great-score';
    } else {
        // نتيجة تحتاج إلى تحسين
        celebrationElement.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji">💪</div>
                <div class="celebration-text">
                    <h3>استمر في المحاولة!</h3>
                    <p>لا تستسلم! يمكنك المحاولة لاحقاً وتحسين نتيجتك.</p>
                </div>
            </div>
        `;
        finalScoreElement.className = 'final-score';
    }
    
    finalScoreElement.textContent = `النتيجة النهائية: ${state.score} من ${state.currentQuestions.length} (${percentage}%)`;
    finalResult.insertBefore(celebrationElement, finalResult.firstChild);
    
    const resultsContainer = finalResult.querySelector('.question-results');
    resultsContainer.innerHTML = '';
    state.currentQuestions.forEach((question, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <p><strong>السؤال ${index + 1}:</strong> ${question.question}</p>
            <p class="correct-answer">الإجابة الصحيحة: ${question.answers[question.correctAnswer]}</p>
        `;
        resultsContainer.appendChild(resultItem);
    });
}

// وظائف التنقل
function showTab(tabName) {
    // تحديث الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // تحديث المحتوى
    if (tabName === 'add') {
        document.getElementById('add-question-tab').classList.remove('hide');
        document.getElementById('manage-questions-tab').classList.add('hide');
    } else if (tabName === 'manage') {
        document.getElementById('add-question-tab').classList.add('hide');
        document.getElementById('manage-questions-tab').classList.remove('hide');
        updateQuestionsList(); // تحديث قائمة الأسئلة عند عرض التبويب
    }
}

// إعداد الأحداث عند تحميل الصفحة
// تهيئة مستمعي الأحداث
function initializeEventListeners() {
    // نموذج المتسابق
    const contestantForm = document.getElementById('contestant-form');
    if (contestantForm) {
        contestantForm.addEventListener('submit', (event) => {
            event.preventDefault();
            startQuiz();
        });
    }

    // زر لوحة الإدارة
    const adminButton = document.getElementById('admin-btn');
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hide');
            document.getElementById('admin-panel').classList.remove('hide');
        });
    }

    // زر العودة للرئيسية
    const backButton = document.getElementById('back-to-start');
    if (backButton) {
        backButton.addEventListener('click', () => {
            document.getElementById('admin-panel').classList.add('hide');
            document.getElementById('start-screen').classList.remove('hide');
        });
    }

    // زر السؤال التالي
    const nextButton = document.getElementById('next-btn');
    if (nextButton) {
        nextButton.addEventListener('click', nextQuestion);
    }

    // زر إعادة المسابقة
    const restartButton = document.getElementById('restart-btn');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            resetQuiz();
            startQuiz();
        });
    }

    // زر العودة للرئيسية من النتيجة
    const homeButton = document.getElementById('home-btn');
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            resetQuiz();
            document.getElementById('final-result').classList.add('hide');
            document.getElementById('start-screen').classList.remove('hide');
        });
    }

    // نموذج إضافة الأسئلة
    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', addQuestion);
    }

    // أزرار التبويب
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            showTab(tabId);
        });
    });
}

// عند تحميل الصفحة
window.onload = function() {
    // تحميل الأسئلة المحفوظة
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
        state.questions = JSON.parse(savedQuestions);
    }

    // ربط الأحداث بالأزرار
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.onclick = function() {
            hideAll();
            document.getElementById('admin-panel').classList.remove('hide');
        };
    }

    const contestantForm = document.getElementById('contestant-form');
    if (contestantForm) {
        contestantForm.onsubmit = function(e) {
            e.preventDefault();
            startQuiz();
        };
    }

    const backBtn = document.getElementById('back-to-start');
    if (backBtn) {
        backBtn.onclick = function() {
            hideAll();
            document.getElementById('start-screen').classList.remove('hide');
        };
    }

    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.onsubmit = function(e) {
            e.preventDefault();
            addQuestion();
        };
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = function() {
            const tabId = this.getAttribute('data-tab');
            console.log('تم النقر على التبويب:', tabId);
            showTab(tabId);
        };
    });
    
    initializeEventListeners();
    handleImageUpload();
};

    // إضافة مستمع لزر إلغاء التعديل
    const cancelButton = document.getElementById('reward-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            state.editingRewardId = null;
            state.tempImage = null;
            document.getElementById('reward-form').reset();
            document.getElementById('reward-submit').textContent = 'إضافة الجائزة';
            cancelButton.style.display = 'none';
            document.getElementById('image-preview').innerHTML = `
                <span class="material-icons upload-icon">cloud_upload</span>
                <span class="upload-text">اختر صورة</span>
            `;
        });
    }
    
    // نموذج بيانات المتسابق
    const contestantForm = document.getElementById('contestant-form');
    if (contestantForm) {
        contestantForm.addEventListener('submit', startQuiz);
    }

    document.getElementById('admin-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hide');
        document.getElementById('admin-panel').classList.remove('hide');
    });

    document.getElementById('back-to-start').addEventListener('click', () => {
        document.getElementById('admin-panel').classList.add('hide');
        document.getElementById('start-screen').classList.remove('hide');
    });

    document.getElementById('next-btn').addEventListener('click', nextQuestion);

    document.getElementById('restart-btn').addEventListener('click', () => {
        resetQuiz();
        startQuiz();
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        resetQuiz();
        document.getElementById('final-result').classList.add('hide');
        document.getElementById('start-screen').classList.remove('hide');
    });

    // نموذج إضافة السؤال
    document.getElementById('question-form').addEventListener('submit', addQuestion);
    
    // أزرار التبويب
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    // إضافة مستمع لنموذج الجوائز
    const rewardForm = document.getElementById('reward-form');
    if (rewardForm) {
        rewardForm.addEventListener('submit', addReward);
    }

// وظائف إدارة الجوائز
// addReward function is defined later (kept single definition)

function saveRewards() {
    localStorage.setItem('rewards', JSON.stringify(state.rewards));
}

function updateRewardsList() {
    const rewardsTable = document.getElementById('rewards-table');
    if (!rewardsTable) return;
    
    rewardsTable.innerHTML = '';
    
    const rewardsGrid = document.createElement('div');
    rewardsGrid.className = 'rewards-grid';
    
    state.rewards.forEach(reward => {
        const rewardCard = document.createElement('div');
        rewardCard.className = 'reward-card';
        rewardCard.innerHTML = `
            <div class="reward-image">
                ${reward.image ? `<img src="${reward.image}" alt="${reward.name}">` : 
                '<div class="no-image"><span class="material-icons">card_giftcard</span></div>'}
            </div>
            <div class="reward-content">
                <div class="reward-name">${reward.name}</div>
                <div class="reward-description">${reward.description}</div>
                <div class="reward-details">
                    <span class="reward-badge reward-score">الدرجة: ${reward.minScore}%</span>
                    <span class="reward-badge reward-quantity">العدد: ${reward.quantity}</span>
                </div>
                <div class="reward-actions">
                    <button onclick="editReward(${reward.id})" class="reward-btn" title="تعديل">
                        <span class="material-icons">edit</span>
                        تعديل
                    </button>
                    <button onclick="deleteReward(${reward.id})" class="reward-btn" title="حذف">
                        <span class="material-icons">delete</span>
                        حذف
                    </button>
                </div>
            </div>
        `;
        rewardsGrid.appendChild(rewardCard);
    });
    
    rewardsTable.appendChild(rewardsGrid);
}

// وظيفة معالجة تحميل الصور
function handleImageUpload() {
    const imageInput = document.getElementById('reward-image');
    const imagePreview = document.getElementById('image-preview');

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="معاينة الصورة">`;
                // تخزين الصورة في متغير مؤقت لاستخدامه عند الحفظ
                state.tempImage = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function addReward(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('reward-name');
    const descriptionInput = document.getElementById('reward-description');
    const scoreInput = document.getElementById('reward-score');
    const quantityInput = document.getElementById('reward-quantity');
    
    const reward = {
        id: state.editingRewardId || Date.now(),
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
        minScore: parseInt(scoreInput.value),
        quantity: parseInt(quantityInput.value),
        image: state.tempImage // إضافة الصورة إلى الجائزة
    };
    
    if (state.editingRewardId) {
        // تحديث جائزة موجودة
        const index = state.rewards.findIndex(r => r.id === state.editingRewardId);
        if (index !== -1) {
            state.rewards[index] = reward;
        }
        state.editingRewardId = null;
        document.getElementById('reward-submit').textContent = 'إضافة الجائزة';
        document.getElementById('reward-cancel').style.display = 'none';
    } else {
        // إضافة جائزة جديدة
        state.rewards.push(reward);
    }
    
    saveRewards();
    updateRewardsList();
    
    // إعادة تعيين النموذج والصورة المؤقتة
    document.getElementById('reward-form').reset();
    document.getElementById('image-preview').innerHTML = `
        <span class="material-icons upload-icon">cloud_upload</span>
        <span class="upload-text">اختر صورة</span>
    `;
    state.tempImage = null;
}

function editReward(id) {
    const reward = state.rewards.find(r => r.id === id);
    if (!reward) return;
    
    document.getElementById('reward-name').value = reward.name;
    document.getElementById('reward-description').value = reward.description;
    document.getElementById('reward-score').value = reward.minScore;
    document.getElementById('reward-quantity').value = reward.quantity;
    
    // حذف الجائزة القديمة
    deleteReward(id);
}

function deleteReward(id) {
    state.rewards = state.rewards.filter(r => r.id !== id);
    saveRewards();
    updateRewardsList();
}

// تحديث وظيفة showTab
function showTab(tabId) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('#add-question-tab, #manage-questions-tab, #rewards-tab').forEach(tab => {
        tab.classList.add('hide');
    });

    // إزالة التنشيط من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // عرض التبويب المحدد وتنشيط زره
    const selectedTab = document.getElementById(tabId);
    const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (selectedTab) {
        selectedTab.classList.remove('hide');
    }
    
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // تحديث قائمة الجوائز إذا تم اختيار تبويب الجوائز
    if (tabId === 'rewards-tab') {
        updateRewardsList();
    }

    console.log('تم تغيير التبويب إلى:', tabId);
}