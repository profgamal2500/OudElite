// تهيئة حالة التطبيق
let state = {
    questions: [],
    currentQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    contestant: {
        name: '',
        phone: ''
    }
};

// تحميل الأسئلة عند بدء التطبيق
function init() {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
        state.questions = JSON.parse(savedQuestions);
    }
    // تحميل الجوائز إن وجدت
    loadRewards();
    bindEvents();
    // عرض الجوائز إن كان تبويب الجوائز مفعلًا
    if (document.querySelector('.tab-btn[data-tab="rewards-tab"].active')) {
        displayRewards();
    }
}

// ربط الأحداث
function bindEvents() {
    // لوحة التحكم
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.onclick = showAdminPanel;
    }

    // نموذج المتسابق
    const contestantForm = document.getElementById('contestant-form');
    if (contestantForm) {
        contestantForm.onsubmit = function(e) {
            e.preventDefault();
            startQuiz();
        };
    }

    // نموذج إضافة الأسئلة
    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.onsubmit = function(e) {
            e.preventDefault();
            addQuestion();
        };
    }

    // زر العودة للرئيسية في نتيجة المسابقة
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.onclick = showStartScreen;
    }

    // زر التالي في المسابقة
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.onclick = function() {
            state.currentQuestionIndex++;
            showQuestion();
        };
    }

    // أزرار التبديل بين علامات التبويب
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.onclick = function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        };
    });

    // العودة للرئيسية
    const backBtn = document.getElementById('back-to-start');
    if (backBtn) {
        backBtn.onclick = showStartScreen;
    }

    // نموذج إضافة الجوائز
    const rewardForm = document.getElementById('reward-form');
    if (rewardForm) {
        rewardForm.onsubmit = handleRewardFormSubmit;
    }
    
    // التحكم في تشغيل/إيقاف موسيقى الاحتفال
    
    const musicCheckbox = document.getElementById('enable-celebration-music');
    const musicStatus = document.getElementById('music-status');
    if (musicCheckbox && musicStatus) {
        musicCheckbox.onchange = function() {
            if (typeof setMusicEnabled === 'function') {
                setMusicEnabled(this.checked);
                musicStatus.textContent = this.checked ? 'مفعّل' : 'معطّل';
            }
        };
    }
}

// وظائف التنقل والتبديل بين علامات التبويب
function showAdminPanel() {
    // إيقاف الاحتفالات عند فتح لوحة التحكم
    if (typeof stopConfettiCelebration === 'function') stopConfettiCelebration();
    if (typeof stopFireworks === 'function') stopFireworks();
    if (typeof stopBalloons === 'function') stopBalloons();
    if (typeof stopCelebrationMusic === 'function') stopCelebrationMusic();
    
    // إظهار نافذة كلمة المرور
    const passwordModal = document.getElementById('password-modal');
    passwordModal.classList.remove('hide');
    passwordModal.classList.add('show');
    
    const form = document.getElementById('admin-password-form');
    const passwordInput = document.getElementById('admin-password');
    const cancelBtn = document.getElementById('cancel-password');
    
    // تركيز على حقل كلمة المرور
    passwordInput.focus();
    
    // معالج إلغاء النافذة
    function closeModal() {
        passwordModal.classList.remove('show');
        passwordModal.classList.add('hide');
        passwordInput.value = ''; // مسح كلمة المرور
    }
    
    // إضافة معالج الإلغاء
    cancelBtn.onclick = closeModal;
    
    // معالج تقديم النموذج
        form.onsubmit = function(e) {
            e.preventDefault();
            const correctPassword = 'SN@2008++';
            const inputValue = passwordInput.value.trim();
            if (!inputValue) {
                alert('يرجى إدخال كلمة المرور');
                passwordInput.focus();
                return;
            }
            console.log('قيمة كلمة المرور المدخلة:', inputValue);
            if (inputValue === correctPassword) {
                closeModal();
                hideAll();
                document.getElementById('admin-panel').classList.remove('hide');
                // عرض علامة التبويب النشطة
                const activeTab = document.querySelector('.tab-btn.active');
                if (activeTab) {
                    switchTab(activeTab.getAttribute('data-tab'));
                }
            } else {
                alert('كلمة المرور غير صحيحة');
                passwordInput.value = '';
                passwordInput.focus();
            }
        };
}

