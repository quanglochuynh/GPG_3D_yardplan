const largeFontSize = 28
let depot;
let mode="view";
let newAreaStart=undefined;
let newAreaEnd=undefined;

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
  translate(-height/2, width/2);
  strokeWeight(2)
  beginShape();
  for (let j=1; j<depot.layout.shape[0].length; j++){
    p1 = depot.layout.shape[0].seq[j];
    vertex(p1.x,p1.y,0)
  }
  endShape(CLOSE);
  noFill();
  for (let i =0; i<depot.layout.shape[0].length-1; i++){
    p1 = depot.layout.shape[0].seq[i]
    p2 = depot.layout.shape[0].seq[i+1]
    line(p1.x, p1.y, p2.x, p2.y)
  }
  fill(40);
  for (let j=7; j<depot.layout.shape.length; j++){
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
        translate(-j*(depot.contLength+depot.contGap),k*depot.contWidth*x_flip)
        rect(0,0,-depot.contLength, depot.contWidth*x_flip)
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
  $.getJSON("./data/etd.json", function(data){
    depot = data;
    depot.Area = [];
    init()
    // loop();
    console.log("Done");

  })
}

function init(){
  // background(240)
  // drawDepot();
  // newArea = new Area(0,0)
  newAreaStart = new Point(0,0);
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
  scale(0.35);
  rotate(-PI/2);
  translate(-height,width);
  fill(255,0,0);
  circle(0,0,50);
  noFill();
  drawDepot();
  if ((mode=="add_area")){
    drawGrid();
  }
  // noLoop();
}

function drawGrid(){
  // for 
}

// function mousePressed(){
//   let x = Math.floor(mouseX);
//   let y = Math.floor(mouseY);
//   if (mode=="add_area"){
//     console.log(x,y);
//     newAreaStart = new Point(mouseX, mouseY);
//     console.log('newAreaStart: ', newAreaStart);
//   }
// }

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