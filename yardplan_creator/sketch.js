const largeFontSize = 28
let depot;
let mode="view";
let newAreaStart=undefined;
let newAreaEnd=undefined;
const scaleFactor = 0.4;

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}
class Area{
  constructor(x,y,w,h){
    this.name = undefined;
    this.data = undefined;
    this.x_coor = x;
    this.y_coor = y;
    this.angle = undefined;
    this.x_flip = undefined;
    this.y_flip = undefined;
    this.width = undefined;
    this.height = undefined;
    this.num_of_bay = w;
    this.num_of_row = h;
  }
}

function drawDepot(){
  push();
  // erase()
  translate(-height/2, width/2);
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
  // noErase();
  // noFill();
  // for (let i =0; i<depot.layout.shape[0].length-1; i++){
  //   p1 = depot.layout.shape[0].seq[i];
  //   p2 = depot.layout.shape[0].seq[i+1];
  //   line(p1.x, p1.y, p2.x, p2.y)
  // }
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
    circle(0,0,20)
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
  // fill(0);
  // for (let i=0; i<depot.layout.text.length; i++){
  //   push();
  //   textSize(largeFontSize);
  //   pos = depot.layout.text[i].position;
  //   translate(pos.x, pos.y,11);
  //   rotate(Math.PI/2);
  //   text(depot.layout.text[i].content, 0,0);
  //   pop();
  // }
  pop();

}

function preload(){
  $.getJSON("./data/etdv1.json", function(data){
    depot = data;
    // depot.Area = [];
    init()
    // loop();
    console.log("Done");

  })
}

function init(){
  background(240)
  // drawDepot();
  // newArea = new Area(0,0)
  // newAreaStart = new Point(0,0);
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-80);
  myCanvas.parent("main_canvas");
  // debugMode()
  // noLoop();
}

function draw(){
  background(240);
  if (mode=="add_area"){
    circle(mouseX,mouseY,10)
  }
  push();
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);

  scale(scaleFactor);
  // rotate(-PI/2);
  // translate(width,1.5*height);
  fill(255,0,0);
  circle(0,0,50);
  line(0,0,20,0);
  line(0,0,0,40);
  noFill();
  drawDepot();
  pop();
  if ((mode=="add_area")){
  }
  // noLoop();
}

function mousePressed(){
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if (mode=="add_area"){
    console.log(x,y);
    // newAreaStart = new Point(mouseX, mouseY);
    // console.log('newAreaStart: ', newAreaStart);
  }
  // console.log(x,y);
  let mm = mouseMap(x,y);
  console.log(Math.floor(mm.x),Math.floor(mm.y));
  let real = mouseUnMap(mm.x,mm.y);
  console.log(real);
  depot.Area.push(new Area(real.x, real.y,100,100))
}

// function mouseReleased(){
//   if (mode=="add_area"){
//     // console.log(x,y);
//     newAreaEnd = new Point(Math.floor(mouseX-newAreaEnd.x), Math.floor(mouseY-newAreaEnd.y));
//     console.log('newAreaEnd: ', newAreaEnd);
//     mode = "view";
//   }
// }

// // function mouseDragged(){
// //   if (mode=="add_area"){
// //     drawNewArea();
// //   }
// // }

function addArea(){
  mode = "add_area";
  console.log('mode: ', mode);
  console.log("Grid shown");

}

function doneAddArea(){
  mode = "view";
  console.log('mode: ', mode);
  // depot.Area.push(new Area(newAreaStart.x, newAreaStart.y, newAreaEnd.x, newAreaEnd.y));
  // console.log('newArea: ', newArea);

}

// function drawNewArea(){
//   rect(newAreaStart.x, newAreaStart.y, mouseX-newAreaStart.x, mouseY-newAreaStart.y)
// }

function checkGround(x,y){
  for (let i=0; i<depot.ground.length; i++){
    // count = 0;
    // for (let j=0; j<depot.layout.shape[depot.ground[i].shapeID].length-1; j++){
    //   let p1 = depot.layout.shape[depot.ground[i].shapeID].seq[j];
    //   let p2 = depot.layout.shape[depot.ground[i].shapeID].seq[j+1];
    //   let a = createVector(x-p1.x, y-p1.y);
    //   let b = createVector(x-p2.x, y-p2.y);
    //   let c = p5.Vector.mult(a,b);
    //   if (c.mag()<0){
    //     count++;
    //   }
    // }
    // if (count==depot.layout.shape[depot.ground[i].shapeID].length-1){
    //   return i
    // }
    k = mouseUnMap(x,y);
    console.log('k: ', k.x, k.y);

    if (pointIsInPoly(k, depot.layout.shape[depot.ground[i].shapeID].seq)==0){
      return i;
    }
  }
  return -1;
}

function mouseMap(x,y){
  let p = createVector(x-width/2-depot.offset.x,y-height/2 - depot.offset.y);
  p.mult(scaleFactor);
  return p;
}

function mouseUnMap(x,y){
  // let p = createVector(x/scaleFactor,y/scaleFactor);
  // p.add(-(width/2 + depot.offset.x), -(height/2 + depot.offset.y));
  let p = createVector(x-(width/2 + depot.offset.x), y-(height/2 + depot.offset.y));
  p.mult(1/scaleFactor)
  return p;
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
