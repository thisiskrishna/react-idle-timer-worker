let timer;
let timeOutInterval = 4000;
let countDownOutInterval = 10;
let countDownTimer;
let lastInteractionTime;

const startTimer = () => {
  countDownOutStarted = false;
  countTimer = countDownOutInterval;
  if (timer) {
    clearInterval(timer);
    clearInterval(countDownTimer);
  }
  timer = setInterval(() => {
    postMessage(`updateLastInteractionTime`);
    const diff = new Date().valueOf() - (+lastInteractionTime);
    if (diff < timeOutInterval) {
      postMessage("onActive");
    } else if(!countDownOutStarted) {
      countDownOutStarted = true;
      postMessage("onIdle");
    } else {
      minutes = parseInt(countTimer / 60, 10);
      seconds = parseInt(countTimer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      postMessage(`countDown:${minutes + ":" + seconds}`);
      if (--countTimer < 0) {
          clearInterval(timer);
          postMessage('countDownCompleted');
      }
    }
  }, 1000);
};

onmessage = (e) => {
  if(e.data.key === 'startTimer') {
    postMessage("onActive");
    lastInteractionTime = e.data.value || new Date().valueOf();
    startTimer();
  }
  if (e.data.key === 'userInteracted') {
    postMessage("onActive");
    lastInteractionTime = new Date().valueOf();
    startTimer();
  } else if (e.data.key === 'timeOutInterval') {
    timeOutInterval = e.data.value * 1000;
  } else if (e.data.key === 'countDownOutInterval') {
    countDownOutInterval = e.data.value;
  } else if (e.data.key === 'lastInteractionTimeUpdated') {
    lastInteractionTime = e.data.value || new Date().valueOf();
  }
};
