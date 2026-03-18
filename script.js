let currentTop, currentBottom, nextNumber;
let results = [];
let startTime;

function rand(){
  return Math.floor(Math.random()*10);
}

function render(){
  document.getElementById("top-number").innerText = currentTop;
  document.getElementById("bottom-number").innerText = currentBottom;
  document.getElementById("next-number").innerText = nextNumber;
}

function startTest(){
  document.getElementById("intro").style.display="none";
  document.getElementById("testArea").style.display="block";

  currentBottom = rand();
  currentTop = rand();
  nextNumber = rand();

  render();

  results = [];
  startTime = Date.now();

  timer();
}

function timer(){
  setInterval(()=>{
    let t = Math.floor((Date.now()-startTime)/1000);
    document.getElementById("time").innerText = t;

    if(t >= 60){
      finishTest();
    }
  },1000);
}

function submitAnswer(){
  let val = parseInt(document.getElementById("answer").value);
  if(isNaN(val)) return;

  let correct = (currentTop + currentBottom) % 10;
  let isCorrect = val === correct;

  results.push({
    correct: isCorrect ? 1 : 0,
    wrong: isCorrect ? 0 : 1,
    time: Date.now()
  });

  document.getElementById("answer").value="";

  nextStep();
}

function nextStep(){
  currentBottom = currentTop;
  currentTop = nextNumber;
  nextNumber = rand();

  render();
}

function finishTest(){
  document.getElementById("testArea").style.display="none";
  document.getElementById("resultArea").style.display="block";

  analyze();
}

function mean(arr){
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function analyze(){

  let correct = results.map(r=>r.correct);
  let speed = correct.length;
  let acc = mean(correct);

  let times = results.map((r,i)=> i===0 ? 0 : r.time - results[i-1].time);
  let avgTime = mean(times);

  let fatigue = mean(correct.slice(-10)) - mean(correct.slice(0,10));

  let profile;

  if(acc > 0.9 && avgTime < 800){
    profile = "High Performer";
  } else if(acc < 0.7){
    profile = "Impulsive";
  } else if(fatigue < 0){
    profile = "Easily Fatigued";
  } else {
    profile = "Average";
  }

  let insight = `
  Kecepatan: ${speed} soal <br>
  Akurasi: ${(acc*100).toFixed(1)}% <br>
  Reaction Time: ${avgTime.toFixed(0)} ms <br>
  Fatigue: ${fatigue.toFixed(2)}
  `;

  document.getElementById("profile").innerHTML = profile;
  document.getElementById("insight").innerHTML = insight;

  new Chart(document.getElementById("chart"), {
    type:'line',
    data:{
      labels: correct.map((_,i)=>i),
      datasets:[{
        label:'Performance',
        data: correct
      }]
    }
  });
}
