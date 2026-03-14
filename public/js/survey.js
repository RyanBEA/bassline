(async function () {
  const questionArea = document.getElementById('question-area');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');

  let questions = [];
  let currentIndex = 0;
  const answers = []; // answers[i] = selected option value for question i

  try {
    const res = await fetch('/api/questions');
    questions = await res.json();
  } catch {
    questionArea.innerHTML = '<p>Failed to load questions. Please refresh.</p>';
    return;
  }

  function showQuestion(index) {
    currentIndex = index;
    const q = questions[index];
    progressText.textContent = `Question ${index + 1} of ${questions.length}`;
    progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;

    questionArea.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'survey-question';

    const text = document.createElement('p');
    text.className = 'survey-question-text';
    text.textContent = q.text;
    div.appendChild(text);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'survey-options';

    for (const opt of q.options) {
      const btn = document.createElement('button');
      btn.className = 'survey-option';
      if (answers[index] === opt.value) {
        btn.classList.add('selected');
      }
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        answers[index] = opt.value;
        // Update selection styling
        optionsDiv.querySelectorAll('.survey-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateNav();
      });
      optionsDiv.appendChild(btn);
    }

    div.appendChild(optionsDiv);

    // Navigation buttons
    const nav = document.createElement('div');
    nav.className = 'survey-nav';

    if (index > 0) {
      const backBtn = document.createElement('button');
      backBtn.className = 'survey-nav-btn';
      backBtn.textContent = 'Back';
      backBtn.addEventListener('click', () => showQuestion(index - 1));
      nav.appendChild(backBtn);
    } else {
      // Spacer to keep Next aligned right
      nav.appendChild(document.createElement('span'));
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'survey-nav-btn survey-nav-next';
    nextBtn.textContent = index === questions.length - 1 ? 'Submit' : 'Next';
    nextBtn.disabled = answers[index] === undefined;
    nextBtn.addEventListener('click', async () => {
      if (index < questions.length - 1) {
        showQuestion(index + 1);
      } else {
        await submitAnswers();
      }
    });
    nav.appendChild(nextBtn);

    div.appendChild(nav);
    questionArea.appendChild(div);

    function updateNav() {
      nextBtn.disabled = answers[index] === undefined;
    }

    requestAnimationFrame(() => {
      div.classList.add('active');
    });
  }

  async function submitAnswers() {
    questionArea.innerHTML = '<p class="survey-question-text">Processing...</p>';

    try {
      const res = await fetch('/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();

      sessionStorage.setItem('bassline-redirect', data.redirectUrl);
      window.location.href = '/loading';
    } catch {
      questionArea.innerHTML = '<p class="survey-question-text">Something went wrong. Please refresh.</p>';
    }
  }

  showQuestion(0);
})();