function switchTab(tabId) {
    // إزالة الحالة النشطة من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إضافة الحالة النشطة للزر المحدد
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // إخفاء جميع المحتويات
    document.querySelectorAll('#add-question-tab, #manage-questions-tab, #rewards-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // إظهار المحتوى المحدد
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // تحديث عرض الأسئلة أو الجوائز حسب التبويب المحدد
    if (tabId === 'manage-questions-tab') {
        showQuestions();
    } else if (tabId === 'rewards-tab') {
        displayRewards();
    }
}

// وظائف إدارة الأسئلة
function addQuestion() {
    const questionText = document.getElementById('new-question').value.trim();
    const answers = [
        document.getElementById('answer1').value.trim(),
        document.getElementById('answer2').value.trim(),
        document.getElementById('answer3').value.trim(),
        document.getElementById('answer4').value.trim()
    ];
    
    const correctAnswer = document.querySelector('input[name="correct"]:checked');
    
    if (!questionText || answers.some(a => !a)) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    if (!correctAnswer) {
        alert('يرجى اختيار الإجابة الصحيحة');
        return;
    }
    
    const question = {
        id: Date.now().toString(),
        question: questionText,
        answers: answers,
        correctAnswer: parseInt(correctAnswer.value)
    };
    
    if (!Array.isArray(state.questions)) {
        state.questions = [];
    }
    
    state.questions.push(question);
    localStorage.setItem('questions', JSON.stringify(state.questions));
    
    document.getElementById('question-form').reset();
    alert('تم إضافة السؤال بنجاح');
    
    // تحديث عرض الأسئلة
    if (document.getElementById('manage-questions-tab').style.display !== 'none') {
        showQuestions();
    }
}

// ===== إدارة الجوائز =====
function loadRewards() {
    const saved = localStorage.getItem('rewards');
    if (saved) {
        try {
            state.rewards = JSON.parse(saved);
        } catch (e) {
            state.rewards = [];
        }
    } else {
        state.rewards = [];
    }
}

function saveRewards() {
    localStorage.setItem('rewards', JSON.stringify(state.rewards || []));
}

function displayRewards() {
    const listEl = document.getElementById('rewards-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!Array.isArray(state.rewards) || state.rewards.length === 0) {
        listEl.innerHTML = '<p>لا توجد جوائز مضافة بعد.</p>';
        return;
    }

    state.rewards.forEach((r) => {
        const item = document.createElement('div');
        item.className = 'reward-item';

        const img = document.createElement('img');
        img.className = 'reward-img';
        img.alt = r.title || 'جائزة';
        img.src = r.image || '';
        item.appendChild(img);

        const title = document.createElement('div');
        title.className = 'reward-title';
        title.textContent = r.title || '';
        item.appendChild(title);

        const delBtn = document.createElement('button');
        delBtn.className = 'btn delete-btn';
        delBtn.textContent = 'حذف';
        delBtn.onclick = function() { deleteReward(r.id); };
        item.appendChild(delBtn);

        listEl.appendChild(item);
    });
}

function deleteReward(id) {
    if (!confirm('هل تريد حذف هذه الجائزة؟')) return;
    state.rewards = (state.rewards || []).filter(r => r.id !== id);
    saveRewards();
    displayRewards();
}

function handleRewardFormSubmit(e) {
    e.preventDefault();
    const titleEl = document.getElementById('reward-title');
    const fileEl = document.getElementById('reward-image');
    
    // التحقق من إدخال اسم الجائزة
    if (!titleEl || !titleEl.value || titleEl.value.trim() === '') {
        alert('يجب إدخال اسم الجائزة');
        titleEl.focus();
        return;
    }

    // التحقق من إدخال صورة
    if (!fileEl || !fileEl.files || !fileEl.files[0]) {
        alert('يجب اختيار صورة للجائزة');
        return;
    }

    const title = titleEl.value.trim();
    const file = fileEl && fileEl.files && fileEl.files[0];

    const newReward = { id: Date.now().toString(), title: title, image: '' };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            newReward.image = ev.target.result;
            state.rewards = state.rewards || [];
            state.rewards.push(newReward);
            saveRewards();
            displayRewards();
            document.getElementById('reward-form').reset();
            alert('تم إضافة الجائزة');
        };
        reader.readAsDataURL(file);
    } else {
        // إضافة بدون صورة
        state.rewards = state.rewards || [];
        state.rewards.push(newReward);
        saveRewards();
        displayRewards();
        document.getElementById('reward-form').reset();
        alert('تم إضافة الجائزة');
    }
}
function showQuestions() {
    const container = document.getElementById('manage-questions-tab');
    if (!container) return;

    let html = '<div class="questions-list">';
    if (state.questions && state.questions.length > 0) {
        state.questions.forEach((q, index) => {
            html += `
                <div class="question-item">
                    <div class="question-header">
                        <span class="question-number">سؤال ${index + 1}</span>
                        <div class="question-actions">
                            <button onclick="editQuestion('${q.id}')" class="btn-icon">
                                <span class="material-icons">edit</span>
                            </button>
                            <button onclick="deleteQuestion('${q.id}')" class="btn-icon">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                    <div class="question-text">${q.question}</div>
                    <div class="answers-list">
                        ${q.answers.map((answer, i) => `
                            <div class="answer-item ${i === q.correctAnswer ? 'correct' : ''}">
                                ${answer}
                                ${i === q.correctAnswer ? '<span class="material-icons">check_circle</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    } else {
        html += '<div class="no-questions">لا توجد أسئلة مضافة بعد</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function deleteQuestion(id) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
        state.questions = state.questions.filter(q => q.id !== id);
        localStorage.setItem('questions', JSON.stringify(state.questions));
        showQuestions();
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
        
        // التبديل إلى علامة تبويب إضافة السؤال
        switchTab('add-question-tab');
    }
}

function showStartScreen() {
    // إيقاف الاحتفالات عند العودة للشاشة الرئيسية
    if (typeof stopConfettiCelebration === 'function') stopConfettiCelebration();
    if (typeof stopFireworks === 'function') stopFireworks();
    if (typeof stopBalloons === 'function') stopBalloons();
    if (typeof stopCelebrationMusic === 'function') stopCelebrationMusic();
    
    hideAll();
    document.getElementById('start-screen').classList.remove('hide');
}

function hideAll() {
    [
        'start-screen',
        'quiz-container',
        'admin-panel',
        'final-result'
    ].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hide');
        }
    });
}

