cArray = undefined;
depot = undefined;


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

function cvtArea(a){
  return a.charCodeAt(0)-65;
}

function preload(){
  $.getJSON("../data/cont.json", function(data){
    cArray = data;
  })
  $.getJSON("../data/etd.json", function(data){
    depot = data;
  })
}


function init(){
  myFont = loadFont("Poppins-Light.ttf")
  textFont(myFont);
  ambientLight(255,255,255)
  normalMaterial();
  stroke(0)
  textSize(4);
  // debugMode()
  textAlign(CENTER)
}

function drawCont(cont){
  push();
  strokeWeight(1)

  rotateY(3.1415926548);
  area = cvtArea(cont.Block);
  b =  cont.Bay-1;
  r =  -cont.Tier+1;
  t =  cont.Row-1;
  translate(0.5*depot.contLength, -0.5*depot.contHeight, 0.5*depot.contWidth)
  if (b%2 != 0){
    // Container 40ft
    b = Math.floor(b/2);
    translate(b*(depot.contLength+depot.contGap)+depot.contHalfLength - depot.Area[area].x_coor,r*depot.contHeight,t*depot.contWidth - depot.Area[area].y_coor);

    setColor(cont.HangTauID)
    box(depot.contLength*2, depot.contHeight, depot.contWidth);
    fill(255)
    rotateY(1.5707963268)
    // translate(0,0,depot.contLength+1)
  }else{
    // Container 20ft
    b=b/2
    translate(b*(depot.contLength+depot.contGap) - depot.Area[area].x_coor,r*depot.contHeight,t*depot.contWidth - depot.Area[area].y_coor);
    setColor(cont.HangTauID)
    box(depot.contLength, depot.contHeight, depot.contWidth);
    fill(255)
    rotateY(1.5707963268)
    // translate(0,0,depot.contHalfLength+1)
  }
  // text(cont.Container.substring(0,4)+"\n" + cont.Container.substring(4,11), 0,0)
  pop();
}
  
function drawDepot(depot){
  push();
  rotateX(1.5707963268);
  for (let j=0; j<depot.layout.shape.length; j++){
    for (let i =0; i<depot.layout.shape[j].length-1; i++){
      p1 = depot.layout.shape[j].seq[i]
      p2 = depot.layout.shape[j].seq[i+1]
      line(p1.x, p1.y, p2.x, p2.y)
    }
  }

  // for (let i=0; i<depot.Warehouse.length; i++){
  //   x = depot.layout.shape[depot.Warehouse[i].shapeID];
  //   box()
  // }

  pop();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  init();
  // frameRate(10)
}
function draw() {
  orbitControl(2,2,0.5);

  background(240);
  strokeWeight(2)
  drawDepot(depot);
  for(let i =0; i<cArray.length; i++){
    drawCont(cArray[i])
  }
  // noLoop();

}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }