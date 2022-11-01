const largeFontSize = 28
let depot;
let mode="view";
let tempArea=undefined;
const scaleFactor = 0.4;
let gridAngle = 0;
let selection = [];
let selectionStart = {x:0, y:0};
let selectionEnd = {x:0, y:0};

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}
class Area{
  constructor(x,y,b,r,a, xflip){
    this.name = undefined;
    this.data = undefined;
    this.angle = a;
    this.x_coor = x;
    this.y_coor = y;
    // this.angle = undefined;
    this.x_flip = xflip;
    this.y_flip = undefined;
    this.num_of_bay = b;
    this.num_of_row = r;
  }
}

class Teu{
  constructor(x, y, opt){
    this.x = x;
    this.y = y;
    this.opt=opt;
  }
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
    depot.Area = [];
    init()
    // loop();
    console.log("Done");

  })
}

function init(){
  document.getElementById("addPanel").style.visibility = "hidden";
  document.getElementById("checkAngle").checked = false;
  background(240)
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-80);
  myCanvas.parent("main_canvas");
  frameRate(20)
}

function draw(){
  background(240); 
  stroke(0); 
  strokeWeight(4);
  push();
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  fill(255,0,0);
  circle(0,0,50);
  line(0,0,20,0);
  line(0,0,0,40);
  noFill();
  pop();
  drawDepot();
  if (mode=="add_area"){
    // let mm = mouseMap(mouseX,mouseY);
    showGrid();
    if (gridAngle == false){
      strokeWeight(2);
      stroke("red")
      let x = Math.floor(mouseX/(depot.contWidth*scaleFactor));
      let y = Math.floor(mouseY/((depot.contLength+depot.contGap)*scaleFactor));
      rect(x*depot.contWidth*scaleFactor, y*((depot.contLength+depot.contGap)*scaleFactor), depot.contWidth*scaleFactor, depot.contLength*scaleFactor)
    }else{
      strokeWeight(2);
      stroke("red")
      let x = Math.floor(mouseX/((depot.contLength+depot.contGap)*scaleFactor));
      let y = Math.floor(mouseY/(depot.contWidth*scaleFactor))
      rect(x*(depot.contLength+depot.contGap)*scaleFactor, y*(depot.contWidth*scaleFactor), depot.contLength*scaleFactor, depot.contWidth*scaleFactor)
    }
    drawSelection();

  }
}

function mousePressed(){
resetSelection();
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if ((x<0)||(y<0)) return;
  if (mode=="add_area"){
    let mm = mouseMap(x,y);
    selectionStart = new Point(mouseX, mouseY)
  }
}

function mouseDragged(){
  if (mode=="add_area"){
    selectionEnd = new Point(mouseX, mouseY);
  }
}

function mouseReleased(){
  if (mode=="add_area"){
    selectionEnd = new Point(mouseX, mouseY);
  }
}

function addArea(){
  mode = "add_area";
  document.getElementById("addPanel").style.visibility = "visible";
  console.log('mode: ', mode);
  console.log("Grid shown");
}

function doneAddArea(){
  mode = "view";
  document.getElementById("addPanel").style.visibility = "hidden";
  console.log('mode: ', mode);
}


function mouseMap(x,y){
  let p = createVector(x-width/2-depot.offset.x,y-height/2 - depot.offset.y);
  return p5.Vector.mult(p, 1/scaleFactor);
}

function mouseUnMap(x,y){
  let p = createVector(x/1,y/1);
  // p.sub(-width/2-depot.offset.x, height/2 + depot.offset.y);
  // let p = createVector((depot.offset.x + width/2)/scaleFactor, (depot.offset.y+height/2)/scaleFactor);
  // p.mult(1/scaleFactor)
  return p;
}

function keyPressed(){
  if (key=="Backspace"){
    depot.Area.pop();
  }
}

