// デバッグフラグ
const DEBUG = true;

const FPS = 60;

// ゲームスピード(ms) 60fps
const GAME_SPEED = 1000 / FPS;

// 8bit操作する定数
const BIT8 = 8;

// 画面サイズ
const SCREEN_W = 360;
const SCREEN_H = 600;

// キャンバスサイズ
const CANVAS_W = SCREEN_W * 2;
const CANVAS_H = SCREEN_H * 2;

// フィールドサイズ
const FIELD_W = SCREEN_W * 1;
const FIELD_H = SCREEN_H * 1;
const FIELD_MIN_X = 0;
const FIELD_MAX_X = FIELD_W;
const FIELD_MIN_Y = 0;
const FIELD_MAX_Y = FIELD_H;

// 星の数
const STAR_MAX = 300;

// 自機制御用定数定義
const MaxMochitama = 1;
const JikiSpeed = 512;
const TamaReloadSpanInFrame = FPS * 0.5;
const JikiTerritoryRadius = 10;
const TamaTerritoryRadius = 10;

// 敵制御用定数定義
const MaxTekiNumber = 5;
const TekiInitPosShiftX = 0;
const TekiInitPosShiftY = -100;
const TekiMoveSpeedSlowX = 100;
const TekiMoveSpeedSlowY = 100;
const TekiMoveSpeedX = 100;
const TekiMoveSpeedY = 20; 
const TekiTerritoryRadius = 10;
const TekiGenerateSpanInFrame = FPS * 2;

// ロードする画像ファイルパス
const SPRITE_IMG_JIKI = "../../../js/game/shooting/jiki.png";
const SPRITE_IMG_TARGET = "../../../js/game/shooting/target.png";
const SPRITE_IMG_TAMA = "../../../js/game/shooting/tama.png";
const SPRITE_IMG_BAKUHATSU = "../../../js/game/shooting/bakuhatsu.png";

// キャンバス
let can = document.getElementById("can");
let con = can.getContext("2d");
can.width = CANVAS_W;
can.height = CANVAS_H;

// フィールド(仮想画面)
let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");
vcan.width = FIELD_W;
vcan.height = FIELD_H;

// カメラ座標
let cameraX = 0;
let cameraY = 0;

// 描画される星の配列
let star = [];

// キーボードの状態保持
let key = [];
// キーダウン
document.onkeydown = function (e)
{
  key[e.keyCode] = true;
}
// キーアップ
document.onkeyup = function (e)
{
  key[e.keyCode] = false;
}

// 自機クラス
class Jiki
{
  constructor()
  {
    // ポジションX
    this.x = (FIELD_W / 2) << BIT8;
    // ポジションY
    this.y = (FIELD_H / 2) << BIT8;
    // 速度
    this.speed = JikiSpeed;
    // 自機の姿勢ID(見た目の切り替え用)
    this.anime = 0;
    // 発射可能な持ち弾数
    this.mochitama = MaxMochitama;
    // リロードフラグ
    this.reload = false;
    // リロード完了カウンタ
    this.reloadCompleteCounter = 0;
    // 見た目上の半径
    this.radius = JikiTerritoryRadius;
    // 破壊フラグ
    this.destroyed = false;
  }

