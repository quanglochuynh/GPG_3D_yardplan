const largeFontSize = 28
let depot;
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
let areaList;
let bayNameArray;
let optArray;
let countBay;
let countOpt;;
let sumAll;
let showGrid = false;


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
  constructor(x, y, o){
    this.x = x;
    this.y = y;
    this.orient = o;      //0 vertical, 1 horizontal
    this.opt=undefined;
    this.num_of_tier = undefined;
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
  updateStat();
  resetSelection();
  noLoop();
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-80);
  myCanvas.parent("main_canvas");
  myCanvas.mouseMoved(redraw)
  frameRate(10)
}

function draw(){
  background(250); 
  stroke(0); 
  strokeWeight(4);
  push();
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  fill('cyan');
  // circle(depot.gridOrigin.x, depot.gridOrigin.y, 50)
  noFill();
  pop();
  drawDepot();
  drawTeu();
  if (showGrid){
    drawGrid();
  }
  drawSelectionRect();
  drawSelection();
  drawCursor();
  showStat();
}

function mousePressed(){
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if (insideDepot(x,y)==false) return;
  resetSelection();
  updatePanel(getTeuFromCursor(x,y));
  selection = [];
  let p = gridMaping(x, y)[0] ;
  selectionStart = p;
  if ((selectionStart.x<0)){
    resetSelection();
  }
  if ((selectionStart.y<0)){
    resetSelection();
  }
  selectRectStart = new Point(x, y);
  redraw();
}

function mouseDragged(){
  if (insideDepot(mouseX,mouseY)){
    selectionEnd = gridMaping(mouseX, mouseY)[1]
    redraw();
  }
}

function mouseReleased(){
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if (insideDepot(x,y)==false) return;
  selectionEnd = gridMaping(mouseX, mouseY)[0];
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

  redraw();
}

function addArea(){
  showGrid = document.getElementById("checkGrid").checked;
  redraw();
}

function doneAddArea(){
  let opt = document.getElementById("edtxOpt").value;
  let bay = document.getElementById("edtxBay").value;
  let tier = parseInt(document.getElementById("edtxNumTier").value);
  if (opt==""){
    alert("Thiếu thông tin hãng tàu");
    return;
  }
  if (bay==""){
    alert("Thiếu tên Bay");
    return;
  }
  if (tier==""){
    alert("Thiếu số tầng");
    return;
  }
  for (let i=0; i<selection.length; i++){
    if (!gridAngle){
      verticalArray[selection[i].x][selection[i].y].opt = opt.toUpperCase();
      verticalArray[selection[i].x][selection[i].y].bay_name = bay.toUpperCase();
      verticalArray[selection[i].x][selection[i].y].num_of_tier = tier;
    }else{
      horizontalArray[selection[i].x][selection[i].y].opt = opt.toUpperCase();
      horizontalArray[selection[i].x][selection[i].y].bay_name = bay.toUpperCase();
      horizontalArray[selection[i].x][selection[i].y].num_of_tier = tier;
    }
  }
  // console.log(selection);
  updateStat();
  resetSelection();
  redraw();
}

function resetArea(){
  for (let i=0; i<selection.length; i++){
    if (!gridAngle){
      verticalArray[selection[i].x][selection[i].y].opt = undefined;
      verticalArray[selection[i].x][selection[i].y].bay_name = "";
      verticalArray[selection[i].x][selection[i].y].num_of_tier = "";
    }else{
      horizontalArray[selection[i].x][selection[i].y].opt = undefined;
      horizontalArray[selection[i].x][selection[i].y].bay_name = ""
      horizontalArray[selection[i].x][selection[i].y].num_of_tier = "";
    }
  }
  updateStat();
  redraw();
}

function mouseMap(x,y){
  let p = createVector(x-width/2-depot.offset.x,y-height/2 - depot.offset.y);
  return p5.Vector.mult(p, 1/scaleFactor);
}

function drawGrid(){
  push();
  stroke('rgba(0,0,0,0.125)');
  noFill();
  strokeWeight(1);
  translate(blank.x, blank.y);
  scale(scaleFactor);

  if (document.getElementById("checkAngle").checked == false){
    for (let x=0; x<depot.width; x+=depot.contWidth){
      for (let y=0; y<depot.height; y+=(depot.contLength+depot.contGap)){
        rect(x,y, depot.contWidth, depot.contLength);
      }
    }
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
  redraw();
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
  // selectionStart = {x:0, y:0};
  // selectionStart = selectionEnd;
  // selectionEnd = {x:0, y:0};
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
      temp.push(new Teu(x,y, 0))
    }
    verticalArray.push(temp);
  }
  horizontalArray = [];
  for (let x = 0; x<depot.width; x+=(depot.contLength + depot.contGap)){
    temp = [];
    for (let y=0; y<depot.height; y+= (depot.contWidth)){
      temp.push(new Teu(x,y, 1))
    }
    horizontalArray.push(temp);
  }
  verticalArray[30][10].opt = "HLC"
  verticalArray[30][10].bay_name = "A"
  verticalArray[30][10].num_of_tier = 3

  horizontalArray[15][5].opt= "YML"
  horizontalArray[15][5].bay_name = "B"
  horizontalArray[15][5].num_of_tier = 2

  verticalArray[80][10].opt = "EVG"
  verticalArray[80][10].bay_name = "F"
  verticalArray[80][10].num_of_tier = 4

  horizontalArray[17][5].opt= "YML"
  horizontalArray[17][5].bay_name = "B"
  horizontalArray[17][5].num_of_tier = 1

}

