let cArray = undefined;
let depot = undefined;
let showText = false;
let rotOffset = [];
let table;
let easycam;
const largeFontSize = 48;
const smallFontSize = 14
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
    console.log(depot);

  })
  console.log("Done");
}


function init(){
  myFont = loadFont("Poppins-Light.ttf", )
  textFont(myFont);
  ambientLight(255,255,255)
  normalMaterial();
  stroke(0)
  textSize(smallFontSize);
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
      if ((k[2]>0.5)||(k[2]<-0.5)){
        translate(0,0, depot.contWidth/2+2);
      }else{
        rotateY(Math.PI);
        translate(0,0, depot.contWidth/2+2);
      }
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
      k = easycam.getRotation();
      if ((k[2]>0.5)||(k[2]<-0.5)){
        translate(0,0, depot.contWidth/2+2);
      }else{
        rotateY(Math.PI);
        translate(0,0, depot.contWidth/2+2);
      }
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
    p1 = house[i].shape.seq[house[i].id1]
    p2 = house[i].shape.seq[house[i].id2]
    w = Math.abs(p1.x-p2.x)
    h = Math.abs(p1.y-p2.y)
    fill(100);
    translate(p1.x-w/2,p1.y-h/2,house[i].height/2)
    rotateZ(-house[i].angle)
    box(w, h, house[i].height)
    translate(0,0,house[i].height/2+1)
    fill(255)
    if (w<h){
      rotateZ(1.5707963268)
    }
    textSize(largeFontSize)
    text(house[i].name, 0,0)
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight-100, WEBGL);
  setAttributes('antialias', true);
  easycam = new Dw.EasyCam(this._renderer, {distance : 2000}); 
  // easycam.setRotationConstraint(true, true, false);

  document.oncontextmenu = function() { return false; }
  document.onmousedown   = function() { return false; }
  init()

}

function draw() {
  // orbitControl(2,2,0.1);
  // perspective(60 * PI/180, width/height, 1, 5000);

  rotateX(1.5707963268);
  background(240);
  strokeWeight(2)
  drawDepot(depot);
  for(let i =0; i<cArray.length; i++){
    drawCont(cArray[i],depot.Area)
  }
  drawHouse(depot.house);
  // console.log(easycam.getRotation());
  // noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight-100);
  easycam.setViewport([0,0,windowWidth, windowHeight]);
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

function mouseReleased(){
  // console.log("clgt");
  r = easycam.getRotation()
  // r[3] = 0;
  console.log(r);
}


// function docFile(){
//   path = document.getElementById("excel_upload").value;
//   console.log(path);
//   table = loadTable("upload/" + path + ".csv", "header", loadData())

// }

// function loadData(){
//   contID = table.getColumn("contID");
//   hangtau = table.getColumn("HangTauID");
//   block = table.getColumn("Block");
//   bay = table.getColumn("Bay");
//   row = table.getColumn("Row");
//   tier = table.getColumn("Tier")
//   cArray.clear();
//   for (let i=0; i<contID.length; i++){
//     cArray.push(Container(contID[i], hangtau[i], block[i], bay[i],row[i], tier[i]))
//   }
// }


// class Container{
//   constructor(id, HangTauID, block, bay, row, tier){
//     self.ContID = id;
//     self.HangTauID = HangTauID;
//     self.Block = block;
//     self.Bay = bay;
//     self.Row = row;
//     self.Tier = tier;
//   }
// }