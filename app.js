// =======================
// GLOBAL
// =======================
let currentColumn = 0;
let totalColumns = 20;
let timePerColumn = 5;

let numbers = [];
let results = [];

let timerInterval;
let timeLeft;

// =======================
// UTIL
// =======================
function mean(arr){
  return arr.reduce((a,b)=>a+b)/arr.length;
}

function stdDev(arr){
  let m = mean(arr);
  return Math.sqrt(arr.map(x => (x-m)**2).reduce((a,b)=>a+b)/arr.length);
}

function slope(y){
  let n = y.length;
  let x = [...Array(n).keys()];

  let sumX = x.reduce((a,b)=>a+b);
  let sumY = y.reduce((a,b)=>a+b);
  let sumXY = x.reduce((a,b,i)=>a + b*y[i],0);
  let sumX2 = x.reduce((a,b)=>a+b*b,0);

  return (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX);
}

function normalize(val, min, max){
  return ((val - min) / (max - min)) * 100;
}

// =======================
// TEST ENGINE
// =======================
function generateColumn() {
  numbers = [];
  for (let i = 0; i < 5; i++) {
    numbers.push(Math.floor(Math.random()*9));
  }
  document.getElementById("numbers").innerText = numbers.join(" ");
}

function startTest(){
  document.getElementById("testArea").style.display = "block";
  document.getElementById("resultArea").style.display = "none";

  currentColumn = 0;
  results = [];

  nextColumn();
}

function nextColumn(){

  if (currentColumn >= totalColumns){
    finishTest();
    return;
  }

  generateColumn();

  timeLeft = timePerColumn;
  document.getElementById("timer").innerText = timeLeft;

  timerInterval = setInterval(()=>{
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;

    if (timeLeft <= 0){
      clearInterval(timerInterval);
      saveResult(0);
      currentColumn++;
      nextColumn();
    }
  },1000);
}

function submitAnswer(){
  let answer = parseInt(document.getElementById("answer").value);

  clearInterval(timerInterval);

  saveResult(answer || 0);

  document.getElementById("answer").value = "";

  currentColumn++;
  nextColumn();
}

function saveResult(answer){

  let correct = 0;
  let wrong = 0;

  for (let i = 0; i < numbers.length - 1; i++) {
    let sum = numbers[i] + numbers[i+1];

    if (sum === answer) correct++;
    else wrong++;
  }

  results.push({
    col: currentColumn,
    correct,
    wrong,
    time: timePerColumn - timeLeft
  });
}

function finishTest(){
  document.getElementById("testArea").style.display = "none";
  document.getElementById("resultArea").style.display = "block";

  runAnalysis();
}

// =======================
// ML + ANALYSIS
// =======================
async function runAnalysis(){

  let speeds = results.map(r=>r.correct);
  let errors = results.map(r=>r.wrong);

  let meanSpeed = mean(speeds);
  let accuracy = results.reduce((a,b)=>a+b.correct,0) /
                 results.reduce((a,b)=>a+b.correct+b.wrong,0);

  let variability = stdDev(speeds);
  let trend = slope(speeds);
  let fatigue = mean(speeds.slice(-5)) - mean(speeds.slice(0,5));

  // psychological
  let endurance = trend - variability;
  let impulse = mean(errors);
  let focus = 1/(variability+1);
  let stress = accuracy - variability/10;

  let psych = {
    speed: normalize(meanSpeed,5,25),
    accuracy: normalize(accuracy,0.5,1),
    consistency: normalize(1/(variability+1),0,1),
    endurance: normalize(endurance,-5,5),
    impulse: normalize(1/(impulse+1),0,1),
    focus: normalize(focus,0,1),
    stress: normalize(stress,0,1)
  };

  // TensorFlow
  let input = tf.tensor2d([[meanSpeed, accuracy, variability, trend, fatigue]]);
  let model = tf.sequential();
  model.add(tf.layers.dense({units:8,inputShape:[5],activation:'relu'}));
  model.add(tf.layers.dense({units:4,activation:'relu'}));

  let vec = await model.predict(input).data();

  let profile = classify(vec, accuracy, variability, trend);
  let insight = generateInsight(psych);

  // UI
  document.getElementById("profile").innerHTML = "<b>"+profile+"</b>";
  document.getElementById("insight").innerText = insight;

  document.getElementById("metrics").innerHTML = `
    Speed: ${meanSpeed.toFixed(2)}<br>
    Accuracy: ${(accuracy*100).toFixed(1)}%<br>
    Stability: ${variability.toFixed(2)}<br>
    Trend: ${trend.toFixed(2)}<br>
    Fatigue: ${fatigue.toFixed(2)}
  `;

  // charts
  new Chart(document.getElementById("lineChart"), {
    type:'line',
    data:{
      labels: results.map(r=>r.col),
      datasets:[{label:"Performance", data:speeds}]
    }
  });

  new Chart(document.getElementById("radarChart"), {
    type:'radar',
    data:{
      labels:Object.keys(psych),
      datasets:[{label:"Profile", data:Object.values(psych)}]
    }
  });
}

// =======================
// CLASSIFY
// =======================
function classify(vec, acc, varb, trend){

  let score = vec[0] + vec[1] - vec[2];

  if (score > 5 && acc > 0.9)
    return "High Performer Stabil";

  if (acc < 0.8)
    return "Impulsif";

  if (trend < 0)
    return "Fatigue";

  if (varb > 3)
    return "Tidak stabil";

  return "Rata-rata";
}

// =======================
// INSIGHT
// =======================
function generateInsight(p){

  let t = "";

  t += (p.speed>70) ? "Cepat. " : "Sedang. ";
  t += (p.accuracy>80) ? "Teliti. " : "Kurang teliti. ";
  t += (p.consistency>50) ? "Stabil. " : "Fluktuatif. ";
  t += (p.endurance>50) ? "Tahan kerja. " : "Mudah lelah. ";
  t += (p.impulse>50) ? "Kontrol baik. " : "Impulsif. ";
  t += (p.focus>50) ? "Fokus baik. " : "Fokus lemah. ";
  t += (p.stress>50) ? "Tahan tekanan." : "Sensitif tekanan.";

  return t;
}
