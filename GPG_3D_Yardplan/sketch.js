cArray = undefined;
const contWidth = 80;
const contHeight = 85;
const contLength = 200;
const contHalfLength = Math.floor(contLength/2);
const contGap = Math.floor(contLength*0.06);

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
  $.getJSON("data.json", function(data){
    cArray = data[0];
  })
}


function init(){
  console.log(cArray);
  myFont = loadFont("Poppins-Light.ttf")
  textFont(myFont);
  ambientLight(255,255,255)
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
    translate(0,0,201)
  }else{
    // Container 20ft
    b=b/2
    translate(b*(contLength+contGap),r*contHeight,t*contWidth);
    setColor(cont.HangTauID)
    box(contLength, contHeight, contWidth);
    fill(255)
    rotateY(1.5707963268)
    translate(0,0,101)
  }
  text(cont.Container.substring(0,4)+"\n" + cont.Container.substring(4,11), 0,0)
}
  
  

function setup() {
  createCanvas(800, 800, WEBGL);
  normalMaterial();
  init()
  stroke(0)
  ambientMaterial(40,40,200)
  textSize(16);
  debugMode()
  textAlign(CENTER)
}
function draw() {
  background(200);
  orbitControl();
  for(let i =0; i<cArray.length; i++){
    push();
    drawCont(cArray[i])
    pop();
  }
}