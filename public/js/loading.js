(function () {
  const STAGE_DURATION = 5000; // ms per stage
  const TEXT_INTERVAL = 1500;  // ms between cycling text

  const CYCLING_TEXT = [
    // Stage 0: Data Ingestion
    [
      'Parsing building envelope parameters...',
      'Ingesting occupancy schedule metadata...',
      'Normalizing input variables...'
    ],
    // Stage 1: Load Disaggregation
    [
      'Isolating space heating signature...',
      'Decomposing cooling load harmonics...',
      'Extracting domestic hot water profile...'
    ],
    // Stage 2: Baseline Synthesis
    [
      'Correlating thermal decay curves...',
      'Fitting change-point regression model...',
      'Applying IPMVP Option C methodology...'
    ],
    // Stage 3: Validation
    [
      'Cross-referencing ASHRAE 211 benchmarks...',
      'Running Monte Carlo uncertainty analysis...',
      'Verifying degree-day normalization...'
    ],
    // Stage 4: Report Generation
    [
      'Compiling baseline energy signature...',
      'Generating unique facility profile...',
      'Preparing your baseline...'
    ]
  ];

  const stageEls = document.querySelectorAll('.loading-stage');
  const progressFill = document.getElementById('progress-fill');
  const subtextEl = document.getElementById('subtext');
  const totalStages = stageEls.length;

  let currentStage = -1;
  let textIndex = 0;
  let textTimer = null;

  function setStageState(stageIndex, state) {
    const el = stageEls[stageIndex];
    const iconContainer = el.querySelector('.stage-icon');

    el.classList.remove('active', 'complete');

    if (state === 'active') {
      el.classList.add('active');
      iconContainer.innerHTML = '<span class="stage-icon-active"></span>';
    } else if (state === 'complete') {
      el.classList.add('complete');
      iconContainer.innerHTML = '<span class="stage-icon-check">\u2713</span>';
    } else {
      iconContainer.innerHTML = '<span class="stage-icon-pending"></span>';
    }
  }

  function startTextCycling(stageIndex) {
    const texts = CYCLING_TEXT[stageIndex];
    textIndex = 0;
    subtextEl.textContent = texts[0];

    if (textTimer) clearInterval(textTimer);
    textTimer = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      subtextEl.style.opacity = '0';
      setTimeout(() => {
        subtextEl.textContent = texts[textIndex];
        subtextEl.style.opacity = '1';
      }, 150);
    }, TEXT_INTERVAL);
  }

  function advanceStage() {
    // Complete previous stage
    if (currentStage >= 0) {
      setStageState(currentStage, 'complete');
    }

    currentStage++;

    if (currentStage >= totalStages) {
      // All done
      if (textTimer) clearInterval(textTimer);
      subtextEl.textContent = 'Complete.';
      progressFill.style.width = '100%';

      // Redirect after brief pause
      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem('bassline-redirect');
        sessionStorage.removeItem('bassline-redirect');
        window.location.href = redirectUrl || '/';
      }, 1500);
      return;
    }

    // Activate current stage
    setStageState(currentStage, 'active');
    startTextCycling(currentStage);

    // Update progress bar
    const progress = ((currentStage + 1) / totalStages) * 100;
    progressFill.style.width = `${progress}%`;

    // Schedule next stage
    setTimeout(advanceStage, STAGE_DURATION);
  }

  // Start the animation
  advanceStage();
})();
