/* jshint esversion:6 */
const { InferenceEngine, CVImage } = inferencejs;
const inferEngine = new InferenceEngine();

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const fpsDiv = document.getElementById("fps");
const screenshotBtn = document.getElementById("screenshotBtn");
const resultDiv = document.getElementById("result");

let workerId;
let prevTime;
let pastFrameTimes = [];
let frozen = false;
let frozenPredictions = [];

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getVideoBounds() {
  const rect = video.getBoundingClientRect();
  const scaleX = rect.width / video.videoWidth;
  const scaleY = rect.height / video.videoHeight;
  return { left: rect.left, top: rect.top, scaleX, scaleY };
}

async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Camera failed:", err);
    resultDiv.textContent = "Camera blocked!";
    return;
  }

  try {
    workerId = await inferEngine.startWorker(
      "cookerycook",
      "3",
      "rf_9rnPZutm29UbmMb8q5PxxoLv78n2"
    );
    console.log("Roboflow model loaded");
    document.body.classList.remove('loading');
    requestAnimationFrame(loop);
  } catch (err) {
    console.error("Model load error:", err);
    resultDiv.textContent = "Model failed to load!";
  }
}

async function loop() {
  if (!workerId || video.readyState < 2) {
    if (!frozen) requestAnimationFrame(loop);
    return;
  }

  try {
    let predictions;
    if (frozen) {
      predictions = frozenPredictions;
    } else {
      predictions = await inferEngine.infer(workerId, new CVImage(video));
      frozenPredictions = predictions;
    }

    const bounds = getVideoBounds();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(pred => {
      const { x, y, width, height } = pred.bbox;
      const boxX = bounds.left + (x - width / 2) * bounds.scaleX;
      const boxY = bounds.top + (y - height / 2) * bounds.scaleY;
      const boxW = width * bounds.scaleX;
      const boxH = height * bounds.scaleY;

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = "#00ff00";
      ctx.font = "16px sans-serif";
      ctx.fillText(pred.class, boxX + 4, boxY + 1);
    });

    if (!frozen) {
      // FPS calculation
      if (prevTime) {
        pastFrameTimes.push(Date.now() - prevTime);
        if (pastFrameTimes.length > 30) pastFrameTimes.shift();
        const total = pastFrameTimes.reduce((a, b) => a + b, 0) / 1000;
        fpsDiv.textContent = Math.round(pastFrameTimes.length / total) + " fps";
      }
      prevTime = Date.now();
      requestAnimationFrame(loop);
    }

  } catch (err) {
    console.error("Inference error:", err);
    if (!frozen) requestAnimationFrame(loop);
  }
}

// Freeze and check ingredient
screenshotBtn.addEventListener('click', async () => {
  frozen = true;
  video.pause();
  resultDiv.textContent = "Checking ingredient...";
  
  try {
    const predictions = await inferEngine.infer(workerId, new CVImage(video));
    frozenPredictions = predictions;

    if (predictions.length > 0) {
      // Pick the top prediction
      const top = predictions.reduce((max, p) => p.confidence > max.confidence ? p : max, predictions[0]);
      showConfirmation(top.class);
    } else {
      showNoIngredient();
    }
  } catch (err) {
    console.error("Inference error:", err);
    resultDiv.textContent = "Error checking ingredient!";
    setTimeout(resumeVideo, 1500);
  }
});

// Show confirmation for detected ingredient
function showConfirmation(ingredient) {
  resultDiv.innerHTML = `
    Add "${ingredient}"?<br>
    <img id="yesBtn" class="yes-btn" src="assets/buttons/yes_button.png" alt="Yes">
    <img id="noBtn" class="no-btn" src="assets/buttons/no_button.png" alt="No">
  `;

  document.getElementById("yesBtn").addEventListener("click", () => {
    addIngredient(ingredient);
  });

  document.getElementById("noBtn").addEventListener("click", () => {
    resumeVideo();
  });
}

function showNoIngredient() {
  resultDiv.innerHTML = `
    No ingredients detected.<br>Take another picture?<br>
    <img id="okBtn" class="ok-btn" src="assets/buttons/ok_button.png" alt="OK">
  `;
  document.getElementById("okBtn").addEventListener("click", () => {
    resumeVideo();
  });
}


// Resume video and detection
function resumeVideo() {
  frozen = false;
  video.play();
  resultDiv.textContent = "Waiting...";
  requestAnimationFrame(loop);
}

// Add ingredient function
function addIngredient(name) {
  let stored = JSON.parse(localStorage.getItem("fridgeIngredients") || "[]");
  if (!stored.includes(name)) {
    stored.push(name);
    localStorage.setItem("fridgeIngredients", JSON.stringify(stored));
  }
  resultDiv.textContent = `${name} added!`;
  resultDiv.style.color = "#00ff00";

  setTimeout(() => {
    window.location.href = "fridge.html";
  }, 1500);
}

init();
