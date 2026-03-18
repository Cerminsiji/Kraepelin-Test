// =======================
// STATE
// =======================
let topNum, bottomNum;
let count = 0;
let results = [];
let startTime;
let timer;

// =======================
// STORAGE
// =======================
function saveState(){
  localStorage.setItem("kraepelin_state", JSON.stringify({
    topNum,
    bottomNum,
    count,
    results,
    startTime
  }));
}

function loadState(){
  let data = localStorage.getItem("kraepelin_state");
  if(!data) return false;

  let s = JSON.parse(data);

  topNum = s.topNum;
  bottomNum = s.bottomNum;
  count = s.count;
  results = s.results;
  startTime = s.startTime;

  return true;
}

function clearState(){
  localStorage.removeItem("kraepelin_state");
}

// =======================
// UTIL
// =======================
function rand(){
  return Math.floor(Math.random()*10);
}

function render(){
  document.getElementById("top").innerText = topNum;
  document.getElementById("bottom").innerText = bottomNum;
  document.getElementById("count").innerText = count;
}

// =======================
// START
// =======================
function startTest(){

  document.getElementById("intro").style.display="none";
  document.getElementById("testArea").style.display="block";

  if(!loadState()){
    topNum = rand();
    bottomNum = rand();
    count = 0;
    results = [];
    startTime = Date.now();
  }

  render();
  startTimer();

  document.getElementById("answer").focus();
}

// =======================
// TIMER
// =======================
function startTimer(){
  timer = setInterval(()=>{
    let t = Math.floor((Date.now()-startTime)/1000);
    document.getElementById("time").innerText = t;

    if(t >= 300){ // 5 menit
      finishTest();
    }
  },1000);
}

// =======================
// INPUT
// =======================
document.addEventListener("keydown", function(e){

  if(e.key === "Enter"){
    submit();
  }
});

function submit(){

  let input = document.getElementById("answer");
  let val = parseInt(input.value);

  if(isNaN(val)) return;

  let correct = (topNum + bottomNum) % 10;
  let isCorrect = val === correct;

  results.push({
    correct: isCorrect ? 1 : 0,
    wrong: isCorrect ? 0 : 1,
    time: Date.now()
  });

  // next
  bottomNum = topNum;
  topNum = rand();

  count++;

  input.value = "";

  render();
  saveState();
}

// =======================
// FINISH
// =======================
function finishTest(){

  clearInterval(timer);
  clearState();

  document.getElementById("testArea").style.display="none";
  document.getElementById("resultArea").style.display="block";

  analyze();
}

// =======================
// ANALYSIS
// =======================
function mean(arr){
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function analyze(){

  let correctArr = results.map(r=>r.correct);
  let total = correctArr.length;
  let acc = mean(correctArr);

  let speed = total;

  let times = results.map((r,i)=> i===0 ? 0 : r.time - results[i-1].time);
  let avgTime = mean(times);

  let fatigue = mean(correctArr.slice(-10)) - mean(correctArr.slice(0,10));

  let profile;

  if(acc > 0.9 && avgTime < 800){
    profile = "High Performer";
  } else if(acc < 0.7){
    profile = "Impulsif";
  } else if(fatigue < 0){
    profile = "Mudah Lelah";
  } else {
    profile = "Stabil";
  }

  document.getElementById("result").innerHTML = `
    Soal: ${total}<br>
    Akurasi: ${(acc*100).toFixed(1)}%<br>
    Avg Time: ${avgTime.toFixed(0)} ms<br>
    Fatigue: ${fatigue.toFixed(2)}<br><br>
    <b>${profile}</b>
  `;
}