// وظائف المسابقة
function startQuiz() {
    const nameInput = document.getElementById('contestant-name');
    const phoneInput = document.getElementById('contestant-phone');

    // التحقق من المدخلات
    if (!nameInput || !phoneInput || !nameInput.value.trim() || !phoneInput.value.trim()) {
        alert('يرجى إدخال الاسم ورقم الجوال');
        return;
    }

    // التحقق من صحة رقم الجوال
    if (!/^[0-9]{10}$/.test(phoneInput.value)) {
        alert('يرجى إدخال رقم جوال صحيح من 10 أرقام');
        return;
    }

    // التحقق من وجود أسئلة
    if (!state.questions || state.questions.length === 0) {
        alert('لا توجد أسئلة متاحة. يرجى إضافة أسئلة أولاً.');
        return;
    }

    // إيقاف الاحتفالات فوراً عند بدء المسابقة
    if (typeof stopConfettiCelebration === 'function') stopConfettiCelebration();
    if (typeof stopFireworks === 'function') stopFireworks();
    if (typeof stopBalloons === 'function') stopBalloons();
    if (typeof stopCelebrationMusic === 'function') stopCelebrationMusic();

    // حفظ بيانات المتسابق
    state.contestant = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    // تفريغ حقول الإدخال
    nameInput.value = '';
    phoneInput.value = '';

    // تجهيز الأسئلة
    state.currentQuestions = [...state.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(5, state.questions.length));
    
    state.currentQuestionIndex = 0;
    state.score = 0;

    // عرض شاشة المسابقة
    hideAll();
    document.getElementById('quiz-container').classList.remove('hide');
    showQuestion();
}

