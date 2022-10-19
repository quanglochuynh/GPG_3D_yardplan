cArray = undefined;
ground = undefined;
const contWidth = 16;
const contHeight = 17;
const contLength = 40;
const contHalfLength = Math.floor(contLength/2);
const contGap = Math.floor(contLength*0.06);
const fontSize = 3

const dx = -500;
const dy = -400

// function transform

function setColor(opt){
  switch (opt){
    case "EVG":   
      fill(60,200,40);
      break;
    case "RCL": 
      fill(40,80,200);
      break;
    case "COS": 
      fill(140,180,180);
      break;
    default:
      fill(32,32,32);
  }
}

function preload(){
  $.getJSON("../data/cont.json", function(data){
    cArray = data;
  })
  $.getJSON("../data/tbd_ground.json", function(data){
    ground = data;
  })
  
}


function init(){
  myFont = loadFont("Poppins-Light.ttf")
  textFont(myFont);
  ambientLight(255,255,255)
  normalMaterial();
  stroke(0)
  textSize(fontSize);
  debugMode()
  textAlign(CENTER)
}

function drawCont(cont){
  b =  cont.Bay-1;
  r =  -cont.Tier+1;
  t =  cont.Row-1;
  if (b%2 != 0){
    // Container 40ft
    b = Math.floor(b/2);
    translate(b*(contLength+contGap)+contHalfLength,r*contHeight,t*contWidth);
    setColor(cont.HangTauID)
    box(contLength*2, contHeight, contWidth);
    fill(255)
    rotateY(1.5707963268)
    translate(0,0,contLength+1)
  }else{
    // Container 20ft
    b=b/2
    translate(b*(contLength+contGap),r*contHeight,t*contWidth);
    setColor(cont.HangTauID)
    box(contLength, contHeight, contWidth);
    fill(255)
    rotateY(1.5707963268)
    translate(0,0,contHalfLength+1)
  }
  text(cont.Container.substring(0,4)+"\n" + cont.Container.substring(4,11), 0,0)
}
  
function drawGround(grd){
  push();
  rotateX(1.5707963268);
  for (let i =0; i<grd.x.length-1; i++){
    // circle(grd.x[i]+dx, grd.y[i]+dy, 10);
    line(grd.x[i]+dx, grd.y[i]+dy, grd.x[i+1]+dx, grd.y[i+1]+dy)
  }
  line(grd.x[grd.x.length-1]+dx, grd.y[grd.x.length-1]+dy, grd.x[0]+dx, grd.y[0]+dy)
  pop();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // createCanvas(windowWidth, windowHeight);
  init();

}
function draw() {
  orbitControl(2,2,0.5);
  background(240);
  

  drawGround(ground);
  for(let i =0; i<cArray.length; i++){
    push();
    shininess(20);
    drawCont(cArray[i])
    pop();
  }
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }