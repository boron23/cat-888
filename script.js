/**********************************
 * CONFIG
 **********************************/
const symbols  = ["🍒","🍋","🍉","🍇","🔔","💎","⭐","7️⃣"];
const JACKPOT_MATCH = 5;   // ทุกรีลเหมือนกัน = แจ็กพอต
const SMALL_MATCH   = 3;   // เหมือนกัน ≥3 รีลติดกัน = ชนะเล็ก
const spinDelay     = 100; // ms ต่อการสุ่มหนึ่งครั้ง
const spinRounds    = 15;  // รอบสุ่มก่อนหยุด (ยิ่งมากยิ่งหมุนนาน)

/**********************************
 * DOM
 **********************************/
const reels   = [...Array(5)].map((_,i)=>document.getElementById(`reel${i+1}`));
const result  = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");
const betInp  = document.getElementById("bet");
const creditsEl = document.getElementById("credits");

const sndSpin = document.getElementById("sndSpin");
const sndWin  = document.getElementById("sndWin");
const sndJack = document.getElementById("sndJack");

/**********************************
 * STATE
 **********************************/
let credits = 1000;

/**********************************
 * MAIN
 **********************************/
spinBtn.addEventListener("click", spin);

function spin(){
  // ตรวจเครดิต
  const bet = parseInt(betInp.value) || 1;
  if(bet <= 0){return;}
  if(credits < bet){
    alert("เครดิตไม่พอ!");
    return;
  }

  // หักเงิน, ล็อกปุ่ม
  credits -= bet;
  updateCredits();
  result.textContent = "Spinning...";
  spinBtn.disabled = true;

  // เล่นเสียงหมุน
  sndSpin.currentTime = 0;
  sndSpin.play();

  // สุ่มแต่ละรีลหลายรอบให้ดูเหมือนหมุน
  const chosenIdx = [];
  let rounds = spinRounds;

  const interval = setInterval(()=>{
    reels.forEach((reel,i)=>{
      const sym = getRandomSymbol();
      reel.textContent = sym;
      if(rounds === 0){ chosenIdx[i] = symbols.indexOf(sym); }
    });

    rounds--;
    if(rounds < 0){
      clearInterval(interval);
      sndSpin.pause();
      calcResult(chosenIdx, bet);
      spinBtn.disabled = false;
    }
  }, spinDelay);
}

function getRandomSymbol(){
  return symbols[Math.floor(Math.random()*symbols.length)];
}

function calcResult(idxArr, bet){
  /* ตรวจชุดสัญลักษณ์ */
  const symArr = idxArr.map(i=>symbols[i]);
  const first = symArr[0];

  // นับรีลที่เรียงเหมือนกันตั้งแต่รีลแรก
  let streak = 1;
  for(let i=1;i<symArr.length;i++){
    if(symArr[i]===first){ streak++; } else { break; }
  }

  let win = 0;
  if(streak === JACKPOT_MATCH){
    win = bet * 50;  // แจ็กพอต – จ่าย 50×
    sndJack.currentTime = 0;
    sndJack.play();
    result.textContent = `🎉 JACKPOT x50! → +${win}`;
  }else if(streak >= SMALL_MATCH){
    win = bet * 5;   // ชนะเล็ก – จ่าย 5×
    sndWin.currentTime = 0;
    sndWin.play();
    result.textContent = `😊 Nice! x5 → +${win}`;
  }else{
    result.textContent = "😢 Try again!";
  }

  credits += win;
  updateCredits();
}

function updateCredits(){
  creditsEl.textContent = `Credits: ${credits}`;
}