  // 自機の移動
  update()
  {
    // KeyCode
    // 32:Space, 37:←, 38:↑, 39:→,40:↓
    // 65:A, 83:S, 68:D, 37:←, 38:↑, 39:→,40:↓

    // Spaseおしたときの発射弾
    // ただし、リロードフラグがアクティブのときは発射できない制限
    if ((key[65] || key[83] || key[68]) && !this.reload)
    {
      // key:A
      if (key[65])
      {
        jyankenTama.push(new JyankenTama("gu", this.x, this.y, 0, -500));
      }
      // key:S
      else if (key[83])
      {
        jyankenTama.push(new JyankenTama("choki", this.x, this.y, 0, -500));
      }
      // key:D
      else if (key[68])
      {
        jyankenTama.push(new JyankenTama("pa", this.x, this.y, 0, -500));
      }
      this.mochitama--;
    }

    // 持ち弾が無くなった場合はリロードフラグをアクティブにする
    if (this.mochitama <= 0)
    {
      this.reload = true;
    }

    // リロード待ち中は持ち弾を装填
    if (this.reload)
    {
      this.reloadCompleteCounter++;
      // 装填完了したらリロードフラグを下げる
      if (this.reloadCompleteCounter >= TamaReloadSpanInFrame)
      {
        this.reload = false;
        this.mochitama = MaxMochitama;
        this.reloadCompleteCounter = 0;
      }
    }

    // ←キー入力時の振る舞い
    // 自機のポジションがフィールド左端を超えないようにする。
    if (key[37] && (this.x > (FIELD_MIN_X + this.speed)))
    {
      // 自機ポジションのシフト
      this.x -= this.speed;
      // 徐々に自機の見た目を傾ける
      if (this.anime > -8)
      { 
        this.anime--;
      }
    }
    // →キー入力時の振る舞い
    // 自機のポジションがフィールド右端を超えないようにする。
    else if (key[39] && (this.x <= ((FIELD_MAX_X << BIT8) - this.speed)))
    {
      // 自機ポジションのシフト
      this.x += this.speed;
      // 徐々に自機の見た目を傾ける
      if (this.anime < 8)
      { 
        this.anime++;
      }
    }
    else
    { 
      // 徐々に自機の見た目を正面に戻す
      if (this.anime > 0)
      { 
        this.anime--;
      }
      if (this.anime < 0)
      { 
        this.anime++;
      }
    }

    // ↑キー入力時の振る舞い
    // 自機のポジションがフィールド↑端を超えないようにする。
    if (key[38] && (this.y > (FIELD_MIN_Y + this.speed)))
    {
      this.y -= this.speed;
    }
    // ↓キー入力時の振る舞い
    // 自機のポジションがフィールド下端を超えないようにする。
    if (key[40] && (this.y <= ((FIELD_MAX_Y << BIT8) - this.speed)))
    {
      this.y += this.speed;
    }
  }

  // 敵衝突判定
  judgeInterposition(tekiX, tekiY, tekiRadius)
  {
    let distX = (this.x - tekiX) >> BIT8;
    let distY = (this.y - tekiY) >> BIT8;
    let dist = Math.sqrt(distX * distX + distY * distY);
    let threshold = this.radius + tekiRadius;
    if (dist <= threshold)
    {
      this.destroyed = true;
    }
  }

  // 自機の描画
  draw()
  {
    drawSprite(2 + (this.anime>>2), this.x, this.y, jikiImage, jikiSprite);
  }
}
let jiki = new Jiki();

// 弾クラス
class Tama
{
  constructor(x, y, vx, vy)
  {
    this.sn = 5;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.kill = false;
  }

  // 弾の移動
  update()
  {
    this.x += this.vx;
    this.y += this.vy;

    if ((this.x < 0) || (this.x > FIELD_W << BIT8) ||
        (this.y < 0) || (this.y > FIELD_H << BIT8))
    {
      this.kill = true;
    }
  }

  // 弾の描画
  draw()
  {
    drawSprite(this.sn, this.x, this.y, jikiImage, jikiSprite);
  }
}
let tama = [];
tama[1] = 0;
tama[2] = 0;

// じゃんけん弾クラス
class JyankenTama
{
  constructor(kind, x, y, vx, vy)
  {
    this.id = kind;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.kill = false;
  }

  // 弾の移動
  update()
  {
    this.x += this.vx;
    this.y += this.vy;

    if ((this.x < 0) || (this.x > FIELD_W << BIT8) ||
        (this.y < 0) || (this.y > FIELD_H << BIT8))
    {
      this.kill = true;
    }
  }

  // 弾の描画
  draw()
  {
    let arrayIndex = 0;
    if (this.id == "gu")  
    { 
      arrayIndex = 0;
    }
    else if (this.id == "choki")
    {
      arrayIndex = 1;
    }
    else if (this.id == "pa")  
    { 
      arrayIndex = 2;
    }
    else
    { 
      return;
    }

    // 敵
    drawSprite(arrayIndex, this.x, this.y, tamaImage, tamaSprite);
  }
}
let jyankenTama = [];

// 敵クラス
class Teki {