function showQuestion() {
    const question = state.currentQuestions[state.currentQuestionIndex];
    if (!question) {
        showFinalResult();
        return;
    }

    // عرض السؤال
    const questionElement = document.getElementById('question');
    questionElement.textContent = `السؤال ${state.currentQuestionIndex + 1} من ${state.currentQuestions.length}: ${question.question}`;

    // عرض الخيارات
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.className = 'btn';
        button.onclick = () => selectAnswer(index);
        buttonsContainer.appendChild(button);
    });

    // إخفاء النتيجة وزر التالي
    document.getElementById('answer-result').classList.add('hide');
    document.getElementById('next-btn').classList.add('hide');
}

function selectAnswer(index) {
    const question = state.currentQuestions[state.currentQuestionIndex];
    const buttons = document.getElementById('answer-buttons').children;
    const resultElement = document.getElementById('answer-result');

    // تعطيل جميع الأزرار
    Array.from(buttons).forEach(btn => btn.disabled = true);

    // التحقق من الإجابة
    const isCorrect = index === question.correctAnswer;
    if (isCorrect) {
        state.score++;
        buttons[index].classList.add('correct');
        resultElement.querySelector('.result-icon').textContent = '✓';
        resultElement.querySelector('.result-text').textContent = 'إجابة صحيحة!';
    } else {
        buttons[index].classList.add('wrong');
        buttons[question.correctAnswer].classList.add('correct');
        resultElement.querySelector('.result-icon').textContent = '✕';
        resultElement.querySelector('.result-text').textContent = 
            `إجابة خاطئة! الإجابة الصحيحة هي: ${question.answers[question.correctAnswer]}`;
    }

    // تحديث النتيجة
    document.getElementById('score').textContent = 
        `النتيجة: ${state.score} من ${state.currentQuestions.length}`;

    // إظهار النتيجة وزر التالي
    resultElement.classList.remove('hide');
    
    // إظهار زر التالي أو إظهار النتيجة النهائية
    const nextBtn = document.getElementById('next-btn');
    if (state.currentQuestionIndex < state.currentQuestions.length - 1) {
        nextBtn.classList.remove('hide');
        nextBtn.disabled = false;
    } else {
        // إذا كان هذا آخر سؤال، عرض النتيجة النهائية بعد ثانيتين
        setTimeout(showFinalResult, 2000);
    }
}

