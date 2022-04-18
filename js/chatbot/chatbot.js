// チャットレスポンス出力の書き込む遅延時間
const SendDelayTimeMS = 1;
const ResponseDelayTimeMS = 2000;
const GameLoadDelayTimeMS = 5000;

const INDEX_HELLO = 0;
const INDEX_GAME_INTRO = 1;
const INDEX_NG = 2;

const INDEX_GAME1 = 0;
const INDEX_GAME2 = 1;

// ロボットの返答内容
const chat = [
    "ハロー！ゲームセレクターへようこそ！",
    "どのゲームをプレイしますか？以下の中からプレイするゲームの番号を入力してください。",
    "はー？ちゃんと番号を入力して。",
];

// ロボットの返答内容
const gameNameList = [
    "1:じゃんけんゲーム(普通のやつ)",
    "2:じゃんけんゲーム(シューティングのやつ)",
];

// 送信ボタン
const chatButton = document.getElementById('chat-button');
// 送信文字列入力テキストボックス
const inputText = document.getElementById('chat-input');

// 画面への出力
// valはメッセージ内容，personは誰が話しているか
function output(val, person)
{
  // 一番下までスクロール
  const field = document.getElementById('text_field');
  field.scroll(0, field.scrollHeight - field.clientHeight);

  const ul = document.getElementById('chat-list');
  const li = document.createElement('li');
  // このdivにテキストを指定
  const div = document.createElement('div');
  div.textContent = val;
  div.font
    
  if (person === "me")
  { // 自分
    div.classList.add("chat-right");
    li.classList.add("right");
    ul.appendChild(li);
    li.appendChild(div);
  }
  else if (person === "robot")
  {
    // 相手
    // ロボットが2個連続で返信してくる時、その間は返信不可にする
    // なぜなら、自分の返信を複数受け取ったことになり、その全てに返信してきてしまうから
    // 例："Hi!〇〇!"を複数など
    // （今回のロボットの連続返信は2個以内とする）
    chatButton.disabled = true;
    setTimeout(() => {
      chatButton.disabled = false;
      li.classList.add("left");
      div.classList.add("chat-left");
      ul.appendChild(li);
      li.appendChild(div);
    }, ResponseDelayTimeMS);
  }
}

// 送信ボタンを押した時の処理
function sendChatText()
{
  // 文字列判定
  if (!inputText.value)
  {
    return false;
  }
  
  // 自分のテキストを送信
  output(inputText.value, "me");
  
  // 1秒ディレイ
  setTimeout(() =>
  {
    // 入力内を空欄にする
    // 一瞬の間でvalueを取得し、ロボットの"Hi!〇〇!"の返信に利用
    // 送信ボタンを押した瞬間にvalueを消したら、やまびこに失敗した
    inputText.value = "";
  }, SendDelayTimeMS);
  
  if ((inputText.value == (INDEX_GAME1 + 1) ||
      (inputText.value == (INDEX_GAME2 + 1)) ||
      (inputText.value == (INDEX_GAME3 + 1))))
  { 
    let index = inputText.value - 1;
    output(gameNameList[index] + "ですね。", "robot");
    output("まもなく開始します...", "robot");
    setTimeout(() => { }, 5000);
    return inputText.value;
  }
  else
  {
    // 1~3以外が入力された場合は文句をいう
    output(chat[INDEX_NG], "robot");
  }
  return -1;
}

// エントリ
// 最初に2つロボットから話しかけられる
output(chat[INDEX_HELLO], "robot");

setTimeout( ()=> {
    output(chat[INDEX_GAME_INTRO], "robot");
}, ResponseDelayTimeMS);

// ゲームIDの説明
setTimeout( ()=> {
    output(gameNameList[INDEX_GAME1], "robot");
}, ResponseDelayTimeMS + 200);
setTimeout( ()=> {
    output(gameNameList[INDEX_GAME2], "robot");
}, ResponseDelayTimeMS + 300);