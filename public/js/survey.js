(async function () {
  const questionArea = document.getElementById('question-area');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');

  let questions = [];
  let currentIndex = 0;
  const answers = [];

  try {
    const res = await fetch('/api/questions');
    questions = await res.json();
  } catch {
    questionArea.innerHTML = '<p>Failed to load questions. Please refresh.</p>';
    return;
  }

  function showQuestion(index) {
    const q = questions[index];
    progressText.textContent = `Question ${index + 1} of ${questions.length}`;
    progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;

    // Clear and rebuild
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
      btn.textContent = opt.label;
      btn.addEventListener('click', () => selectAnswer(opt.value));
      optionsDiv.appendChild(btn);
    }

    div.appendChild(optionsDiv);
    questionArea.appendChild(div);

    // Trigger transition
    requestAnimationFrame(() => {
      div.classList.add('active');
    });
  }

  async function selectAnswer(value) {
    answers.push(value);

    if (answers.length < questions.length) {
      currentIndex++;
      showQuestion(currentIndex);
    } else {
      await submitAnswers();
    }
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

      // Store redirect URL for the loading page
      sessionStorage.setItem('bassline-redirect', data.redirectUrl);
      window.location.href = '/loading';
    } catch {
      questionArea.innerHTML = '<p class="survey-question-text">Something went wrong. Please refresh.</p>';
    }
  }

  showQuestion(0);
})();
