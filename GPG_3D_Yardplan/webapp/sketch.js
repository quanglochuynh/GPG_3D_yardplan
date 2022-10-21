let cArray = undefined;
let depot = undefined;
let showText = false;
let rotOffset = [];
// function transform
p5.disableFriendlyErrors = true;

function setColor(opt){
  switch (opt){
    case "HLC":   
      fill(252,140,3);
      break;
    case "YML": 
      fill(212,205,199);
      break;
    case "COS": 
      fill(140,180,180);
      break;
    default:
      fill(132,232,232);
  }
}

function cvtArea(a){
  if (a == "SC") return 4;
  return a.charCodeAt(0)-65;
}

function preload(){
  $.getJSON("../data/cont3.json", function(data){
    cArray = data;
  })
  $.getJSON("../data/etd.json", function(data){
    depot = data;
  })
  console.log("Done");
  // console.log(depot.Area);
  console.log(depot);

}


function init(){
  myFont = loadFont("Poppins-Light.ttf")
  textFont(myFont);
  ambientLight(255,255,255)
  normalMaterial();
  stroke(0)
  textSize(12);
  // debugMode();
  textAlign(CENTER)
  showTextCheckbox = createCheckbox("Show Container name",false);
  showTextCheckbox.changed(changeTextVisibility);

}

function drawCont(cont, ar){
  push();
  strokeWeight(1)
  area = cvtArea(cont.Block);
  b =  cont.Bay-1;
  r =  -cont.Tier+1;
  t =  cont.Row-1;
  rotateY(3.1415926548);
  rotateZ(ar[area].angle);
  x_flip = 1 - 2*ar[area].x_flip;
  translate(0.5*depot.contLength, -0.5*depot.contWidth*x_flip, -0.5*depot.contHeight)
  if (b%2 != 0){
    // Container 40ft
    b = Math.floor(b/2);
    translate(b*(depot.contLength+depot.contGap)+depot.contHalfLength - depot.Area[area].x_coor,-t*(depot.contHeight)*x_flip + depot.Area[area].y_coor, r*(depot.contWidth));
    translate(ar[area].offset.x, ar[area].offset.y)
    setColor(cont.HangTauID)
    box(depot.contLength*2, depot.contHeight, depot.contWidth);
    if (showText){
      fill(255)
      rotateX(1.5707963268);
      translate(0,0, depot.contWidth/2+2)
      text(cont.ContID, 0,0);
    }
  }else{
    // Container 20ft
    b=b/2
    translate(b*(depot.contLength+depot.contGap)+depot.contHalfLength - depot.Area[area].x_coor,-t*(depot.contHeight)*x_flip + depot.Area[area].y_coor, r*(depot.contWidth));
    translate(ar[area].offset.x, ar[area].offset.y)
    setColor(cont.HangTauID)
    box(depot.contLength, depot.contHeight, depot.contWidth);
    if (showText){
      fill(255)
      rotateX(1.5707963268);
      translate(0,0, depot.contWidth/2+2);
      text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);
    }
  }
  pop();
}
  
function drawDepot(depot){
  push();
  for (let j=0; j<depot.layout.shape.length; j++){
    for (let i =0; i<depot.layout.shape[j].length-1; i++){
      p1 = depot.layout.shape[j].seq[i]
      p2 = depot.layout.shape[j].seq[i+1]
      line(p1.x, p1.y, p2.x, p2.y)
    }
  }
  pop();
}

function drawHouse(house){
  for (let i=0; i<house.length; i++){
    push();
    // rotateX(1.5707963268)
    p1 = house[i].shape.seq[house[i].id1]
    p2 = house[i].shape.seq[house[i].id2]
    w = Math.abs(p1.x-p2.x)
    h = Math.abs(p1.y-p2.y)
    // console.log(x);
    fill(100);
    translate(p1.x-w/2,p1.y-h/2,house[i].height/2)
    rotateZ(-house[i].angle)
    box(w, h, house[i].height)
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight-100, WEBGL);
  init()
}

function draw() {
  orbitControl(2,2,0.1);
  rotateX(1.5707963268);

  background(240);
  strokeWeight(2)
  drawDepot(depot);
  for(let i =0; i<cArray.length; i++){
    drawCont(cArray[i],depot.Area)
  }
  drawHouse(depot.house);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight-100);
}

function changeTextVisibility(){
  if (showTextCheckbox.checked()){
    showText = true;
    frameRate(24);
  }else{
    showText = false;
    frameRate(60);

  }
}

// function mouseClicked(){
//   console.log(mouseX, mouseY)
// }

// function touchMoved() {
//   ellipse(mouseX, mouseY, 5, 5);
//   return false;
// }