  // コンストラクタ
  constructor(kind, x, y, radius)
  {
    this.id = kind;
    this.x = x + (rand(0, SCREEN_W) - (SCREEN_W / 2)+ TekiInitPosShiftX); 
    this.y = (FIELD_MIN_Y + TekiInitPosShiftY);
    // X方向の速度
    this.velX = TekiMoveSpeedSlowX * (rand(0,2) - 1);
    // Y方向の速度
    this.velY = TekiMoveSpeedSlowY;
    /* this.x = x; 
    this.y = (FIELD_MIN_Y + TekiInitPosShiftY);
    // X方向の速度
    this.velX = 0;
    // Y方向の速度
    this.velY = TekiMoveSpeedSlowY; */
    this.sz = rand(1, 2);
    // 見た目上の半径
    this.radius = radius;
    // 消滅フラグ
    this.kill = false;
    // 破壊済み
    this.destroyed = false;
  }

  // フレームごとの更新処理
  update()
  {
    this.x += this.velX;
    this.y += this.velY;

    if (this.velX >= 0)
    {
      // 右方向移動のケース
      // ポジションが右端に達した場合は移動方向切り替え
      if (this.x > (FIELD_MAX_X << BIT8))
      {
        this.x = (FIELD_MAX_X << BIT8);
        this.velX = -1 * this.velX; 
      }
    }
    else
    {
      // 左方向移動ケース
      // ポジションが右端に達した場合は移動方向切り替え
      if (this.x < (FIELD_MIN_X << BIT8))
      {
        this.x = (FIELD_MIN_X << BIT8);
        this.velX = -1 * this.velX; 
      }
    }

    // Y方向が下端に達したら消滅
    if (this.y > (FIELD_MAX_Y << BIT8))
    {
      this.kill = true;
    }
  }

  // 弾衝突判定
  judgeInterposition(tamaKind, tamaX, tamaY, tamaRadius)
  {
    // あいこの場合は即リターン
    if (this.id == tamaKind) { return; }
    // 弾が負けの場合も即リターン
    if ((this.id == "gu")    && (tamaKind == "choki")) { return; }
    if ((this.id == "choki") && (tamaKind == "pa"   )) { return; }
    if ((this.id == "pa")    && (tamaKind == "gu"   )) { return; }

    let distX = (this.x - tamaX) >> BIT8;
    let distY = (this.y - tamaY) >> BIT8;
    let dist = Math.sqrt(distX * distX + distY * distY);
    let threshold = this.radius + tamaRadius;
    if (dist <= threshold)
    {
      this.destroyed = true;
    }
  }

  // 描画
  draw()
  {
    let arrayIndex = 0;
    if (this.id == "gu")  
    { 
      arrayIndex = 0;
    }
    else if (this.id == "choki")
    {
      arrayIndex = 1;
    }
    else if (this.id == "pa")  
    { 
      arrayIndex = 2;
    }
    else
    { 
      return;
    }

    // 敵
    drawSprite(arrayIndex, this.x, this.y, targetImage, targetSprite);
  }
}
let teki = [];
// 敵を発生させる間隔を制御する際に使うカウンタ
let tekiGenerateCountupCounter = 0;

// 爆発クラス
class Bakuhatsu
{
  constructor(x, y)
  {
    // ポジションX,Y
    this.x = x;
    this.y = y;
    // 消滅までのカウンタ(0になると消滅)
    this.deadCounter = FPS * 0.2;
    // 消滅フラグ
    this.kill = false;
  }

  // 弾の移動
  update()
  {
    //  消滅までのカウンタをデクリメント
    this.deadCounter--;

    if (this.deadCounter <= 0)
    {
      this.kill = true;
    }
  }

  // 弾の描画
  draw()
  {
    drawSprite(0, this.x, this.y, bakuhatsuImage, bakuhatsuSprite);
  }
}
let bakuhatsu = [];

// 画像画像の読み込み
let jikiImage = new Image();
jikiImage.src = SPRITE_IMG_JIKI;
let targetImage = new Image();
targetImage.src = SPRITE_IMG_TARGET;
let tamaImage = new Image();
tamaImage.src = SPRITE_IMG_TAMA;
let bakuhatsuImage = new Image();
bakuhatsuImage.src = SPRITE_IMG_BAKUHATSU;