function updatePanel(teu){
  document.getElementById("edtxBay").value = teu.bay_name;
  document.getElementById("edtxOpt").value = teu.opt;
  document.getElementById("edtxNumTier").value = teu.num_of_tier;
  document.getElementById("checkAngle").checked = teu.orient;
  gridAngle = teu.orient;
}

function setColor(opt){
  stroke(2);
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
    case "EVG":
      fill(35, 207, 61)
      break
    default:
      fill(255);
      break;
  }
}

function drawTeu(){
  push();
  translate(blank.x, blank.y);
  scale(scaleFactor);
  textSize(32);
  textAlign(CENTER,CENTER);
  for (let i=0; i<verticalArray.length; i++){
    for (let j=0; j<verticalArray[0].length; j++){
      if (verticalArray[i][j].opt==undefined) continue;
      setColor(verticalArray[i][j].opt)
      stroke(0)
      rect(verticalArray[i][j].x, verticalArray[i][j].y, depot.contWidth, depot.contLength);
      fill(0);
      noStroke();
      text(verticalArray[i][j].num_of_tier, verticalArray[i][j].x + depot.contWidth/2, verticalArray[i][j].y+depot.contLength/2)
    }
  }
  for (let i=0; i<horizontalArray.length; i++){
    for (let j=0; j<horizontalArray[0].length; j++){
      if (horizontalArray[i][j].opt==undefined) continue;
      setColor(horizontalArray[i][j].opt)
      stroke(0)
      rect(horizontalArray[i][j].x, horizontalArray[i][j].y, depot.contLength, depot.contWidth);
      noStroke();
      fill(0)
      text(horizontalArray[i][j].num_of_tier, horizontalArray[i][j].x + depot.contLength/2, horizontalArray[i][j].y+depot.contWidth/2)
    }
  }
  pop();
}

function updateStat(){
  let teuArray = []
  for (let i=0; i<verticalArray.length; i++){
    for (let j=0; j<verticalArray[0].length; j++){
      if (verticalArray[i][j].opt==undefined) continue;
      teuArray.push(verticalArray[i][j]);
    }
  }
  for (let i=0; i<horizontalArray.length; i++){
    for (let j=0; j<horizontalArray[0].length; j++){
      if (horizontalArray[i][j].opt==undefined) continue;
      teuArray.push(horizontalArray[i][j]);
    }
  }
  sumAll = 0;
  bayNameArray = [];
  optArray = [];
  countBay = [];
  countOpt = [];
  for (let i=0; i<teuArray.length; i++){
    let idBay = bayNameArray.indexOf(teuArray[i].bay_name);
    if (idBay == -1){
      bayNameArray.push(teuArray[i].bay_name)
      idBay = bayNameArray.length-1;
      countBay.push(0);
    }
    countBay[idBay] += teuArray[i].num_of_tier;
    let idOpt = optArray.indexOf(teuArray[i].opt);
    if (idOpt == -1){
      optArray.push(teuArray[i].opt)
      idOpt = optArray.length-1;
      countOpt.push(0);
    }
    countOpt[idOpt] += teuArray[i].num_of_tier;
    sumAll += teuArray[i].num_of_tier;
  }
}

function showStat(){
  push();
  textAlign(RIGHT, TOP);
  textSize(14);
  fill(0);
  strokeWeight(1)
  noStroke();
  translate(width,0);
  text("Tổng sức chứa: " + sumAll + " Teus", 0, 10);
  translate(0,10);
  for (let i=0; i<bayNameArray.length; i++){
    translate(0, 20)
    text("Bay "+bayNameArray[i]+ ": " + countBay[i] + " Teus", 0, 0)
  }
  // translate(0,20);
  stroke(0);
  line(0,25,-100,25)
  translate(0,10);
  noStroke();
  for (let i=0; i<optArray.length; i++){
    translate(0, 20)
    text(optArray[i]+ ": " + countOpt[i] + " Teus", 0, 0)
  }
  pop();
}

function drawCursor(){
  push();
  translate(blank.x, blank.y);
  scale(scaleFactor);
  strokeWeight(2);
  stroke("red");
  noFill();
  let p = gridMaping(mouseX, mouseY)[0];
  let x = p.x;
  let y = p.y;
  if (gridAngle == false){
    rect(x*depot.contWidth, y*((depot.contLength+depot.contGap)), depot.contWidth, depot.contLength)
  }else{
    rect(x*(depot.contLength+depot.contGap), y*(depot.contWidth), depot.contLength, depot.contWidth)
  }
  pop();
}

function getTeuFromCursor(x,y){
  let p1 = gridMaping(x,y)[0];
  gridAngle = !gridAngle;
  let p2 = gridMaping(x,y)[0];
  gridAngle = !gridAngle;
  if (!gridAngle){
    if (verticalArray[p1.x][p1.y].opt != undefined)    return verticalArray[p1.x][p1.y];
    if (horizontalArray[p2.x][p2.y].opt != undefined)    return horizontalArray[p2.x][p2.y];
  }else{
    if (verticalArray[p2.x][p2.y].opt != undefined)    return verticalArray[p2.x][p2.y];
    if (horizontalArray[p1.x][p1.y].opt != undefined)    return horizontalArray[p1.x][p1.y];
  }
  return new Teu(0,0,gridAngle);
}

function insideDepot(x,y){
  if ((x<blank.x)||(y<blank.y)) return false;
  if ((x>(width-blank.x))||(y>(height-blank.y))) return false;
  return true;
}

function drawSelectionRect(){
  noFill();
  strokeWeight(2);
  if ((mouseIsPressed)&&(selectRectStart!=undefined)){
    if (insideDepot(mouseX,mouseY)==false) return;
    rect(selectRectStart.x, selectRectStart.y, mouseX - selectRectStart.x, mouseY-selectRectStart.y);
  }
}