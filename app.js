// =======================
// INIT (AMAN)
// =======================
window.onload = function(){

  document.getElementById("startBtn").addEventListener("click", startTest);
  document.getElementById("submitBtn").addEventListener("click", submitAnswer);

};

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
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function stdDev(arr){
  let m = mean(arr);
  return Math.sqrt(arr.map(x => (x-m)**2).reduce((a,b)=>a+b,0)/arr.length);
}

function slope(y){
  let n = y.length;
  let x = [...Array(n).keys()];
  let sumX = x.reduce((a,b)=>a+b,0);
  let sumY = y.reduce((a,b)=>a+b,0);
  let sumXY = x.reduce((a,b,i)=>a + b*y[i],0);
  let sumX2 = x.reduce((a,b)=>a+b*b,0);

  return (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX);
}

function normalize(val, min, max){
  return Math.max(0, Math.min(100, ((val - min)/(max-min))*100));
}

// =======================
// TEST ENGINE
// =======================
function generateColumn(){
  numbers = [];
  for(let i=0;i<5;i++){
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

  if(currentColumn >= totalColumns){
    finishTest();
    return;
  }

  generateColumn();

  timeLeft = timePerColumn;
  document.getElementById("timer").innerText = timeLeft;

  timerInterval = setInterval(()=>{
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;

    if(timeLeft <= 0){
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

  for(let i=0;i<numbers.length-1;i++){
    let sum = numbers[i] + numbers[i+1];

    if(sum === answer) correct++;
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
// ANALYSIS (SMART AI-LIKE)
// =======================
function runAnalysis(){

  let speeds = results.map(r=>r.correct);
  let errors = results.map(r=>r.wrong);

  let meanSpeed = mean(speeds);
  let accuracy = results.reduce((a,b)=>a+b.correct,0) /
                 results.reduce((a,b)=>a+b.correct+b.wrong,0);

  let variability = stdDev(speeds);
  let trend = slope(speeds);
  let fatigue = mean(speeds.slice(-5)) - mean(speeds.slice(0,5));

  // psychological scoring
  let psych = {
    speed: normalize(meanSpeed,5,25),
    accuracy: normalize(accuracy,0.5,1),
    consistency: normalize(1/(variability+1),0,1),
    endurance: normalize(trend,-2,2),
    focus: normalize(1/(variability+1),0,1),
    stress: normalize(accuracy - variability/10,0,1)
  };

  let profile = classify(psych);
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

  renderCharts(speeds, psych);
}

// =======================
// CLASSIFICATION
// =======================
function classify(p){

  if(p.speed>70 && p.accuracy>80 && p.consistency>60)
    return "High Performer Stabil";

  if(p.speed>70 && p.accuracy<60)
    return "Cepat tapi kurang teliti";

  if(p.endurance<40)
    return "Mudah lelah";

  if(p.consistency<40)
    return "Tidak konsisten";

  return "Performa rata-rata";
}

// =======================
// INSIGHT
// =======================
function generateInsight(p){

  let t = "";

  t += (p.speed>70) ? "Kecepatan tinggi. " : "Kecepatan cukup. ";
  t += (p.accuracy>80) ? "Sangat teliti. " : "Perlu ketelitian. ";
  t += (p.consistency>50) ? "Stabil. " : "Fluktuatif. ";
  t += (p.endurance>50) ? "Tahan kerja. " : "Cenderung lelah. ";
  t += (p.focus>50) ? "Fokus baik. " : "Fokus lemah. ";
  t += (p.stress>50) ? "Tahan tekanan." : "Sensitif tekanan.";

  return t;
}

// =======================
// CHARTS
// =======================
function renderCharts(speeds, psych){

  new Chart(document.getElementById("lineChart"), {
    type:'line',
    data:{
      labels:speeds.map((_,i)=>i+1),
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