class Sprite
{
  constructor(x, y, w, h)
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

// スプライト(自機&弾)
let jikiSprite = [
  new Sprite(  0,  0, 22, 42),// 0, 自機　左2
  new Sprite( 23,  0, 33, 42),// 1, 自機　左1
  new Sprite( 57,  0, 43, 42),// 2, 自機　正面
  new Sprite(101,  0, 33, 42),// 3, 自機　右1
  new Sprite(135,  0, 21, 42),// 4, 自機　右2

  new Sprite(  0, 50,  3,  7),// 5, 弾１
  new Sprite(  4, 50,  5,  5),// 6, 弾２
];

// スプライト(敵リスト)
let targetSprite = [
  new Sprite(  0,  0, 30, 32),// 0, グー
  new Sprite( 33,  0, 20, 32),// 1, チョキ
  new Sprite( 55,  0, 30, 32),// 2, パー
];

// スプライト(じゃんけん弾リスト)
let tamaSprite = [
  new Sprite(  0,  0, 30, 32),// 0, グー
  new Sprite( 33,  0, 20, 32),// 1, チョキ
  new Sprite( 55,  0, 30, 32),// 2, パー
];

// スプライト(爆発リスト)
let bakuhatsuSprite = [
  new Sprite(  0,  0, 35, 35),
];

// スプライトを描画する
function drawSprite(snum, x, y, img, sprite)
{
  let sx = sprite[snum].x;
  let sy = sprite[snum].y;
  let sw = sprite[snum].w;
  let sh = sprite[snum].h;

  let px = (x >> BIT8) - sw / 2;
  let py = (y >> BIT8) - sh / 2;

  if (((px+sw/2 < cameraX) || (px-sw/2 >= cameraX + SCREEN_W)) ||
      ((py+sh/2 < cameraY) || (py-sh/2 >= cameraY + SCREEN_H)))
    { return; }

  vcon.drawImage(img, sx, sy, sw, sh, px, py, sw, sh);
}

// 整数のランダムを作成
function rand(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 描画する星クラス
class Star
{
  constructor()
  {
    this.x = rand(0, FIELD_W) << BIT8;// 
    this.y = rand(0, FIELD_H) << BIT8;// 
    this.vx = 0;
    this.vy = rand(30, 200);
    this.sz = rand(1, 2);
  }

  // 星の描画
  draw()
  {
    let x = this.x >> BIT8;
    let y = this.y >> BIT8;
    if (((x < cameraX) || (x >= cameraX + SCREEN_W)) ||
        ((y < cameraY) || (y >= cameraY + SCREEN_H)))
    { return; }
    vcon.fillStyle = rand(0, 2) != 0 ? "66f" : "#8af";
    vcon.fillRect(this.x >> BIT8, this.y >> BIT8, this.sz, this.sz);
  }

  // フレームごとの更新処理
  update()
  {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > FIELD_H << BIT8)
    {
      this.y = 0;
      this.x = rand(0, FIELD_W) << BIT8; 
    }
  }
}

//背景画像
var background = new Image();
background.src = "../../../js/game/shooting/background.bmp";
background.onload = function(){
  //canvas_widthを height / width倍する.
  vcon.drawImage(background, 0, 0, CANVAS_W, background.height * CANVAS_W / background.width);
}

// ゲームオーバーフラグ
let gameOver = false;
// 破壊した敵数
let numOfDestroyedTeki = 0;
// 初期化処理
function gameInit()
{
  for (let index = 0; index < STAR_MAX; index++)
  {
    star[index] = new Star();
  }
  // 60fps
  setInterval(gameLoop, GAME_SPEED);
}

// ゲームループ(インターバル間隔でコールされるメソッド定義)
function gameLoop()
{
  // 移動の処理
  for (let index = 0; index < STAR_MAX; index++)
  {
    star[index].update();
  }
  for (let index = jyankenTama.length - 1; index >= 0; index--)
  {
    jyankenTama[index].update();
    if (jyankenTama[index].kill)
    {
      jyankenTama.splice(index, 1);
    }
  }
  jiki.update();
  // 敵発生カウンタのカウントアップ
  tekiGenerateCountupCounter++;
  if (tekiGenerateCountupCounter >= TekiGenerateSpanInFrame)
  {
    let randomVal = rand(0, 2);
    if (randomVal == 0) { teki.push(new Teki("gu", jiki.x, jiki.y, TamaTerritoryRadius));}
    else if (randomVal == 1) { teki.push(new Teki("choki", jiki.x, jiki.y, TamaTerritoryRadius));}
    else { teki.push(new Teki("pa", jiki.x, jiki.y, TamaTerritoryRadius));}
    //teki.push(new Teki("gu", jiki.x, jiki.y, TamaTerritoryRadius));
    tekiGenerateCountupCounter = 0;
  }

  // 敵衝突判定
  for (let index = teki.length - 1; index >= 0; index--)
  {
    // 敵位置更新
    teki[index].update();
    // 敵１機ごとに全弾と衝突判定を実施
    for (let tamaIndex = jyankenTama.length - 1; tamaIndex >= 0; tamaIndex--)
    {
      teki[index].judgeInterposition(jyankenTama[tamaIndex].id,
        jyankenTama[tamaIndex].x,
        jyankenTama[tamaIndex].y,
        TekiTerritoryRadius)
    }
    // 敵の消滅判定
    if (teki[index].kill)
    {
      teki.splice(index, 1);
    }
  }

  // 自機衝突判定
  for (let index = teki.length - 1; index >= 0; index--)
  {
    jiki.judgeInterposition(teki[index].x, teki[index].y, teki[index].radius);
  }

  // 描画の処理
  //vcon.fillStyle = "black";
  //vcon.fillRect(cameraX, cameraY, SCREEN_W, SCREEN_H);
  // 背景画像の描画
  vcon.drawImage(background, 0, 0, CANVAS_W, background.height * CANVAS_W / background.width);
  // 星の描画
  for (let index = 0; index < STAR_MAX; index++)
  {
    star[index].draw();
  }

  // 弾の描画
  for (let index = 0; index < jyankenTama.length; index++)
  {
    jyankenTama[index].draw();
  }

  // 敵の描画
  for (let index = teki.length - 1; index >= 0; index--)
  {
    if (teki[index].destroyed)
    {
      // 爆発を描画
      bakuhatsu.push(new Bakuhatsu(teki[index].x, teki[index].y));
      teki.splice(index, 1);
      // 倒した敵数をカウントアップ
      numOfDestroyedTeki++;
    }
    else
    {
      teki[index].draw();
    }
  }

  for (let index = bakuhatsu.length - 1; index >= 0; index--)
  {
    bakuhatsu[index].update();
    if (bakuhatsu[index].kill)
    {
      bakuhatsu.splice(index, 1);
    }
    else
    {
      bakuhatsu[index].draw();
    }
  }

  // 爆発の描画

  // 自機の描画
  if (!jiki.destroyed)
  {
    jiki.draw();
  }

  // 自機の範囲 0 ~ FIELD_W
  // カメラの範囲 0 ~ (FIELD_W-SCREEN_W)
  cameraX = (jiki.x >> BIT8) / FIELD_W * (FIELD_W - SCREEN_W);
  cameraY = (jiki.y >> BIT8) / FIELD_H * (FIELD_H - SCREEN_H);

  // 仮想画面から実際のキャンバスにコピー
  con.drawImage(vcan,
    cameraX,
    cameraY,
    SCREEN_W,
    SCREEN_H,
    0,
    0,
    CANVAS_W,
    CANVAS_H);

  if (jiki.destroyed)
  {
    jiki.draw();
    con.font = "84px 'Impact'";
    con.fillStyle = "Red";
    con.strokeText("=====You Lose======", 0, CANVAS_H / 2);
    con.font = "80px 'Impact'";
    con.fillStyle = "Red";
    con.fillText("=====You Lose======", 0, CANVAS_H / 2);

    // 自機消滅後の選択肢を提供
    // Continue:C
    con.font = "50px 'Impact'";
    con.fillStyle = "black";
    con.fillText("Continue:Press the \"C\" key.", 20, CANVAS_H / 2 + 100);
    // Exit:E
    con.fillText("Exit____:Press the \"E\" key.", 20, CANVAS_H / 2 + 200);

    gameOver = true;
  }
  
  if (gameOver)
  {
    // key:C
    if (key[67])
    {
      // ページ再読み込み
      location.reload();
    }
    // key:E
    else if (key[69])
    {
      window.location.href = "../../chatbot/chatbot.html";
    }
  }

  con.font = "40px 'Impact'";
  con.fillStyle = "White";
  con.fillText("Count:" + numOfDestroyedTeki, 20, 40);
}

// オンロードでゲーム初期化
window.onload = function () {
  gameInit();
}
