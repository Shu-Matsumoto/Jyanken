const TXT_GU = "グー";
const TXT_CHOKI = "チョキ";
const TXT_PA = "パー";
const TXT_WIN = "かち";
const TXT_LOSE = "まけ";

function getRandInt(min, max)
{
  return Math.floor(Math.random() * (max - min)) + min;
}

function getJyankenCompareVal()
{
  let val = getRandInt(1, 3);
  let outText = TXT_PA;

  if (val == 1)  
  { 
    outText = TXT_GU;
  }
  else if (val == 2)  
  { 
    outText = TXT_CHOKI;
  }
  return outText;
}

// じゃんけんの判定
function judgeJyanken(target, compare)
{
  let outText = "あいこ";
  if (target != compare)
  {
    if (target == TXT_GU)
    {
      if (compare == TXT_PA)
      {
        outText = TXT_LOSE;
      }
      else if (compare == TXT_CHOKI)  
      { 
        outText = TXT_WIN;
      }
    }
    else if (target == TXT_CHOKI)
    {
      if (compare == TXT_GU)
      {
        outText = TXT_LOSE;
      }
      else if (compare == TXT_PA)  
      { 
        outText = TXT_WIN;
      }
    }
    else if (target == TXT_PA)
    {
      if (compare == TXT_CHOKI)
      {
        outText = TXT_LOSE;
      }
      else if (compare == TXT_GU)  
      { 
        outText = TXT_WIN;
      }
    }
  }
  return outText;
}

// じゃんけん判定結果の表示
function outputJyankenJugementResultText(id, outText, idImg, compareValue)
{
  document.getElementById(id).innerText = outText;
  document.getElementById(id).im = outText;

  let imgSrc = "../../../img/normal/janken_pa.png";
  if (compareValue == TXT_GU)  
  { 
    imgSrc = "../../../img/normal/janken_gu.png";
  }
  else if (compareValue == TXT_CHOKI)  
  { 
    imgSrc = "../../../img/normal/janken_choki.png";
  }

  document.getElementById(idImg).src = imgSrc;
}