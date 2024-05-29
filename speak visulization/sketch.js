// 全局变量定义和选项设置
let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let yOffset = 0;
let xOffset = 0;
let label = '';
let aspectRatio = 0;
let familyText;
let ballX = 0;

function preload() {
  faceMesh = ml5.faceMesh(options);
  familyText = loadStrings("family.txt");  // 加载family.txt
}

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('canvasContainer');  // 将画布移动到页面中央
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  background(0);  // 黑色背景

  push();
  // 根据yOffset和xOffset上下和左右移动画面
  translate(xOffset, yOffset);
  image(video, 160, 120, 320, 240);  // 缩小视频窗口到画布中央
  pop();

  if (label === 'Fine') {
    noLoop();
    return;
  }

  if (faces.length > 0 && faces[0].lips) {
    let lips = faces[0].lips;

    // 计算画面的右下角位置
    let ellipseX = width - lips.width / 2;
    let ellipseY = height - lips.height / 2;

    fill(0, 0, 0);
    noStroke();
    ellipse(ellipseX, ellipseY, lips.width, lips.height);

    // 计算长宽比
    aspectRatio = lips.height / lips.width;

    // 根据长宽比确定标签
    if (aspectRatio > 0.8) {
      label = 'Ah!';
      yOffset = (frameCount % 50) - 25; // 上下移动
      xOffset = 0;
    } else if (aspectRatio < 0.8 && aspectRatio > 0.5) { // 1 / 1.5 ≈ 0.67
      label = 'Speak';
      yOffset = (frameCount % 50) - 25; // 上下移动
      xOffset = (frameCount % 50) - 25; // 左右移动
    } else if (aspectRatio >= 0 && aspectRatio <= 0.49) { // 1 / 1.5 ≈ 0.67 and 1 / 2 ≈ 0.5
      label = 'Slience';
      yOffset = 0;
      xOffset = 0;
    }

    // 在嘴唇下方显示标签
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(label, lips.x + lips.width / 2, lips.y + lips.height + 20);
    
    // 在标签下方显示长宽比
  //   textSize(16);
  //   text(`Aspect Ratio: ${aspectRatio.toFixed(2)}`, lips.x + lips.width / 2, lips.y + lips.height + 50);
  }

  if (label === 'Speak') {
    drawRandomLineWithText();
  } else if (label === 'Ah!') {
    drawMovingBall();
  } else if (label === 'Slience') {
    clearText();
  }

  drawPartsKeypoints();
}

// 绘制嘴唇关键点函数
function drawPartsKeypoints() {
  if (faces.length > 0) {
    for (let i = 0; i < faces[0].lips.keypoints.length; i++) {
      let lips = faces[0].lips.keypoints[i];
      fill(0, 255, 0);
      circle(lips.x, lips.y, 5);
    }
  }
}

// faceMesh模型的回调函数，保存检测到的脸部数据
function gotFaces(results) {
  faces = results;
}

function drawRandomLineWithText() {
  let startX = random(0, 100);
  let endX = random(width - 100, width);
  let startY = random(height);
  let endY = random(height);

  stroke(255);
  line(startX, startY, endX, endY);

  let textIndex = Math.floor(random(familyText.length));
  let textToShow = familyText[textIndex];
  fill(255);
  textSize(24);
  text(textToShow, startX, startY);
}

function drawMovingBall() {
  fill(255);
  ellipse(ballX, height / 2, 500, 500);
  ballX += 7;
  if (ballX > width) {
    ballX = 0;
  }
}

function clearText() {
  background(0);  // 清除画布上的文字
}
