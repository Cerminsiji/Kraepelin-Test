// =======================
// 1. SIMULASI DATA
// (GANTI DENGAN DATA ASLI)
// =======================
let results = [];
for (let i = 0; i < 30; i++) {
  results.push({
    col: i+1,
    correct: Math.floor(Math.random()*10)+10,
    wrong: Math.floor(Math.random()*5),
    time: 15
  });
}

// =======================
// 2. UTIL
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
// 3. FEATURE ENGINEERING
// =======================
let speeds = results.map(r=>r.correct);
let errors = results.map(r=>r.wrong);

let meanSpeed = mean(speeds);
let accuracy = results.reduce((a,b)=>a+b.correct,0) /
               results.reduce((a,b)=>a+b.correct+b.wrong,0);

let variability = stdDev(speeds);
let trend = slope(speeds);
let fatigue = mean(speeds.slice(-5)) - mean(speeds.slice(0,5));

// =======================
// 4. PSYCHOLOGICAL MODEL
// =======================
let endurance = trend - variability;
let impulse = mean(errors);
let focus = 1 / (variability + 1);
let stress = accuracy - variability/10;

let psych = {
  speed: normalize(meanSpeed, 5, 25),
  accuracy: normalize(accuracy, 0.5, 1),
  consistency: normalize(1/(variability+1), 0, 1),
  endurance: normalize(endurance, -5, 5),
  impulse: normalize(1/(impulse+1), 0, 1),
  focus: normalize(focus, 0, 1),
  stress: normalize(stress, 0, 1)
};

// =======================
// 5. ML (TensorFlow.js)
// =======================
async function runML(){

  let input = tf.tensor2d([[
    meanSpeed,
    accuracy,
    variability,
    trend,
    fatigue
  ]]);

  let model = tf.sequential();
  model.add(tf.layers.dense({units:8, inputShape:[5], activation:'relu'}));
  model.add(tf.layers.dense({units:4, activation:'relu'}));

  let output = model.predict(input);
  let vec = await output.data();

  return vec;
}

// =======================
// 6. CLASSIFICATION
// =======================
function classify(vec){

  let score = vec[0] + vec[1] - vec[2];

  if (score > 5 && accuracy > 0.9)
    return "High Performer Stabil";

  if (accuracy < 0.8)
    return "Impulsif (cepat tapi kurang teliti)";

  if (trend < 0)
    return "Fatigue (cenderung kelelahan)";

  if (variability > 3)
    return "Tidak stabil";

  return "Performa rata-rata";
}

// =======================
// 7. INSIGHT
// =======================
function generateInsight(p){

  let t = "";

  t += (p.speed > 70) ? "Kecepatan tinggi. " : "Kecepatan sedang. ";
  t += (p.accuracy > 80) ? "Sangat teliti. " : "Perlu ketelitian. ";
  t += (p.consistency > 50) ? "Stabil. " : "Fluktuatif. ";
  t += (p.endurance > 50) ? "Tahan kerja. " : "Mudah lelah. ";
  t += (p.impulse > 50) ? "Kontrol baik. " : "Impulsif. ";
  t += (p.focus > 50) ? "Fokus baik. " : "Fokus lemah. ";
  t += (p.stress > 50) ? "Tahan tekanan." : "Sensitif tekanan.";

  return t;
}

// =======================
// 8. MAIN
// =======================
async function main(){

  let vec = await runML();
  let profile = classify(vec);
  let insight = generateInsight(psych);

  document.getElementById("profile").innerHTML =
    "<b>"+profile+"</b>";

  document.getElementById("insight").innerText = insight;

  document.getElementById("metrics").innerHTML = `
    Speed: ${meanSpeed.toFixed(2)}<br>
    Accuracy: ${(accuracy*100).toFixed(1)}%<br>
    Stability: ${variability.toFixed(2)}<br>
    Trend: ${trend.toFixed(2)}<br>
    Fatigue: ${fatigue.toFixed(2)}
  `;

  // Line Chart
  new Chart(document.getElementById("lineChart"), {
    type:'line',
    data:{
      labels: results.map(r=>r.col),
      datasets:[{
        label:"Performance",
        data:speeds
      }]
    }
  });

  // Radar Chart
  new Chart(document.getElementById("radarChart"), {
    type:'radar',
    data:{
      labels:Object.keys(psych),
      datasets:[{
        label:"Psychological Profile",
        data:Object.values(psych)
      }]
    }
  });

}

main();
