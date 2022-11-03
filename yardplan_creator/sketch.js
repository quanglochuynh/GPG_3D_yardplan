const largeFontSize = 28
let depot;
let mode="view";
let tempArea=undefined;
let scaleFactor = 0.4;
let gridAngle = 0;
let selection;
let selectionStart = {x:0, y:0};
let selectionEnd = {x:0, y:0};
let mapCenter;
let blank = {x:0, y:0};
let selectRectStart;
let verticalArray, horizontalArray;

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
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.opt=undefined;
    this.num_of_tier = 6;
    this.bay_name = undefined;

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
  // document.getElementById("addPanel").style.visibility = "hidden";
  document.getElementById("checkAngle").checked = false;
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  document.body.classList.add("stop-scrolling")
  background(240)
  findCenter();
  alignMap();
  initTeuArray();
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-80);
  myCanvas.parent("main_canvas");
  frameRate(10)
}

function draw(){
  background(250); 
  stroke(0); 
  strokeWeight(4);
  push();
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  // fill(255,0,0);
  // circle(0,0,50);
  // line(0,0,20,0);
  // line(0,0,0,40);
  fill('cyan');
  circle(depot.gridOrigin.x, depot.gridOrigin.y, 50)
  noFill();
  pop();
  drawDepot();
  if (mode=="add_area"){
    showGrid();
    push();
    translate(blank.x, blank.y);
    scale(scaleFactor);
    strokeWeight(2);
    stroke("red")
    let p = gridMaping(mouseX, mouseY)
    let x = p[0].x;
    let y = p[0].y;
    if (gridAngle == false){
      rect(x*depot.contWidth, y*((depot.contLength+depot.contGap)), depot.contWidth, depot.contLength)
    }else{
      rect(x*(depot.contLength+depot.contGap), y*(depot.contWidth), depot.contLength, depot.contWidth)
    }
    pop();
    drawSelection();
    noFill();
    strokeWeight(2);
    if ((mouseIsPressed)&&(selectRectStart!=undefined)){
      if ((x<0)||(y<0)) return;
      rect(selectRectStart.x, selectRectStart.y, mouseX - selectRectStart.x, mouseY-selectRectStart.y);
    }
  }
}

function mousePressed(){
  resetSelection();
  let x = Math.floor(mouseX);
  // console.log('x: ', x);
  let y = Math.floor(mouseY);
  // console.log('y: ', y);
  if ((x<0)||(y<0)) return;
  if (mode=="add_area"){
    selection = [];
    selectionStart = gridMaping(x, y)[0]
    if ((selectionStart.x<0)){
      selectionStart.x = 0;
    }
    if ((selectionStart.y<0)){
      selectionStart.y=0;
    }
    selectRectStart = new Point(x, y);
    let p = gridMaping(x,y)[0];
    if (!gridAngle){
      console.log(verticalArray[p.x][p.y]);

    }else{
      console.log(horizontalArray[p.x][p.y]);
    }
  }else if (mode=="view"){
    let p = gridMaping(x,y)[0];
    if (!gridAngle){
      console.log(verticalArray[p.x][p.y]);
    }else{
      console.log(horizontalArray[p.x][p.y]);
    }
  }

}

function mouseDragged(){
  if (mode=="add_area"){
    selectionEnd = gridMaping(mouseX, mouseY)[1]
  }
}

function mouseReleased(){
  if (mode=="add_area"){
    selectionEnd = gridMaping(mouseX, mouseY)[0];
    if ((selectionEnd.x<0)){
      selectionEnd.x = 0;
    }
    if ((selectionEnd.y<0)){
      selectionEnd.y=0;
    }
    let hx = (selectionStart.x < selectionEnd.x);
    let hy = (selectionStart.y < selectionEnd.y);
    if (!hx){
      [selectionStart.x, selectionEnd.x] = [selectionEnd.x, selectionStart.x];
    }
    if (!hy){
      [selectionStart.y, selectionEnd.y] = [selectionEnd.y, selectionStart.y];
    }
    for (let i=selectionStart.x; i<=selectionEnd.x; i++){
      for (let j=selectionStart.y; j<=selectionEnd.y; j++){
        selection.push(new Point(i,j));
      }
    }
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

// function mouseUnMap(x,y){
//   let p = createVector(x/1,y/1);
//   // p.sub(-width/2-depot.offset.x, height/2 + depot.offset.y);
//   // let p = createVector((depot.offset.x + width/2)/scaleFactor, (depot.offset.y+height/2)/scaleFactor);
//   // p.mult(1/scaleFactor)
//   return p;
// }

function showGrid(){
  push();
  stroke('rgba(0,0,0,0.125)');
  noFill();
  strokeWeight(1);
  // translate(width/2+depot.offset.x ,height/2 + depot.offset.y);
  // translate(depot.gridOrigin.x, depot.gridOrigin.y);
  translate(blank.x, blank.y);
  scale(scaleFactor);

  if (document.getElementById("checkAngle").checked == false){
    for (let x=0; x<depot.width; x+=depot.contWidth){
      for (let y=0; y<depot.height; y+=(depot.contLength+depot.contGap)){
        rect(x,y, depot.contWidth, depot.contLength);
      }
    }
    fill("GREEN");
    circle(0,0,50);
  }else{
    for (let x = 0; x<depot.width; x+=(depot.contLength + depot.contGap)){
      for (let y=0; y<depot.height; y+= (depot.contWidth)){
        rect(x, y, depot.contLength, depot.contWidth)      
      }
    }
  }
  pop();
}

function changeGridAngle(){
  selection = [];
  gridAngle = (document.getElementById("checkAngle").checked)
}

function drawSelection(){
  push()
  translate(blank.x, blank.y);
  scale(scaleFactor);
  stroke("blue");
  for (let i=0; i<selection.length; i++){
    if (!gridAngle){
      rect(selection[i].x*depot.contWidth, selection[i].y*(depot.contLength + depot.contGap), depot.contWidth, (depot.contLength))
    }else{
      rect(selection[i].x*(depot.contLength + depot.contGap), selection[i].y*depot.contWidth, (depot.contLength), depot.contWidth)
    }
  }
  pop();
}

function resetSelection(){
  selection = [];
  selectionStart = {x:0, y:0};
  selectionEnd = {x:0, y:0};
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

function initTeuArray(){
  verticalArray = [];
  for (let x=0; x<depot.width; x+=depot.contWidth){
    temp = [];
    for (let y=0; y<depot.height; y+=(depot.contLength+depot.contGap)){
      // let mm = mouseMap()
      temp.push(new Teu(x,y))
    }
    verticalArray.push(temp);
  }
  horizontalArray = [];
  for (let x = 0; x<depot.width; x+=(depot.contLength + depot.contGap)){
    temp = [];
    for (let y=0; y<depot.height; y+= (depot.contWidth)){
      temp.push(new Teu(x,y))
    }
    verticalArray.push(temp);
  }
}