function showFinalResult() {
    hideAll();
    const finalResult = document.getElementById('final-result');
    finalResult.classList.remove('hide');

    const totalQuestions = state.currentQuestions.length;
    const answeredQuestions = state.currentQuestionIndex + 1;
    const percentage = ((state.score / totalQuestions) * 100).toFixed(1);
    const completedAllQuestions = answeredQuestions >= totalQuestions;
    
    let resultHTML = '';
    
    if (completedAllQuestions && Number(percentage) >= 100) {
        // اختيار جائزة عشوائية
        const rewards = JSON.parse(localStorage.getItem('rewards') || '[]');
        let randomReward = null;
        if (rewards.length > 0) {
            randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        }

        // عرض شاشة النجاح الكامل مع الجائزة
        resultHTML = `
            <div class="celebration-header">
                <h1>تهانينا! 🎉</h1>
            </div>
            <div class="score-display">${percentage}%</div>
            <div class="celebration-text">أداء رائع! ⭐</div>`;

    if (randomReward) {
            resultHTML += `
                <div class="reward-celebration">
                    <h3 class="reward-win-text">مبررررروك! لقد ربحت جائزة! 🎁</h3>
                    <img src="${randomReward.image}" alt="${randomReward.title}" class="reward-win-image">
                    <div class="reward-win-title">${randomReward.title}</div>
                </div>`;
            
            // إظهار البالونات فوراً مع النتيجة
            const container = document.createElement('div');
            container.className = 'balloons-container';
            document.body.appendChild(container);
            
            // عدد البالونات وتوزيعها
            const numBalloons = 20; // زيادة عدد البالونات
            const screenWidth = window.innerWidth;
            
            // دالة لإنشاء موقع عشوائي للبالون
            function createRandomBalloon(index) {
                const balloon = document.createElement('div');
                balloon.className = `balloon balloon-${(Math.floor(Math.random() * 6) + 1)}`;
                
                // موقع عشوائي على عرض الشاشة
                const randomX = Math.random() * (screenWidth - 100);
                balloon.style.left = `${randomX}px`;
                
                // تأخير عشوائي قصير لكل بالون
                const randomDelay = Math.random() * 0.5; // تأخير عشوائي بين 0 و 0.5 ثانية
                balloon.style.animationDelay = `${randomDelay}s`;
                
                return balloon;
            }
            
            // إضافة البالونات بشكل متتابع سريع
            let balloonsAdded = 0;
            const addInterval = setInterval(() => {
                if (balloonsAdded >= numBalloons) {
                    clearInterval(addInterval);
                    return;
                }
                
                const balloon = createRandomBalloon(balloonsAdded);
                container.appendChild(balloon);
                balloonsAdded++;
            }, 50); // إضافة بالون كل 50 مللي ثانية
            
            // تشغيل الاحتفالات بشكل دائم حتى الخروج من الشاشة
            if (typeof startBalloons === 'function') startBalloons();
            if (typeof startFireworks === 'function') startFireworks();
            if (typeof startConfettiCelebration === 'function') setTimeout(() => startConfettiCelebration(), 300);
            // ????? ???????? ??????????
            if (typeof playCelebrationMusic === 'function') playCelebrationMusic();
        }

    } else if (completedAllQuestions) {
        // أكمل جميع الأسئلة ولكن لم يحصل على 100%
        resultHTML = `
            <div class="better-luck">
                <h1>حظ أوفر المرة القادمة</h1>
            </div>
            <div class="score-display">${percentage}%</div>
                <p class="try-again-text">الرجاء المحاولة مرة أخرى لتحسين نتيجتك.</p>
            </div>`;
    } else {
        // لم يكمل جميع الأسئلة
        resultHTML = `
            <div class="incomplete-message">
                <div class="progress-info">
                    <span class="material-icons">assignment</span>
                    <div class="progress-text">
                        أجبت على ${answeredQuestions} من ${totalQuestions} أسئلة
                    </div>
                </div>
                <div class="encouragement-text">
                    لا تستسلم! 💪 
                    <br>
                    نشجعك على المحاولة مرة أخرى لإكمال جميع الأسئلة
                    <br>
                    <span class="try-again-text">الرجاء المحاولة مرة أخرى لاحقاً</span>
                </div>
            </div>`;
    }

    resultHTML += `
        <div class="contestant-info">
            <div class="contestant-detail">الاسم: ${state.contestant.name}</div>
            <div class="contestant-detail">رقم الجوال: ${state.contestant.phone}</div>
        </div>
        <div class="result-buttons">
            <button id="home-btn" class="btn">العودة للرئيسية</button>
        </div>`;

    finalResult.innerHTML = resultHTML;

    // بعد إعادة بناء المحتوى بـ innerHTML، نحتاج لإرفاق مستمعي النقر للأزرار
    const homeBtnEl = document.getElementById('home-btn');
    if (homeBtnEl) {
        homeBtnEl.addEventListener('click', function (e) {
            e.preventDefault();
            // إيقاف الاحتفالات عند مغادرة الشاشة
            if (typeof stopConfettiCelebration === 'function') stopConfettiCelebration();
            if (typeof stopFireworks === 'function') stopFireworks();
            if (typeof stopBalloons === 'function') stopBalloons();
            showStartScreen();
        });
    }
}

function restartQuiz() {
    state.currentQuestionIndex = 0;
    state.score = 0;
    startQuiz();
}

// تشغيل التطبيق
window.onload = init;

// وظائف إضافة الأسئلة
function addQuestion() {
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
    
    const question = {
        id: Date.now().toString(),
        question: questionText,
        answers: answers,
        correctAnswer: parseInt(correctAnswer.value)
    };
    
    state.questions.push(question);
    localStorage.setItem('questions', JSON.stringify(state.questions));
    
    document.getElementById('question-form').reset();
    alert('تم إضافة السؤال بنجاح');
}