function drawTempArea(){
  push()
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  translate(tempArea.x_coor,tempArea.y_coor)
  circle(0,0,40)
  x_flip = -1 + 2*tempArea.x_flip;
  for (let j=0; j<tempArea.num_of_bay; j++){
    for (let k=0; k<tempArea.num_of_row; k++){
      push();
      rotate(-tempArea.angle)
      translate(k*depot.contWidth*x_flip, j*(depot.contLength+depot.contGap),)
      rect(0,0, depot.contWidth*x_flip, depot.contLength);
      pop();
    }
  }
  pop();
}

function previewAddArea(){
  tempArea. angle = (document.getElementById("edtxAngle").value)/360 * (2*PI);
  // tempArea = new Area(0,0,num_of_bay,num_of_row,angle,x_flip)
}

function showGrid(){
  stroke(0);
  noFill();
  strokeWeight(1);
  if (document.getElementById("checkAngle").checked == false){
    // for (let x=0; x<2*width; x+= depot.contWidth*scaleFactor){
    //   line(x,-2*height, x,2*height);
    // }
    // for (let y=0; y<2*height; y+= depot.contLength*scaleFactor){
    //   line(-2*width,y, 2*width,y);
    // }
    for (let x = 0; x<width; x+=(depot.contWidth)*scaleFactor){
      for (let y=0; y<height; y+= (depot.contLength + depot.contGap)*scaleFactor){
        rect(x, y, depot.contWidth*scaleFactor, depot.contLength*scaleFactor)      }
    }
  }else{
    for (let x = 0; x<width; x+=(depot.contLength + depot.contGap)*scaleFactor){
      for (let y=0; y<height; y+= (depot.contWidth)*scaleFactor){
        rect(x, y, depot.contLength*scaleFactor, depot.contWidth*scaleFactor)      }
    }
  }
}

function changeGridAngle(){
  gridAngle = (document.getElementById("checkAngle").checked)
}

function drawSelection(){
  stroke("blue");
  if ((selectionStart.x == selectionEnd.x)&&(selectionStart.y== selectionEnd.y)){
    if (gridAngle==false){
      let dx = Math.floor(selectionStart.x/(depot.contWidth*scaleFactor));
      let dy = Math.floor(selectionStart.y/((depot.contLength+depot.contGap)*scaleFactor));
      rect(dx*depot.contWidth*scaleFactor, dy*((depot.contLength+depot.contGap)*scaleFactor), depot.contWidth*scaleFactor, (depot.contLength)*scaleFactor)
    }else{
      let dx = Math.floor(selectionStart.x/((depot.contLength+depot.contGap)*scaleFactor));
      let dy = Math.floor(selectionStart.y/(depot.contWidth*scaleFactor));
      rect(dx*(depot.contLength+depot.contGap)*scaleFactor, dy*(depot.contWidth*scaleFactor), (depot.contLength)*scaleFactor, depot.contWidth*scaleFactor)
    }
  }else{
    if (gridAngle==false){
      for (let x = selectionStart.x; x<selectionEnd.x; x+= depot.contWidth*scaleFactor){
        for (let y = selectionStart.y; y<selectionEnd.y; y+= (depot.contLength+depot.contGap)*scaleFactor){
          let dx = Math.floor(x/(depot.contWidth*scaleFactor));
          let dy = Math.floor(y/((depot.contLength+depot.contGap)*scaleFactor));
          rect(dx*depot.contWidth*scaleFactor, dy*((depot.contLength+depot.contGap)*scaleFactor), depot.contWidth*scaleFactor, (depot.contLength)*scaleFactor)
        }
      }
    }else{
      for (let x = selectionStart.x; x<selectionEnd.x; x+= (depot.contLength+depot.contGap)*scaleFactor){
        for (let y = selectionStart.y; y<selectionEnd.y; y+= (depot.contWidth)*scaleFactor){
          let dx = Math.floor(x/((depot.contLength+depot.contGap)*scaleFactor));
          let dy = Math.floor(y/(depot.contWidth*scaleFactor));
          rect(dx*(depot.contLength+depot.contGap)*scaleFactor, dy*(depot.contWidth*scaleFactor), (depot.contLength)*scaleFactor, depot.contWidth*scaleFactor)
        }
      }
    }
  }
}

function resetSelection(){
  selection = [];
  selectionStart = {x:0, y:0};
  selectionEnd = {x:0, y:0};
}