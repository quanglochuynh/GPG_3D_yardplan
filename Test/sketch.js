let depot;
let scaleFactor;
let gridAngle = 0;

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}
// /Users/lochuynhquang/Documents/GPG_3D_yardplan/yardplan_creator/data/etdv1.json
function preload(){
  $.getJSON("../../yardplan_creator/data/etdv1.json", function(data){
    depot = data;
    depot.Area = [];
    findCenter();
    alignMap();
    loop();
  })
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-80);
  frameRate(10)

}

function draw() {
  background(220);
  // background(255);
  drawDepot();
}


function drawDepot(){
  push();
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  strokeWeight(2)
  // fill(0)
  for (let i=0; i<depot.ground.length;i++){
    beginShape();
    for (let j=1; j<depot.layout.shape[i].length; j++){
      p1 = depot.layout.shape[i].seq[j];
      vertex(p1.x,p1.y,0)
    }
    endShape(CLOSE);
  }
  fill(40);
  for (let j=depot.ground.length+6; j<depot.layout.shape.length; j++){    // so 6 tam gan cung
    beginShape()
    for (let i =0; i<depot.layout.shape[j].length; i++){
      p1 = depot.layout.shape[j].seq[i];
      vertex(p1.x, p1.y);
    }
    endShape(CLOSE);
  }
  fill("pink")
  for (let i=0; i<depot.Area.length; i++){
    translate(depot.Area[i].x_coor,depot.Area[i].y_coor)
    circle(0,0,40)
    x_flip = -1 + 2*depot.Area[i].x_flip;
    for (let j=0; j<depot.Area[i].num_of_bay; j++){
      for (let k=0; k<depot.Area[i].num_of_row; k++){
        push();
        rotate(-depot.Area[i].angle)
        translate(k*depot.contWidth*x_flip, j*(depot.contLength+depot.contGap),)
        rect(0,0, depot.contWidth*x_flip, depot.contLength)
        pop()
      }
    }
    translate(-depot.Area[i].x_coor,-depot.Area[i].y_coor)
  }
  pop();

}


function gridMaping(px,py){
  let x = px - blank.x;
  let y = py - blank.y;
  if (!gridAngle){
    let dx = Math.floor(x/(depot.contWidth*scaleFactor));
    let dy = Math.floor(y/((depot.contLength+depot.contGap)*scaleFactor));
    return [new Point(dx,dy), new Point(Math.round(dx-(blank.x/(depot.contWidth*scaleFactor))), Math.round(dy-(blank.y/(depot.contLength*scaleFactor))))]
  }
  let dx = Math.floor(x/((depot.contLength+depot.contGap)*scaleFactor));
  let dy = Math.floor(y/(depot.contWidth*scaleFactor));
  return [new Point(dx,dy), new Point(Math.round(dx-(blank.x/(depot.contWidth*scaleFactor))), Math.round(dy-(blank.y/(depot.contLength*scaleFactor))))]
}

function findCenter(){
  var minX = Infinity, maxX = -Infinity;
  var minY = Infinity, maxY = -Infinity;
  for (let i=0; i<depot.ground.length; i++){
    polygon = depot.layout.shape[depot.ground[i].shapeID].seq;
    for (var n = 1; n < polygon.length; n++) {
      var q = polygon[n];
      minX = Math.min(q.x, minX);
      maxX = Math.max(q.x, maxX);
      minY = Math.min(q.y, minY);
      maxY = Math.max(q.y, maxY);
    }
  }
  depot.gridOrigin = createVector(minX, minY)
  depot.width = maxX - minX;
  depot.height = maxY - minY;
  depot.center = createVector((minX+maxX)/2, (minY+maxY)/2);
}

function alignMap(){
  let mapAspect = depot.width/depot.height;
  let screenAspect = width/height;
  if (screenAspect>mapAspect){
    //laptop
    scaleFactor = height/depot.height;
    blank = createVector((width-depot.width*scaleFactor)/2,0)
  }else{
    //phone
    scaleFactor = width/depot.width;
    blank = createVector(0,(height-depot.height*scaleFactor)/2)
  }
  depot.offset = p5.Vector.mult(depot.center,-scaleFactor);
  depot.gridOffset = p5.Vector.mult(depot.gridOrigin, scaleFactor);
  // depot.gridOffset = p5.Vector.sub(depot.gridOffset, depot.offset);
}

function windowResized() {
  resizeCanvas(windowWidth-40, windowHeight-80);
  alignMap();
}

function mousePressed(){
  console.log(checkGround(mouseX, mouseY));
}

function checkGround(x,y){
  // console.log(pointIsInPoly(mouseMap(x,y), depot.layout.shape[0].seq));
  for (let i=0; i<depot.ground.length; i++){
    let id = depot.ground[i].shapeID
    let k = pointIsInPoly(mouseMap(x,y), depot.layout.shape[id].seq)
    if (k!=false) return i;
  }
  return -1;
}

function pointIsInPoly(p, polygon) {
  var isInside = false;
  var minX = polygon[0].x, maxX = polygon[0].x;
  var minY = polygon[0].y, maxY = polygon[0].y;
  for (var n = 1; n < polygon.length; n++) {
      var q = polygon[n];
      minX = Math.min(q.x, minX);
      maxX = Math.max(q.x, maxX);
      minY = Math.min(q.y, minY);
      maxY = Math.max(q.y, maxY);
  }

  if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
      return false;
  }

  var i = 0, j = polygon.length - 1;
  for (i, j; i < polygon.length; j = i++) {
      if ( (polygon[i].y > p.y) != (polygon[j].y > p.y) &&
              p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
          isInside = !isInside;
      }
  }

  return isInside;
}

function mouseMap(x,y){
  let p = createVector(x-width/2-depot.offset.x,y-height/2 - depot.offset.y);
  return p5.Vector.mult(p, 1/scaleFactor);
}