const largeFontSize = 28
let depot;
let scaleFactor;
let gridAngle = 0;
let selection;
let selectionStart = {x:0, y:0};
let selectionEnd = {x:0, y:0};
let mapCenter;
let blank = {x:0, y:0};
let selectRectStart;
let ground;
let areaList;
let bayNameArray;
let optArray;
let countBay;
let countOpt;;
let sumAll;
let showGrid = true;
let currentTeu;
let teuArray;
let activeGround = 0;
let centerOffset;

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
    $.getJSON("./data/etd_reservation.json", function(data){
      teuArray = data;
      // teuArray = [];
      ground = depot.ground;
      init()
      console.log("Done");
    })
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
  // push();
  // translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  // scale(scaleFactor);
  // fill('cyan');
  // noFill();
  // pop();
  drawDepot();
  drawTeu();
  if (showGrid){
    drawGrid();
  }
  if (!keyIsPressed){
    drawSelectionRect();
  }
  // drawSelection();
  drawCursor();
  showStat();
}

function mousePressed(){
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if (insideDepot(x,y)==false) return;
  activeGround = max(checkGround(x,y),0)
  console.log(checkGround(x,y));
  let p = gridMaping(x, y)[0] ;
  currentTeu = getTeuFromCursor(x,y);
  // updatePanel(currentTeu);
  // gridAngle = currentTeu.orient;
  if (!keyIsPressed){
    resetSelection();
    selectionStart = p;
    if ((selectionStart.x<0)){
      resetSelection();
    }
    if ((selectionStart.y<0)){
      resetSelection();
    }
    selectRectStart = new Point(x, y);
  }
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
  let p = gridMaping(mouseX, mouseY)[0];
  if (keyIsPressed){
    if (key=="Control"){
      selection.push(p); 
    }
  }else{
    // gridAngle = currentTeu.orient;
    selectionEnd = p;
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
    // teuArray.push(new Teu())
    if (!gridAngle){
      verticalArray[selection[i].x][selection[i].y].opt = opt.toUpperCase();
      verticalArray[selection[i].x][selection[i].y].bay_name = bay.toUpperCase();
      verticalArray[selection[i].x][selection[i].y].num_of_tier = tier;
      verticalArray[selection[i].x][selection[i].y].orient = gridAngle;
      // teuArray[teuArray.length-1] = verticalArray[selection[i].x][selection[i].y]

    }else{
      horizontalArray[selection[i].x][selection[i].y].opt = opt.toUpperCase();
      horizontalArray[selection[i].x][selection[i].y].bay_name = bay.toUpperCase();
      horizontalArray[selection[i].x][selection[i].y].num_of_tier = tier;
      horizontalArray[selection[i].x][selection[i].y].orient = gridAngle;
      // teuArray[teuArray.length-1] =  horizontalArray[selection[i].x][selection[i].y];
    }
  }
  updateVerticalHorizontal();
  updateStat();
  resetSelection();
  redraw();
}

function resetArea(){
  for (let i=0; i<selection.length; i++){
    if (!gridAngle){
      verticalArray[selection[i].x][selection[i].y].opt = undefined;
      verticalArray[selection[i].x][selection[i].y].bay_name = undefined
      verticalArray[selection[i].x][selection[i].y].num_of_tier = "";
    }else{
      horizontalArray[selection[i].x][selection[i].y].opt = undefined;
      horizontalArray[selection[i].x][selection[i].y].bay_name = undefined
      horizontalArray[selection[i].x][selection[i].y].num_of_tier = "";
    }
  }
  updateVerticalHorizontal();
  updateStat();
  redraw();
}

function updateVerticalHorizontal(){
  teuArray = []
  for (let x=0; x<verticalArray.length; x++){
    for (let y=0; y<verticalArray[0].length; y++){
      if (verticalArray[x][y].opt==undefined) continue
      teuArray.push(verticalArray[x][y])
    }
  }
  for (let x = 0; x<horizontalArray.length; x++){
    for (let y=0; y<horizontalArray[0].length; y++){
      if (horizontalArray[x][y].opt==undefined) continue
      teuArray.push(horizontalArray[x][y])
    }
  }
}

function mouseMap(x,y){
  let p = createVector(x-width/2-depot.offset.x,y-height/2 - depot.offset.y);
  p.mult(1/scaleFactor)
  return p
  // let k = createVector(ground[0].offsetX, ground[0].offsetY)
  // k.sub(ground[activeGround].offsetX, ground[activeGround].offsetY)
  // k.mult(scaleFactor);
  // return p.add(k);
}

function mouseMap2(x,y){
  // let p = createVector(x-width/2-depot.offset.x,y-height/2 - depot.offset.y);
  // p.sub(ground[activeGround].offsetX, ground[activeGround].offsetY);
  // p.mult(1/scaleFactor)


  let p = createVector(x-blank.x, y-blank.y);

  let v0 = createVector(ground[0].offsetX, ground[0].offsetY);
  let v1 = createVector(ground[activeGround].offsetX, ground[activeGround].offsetY)
  let vOff = p5.Vector.sub(v1,v0);
  vOff.mult(scaleFactor)
  // console.log('vOff: ', vOff);
  p.sub(vOff);
  let dif = rotateDiff(p5.Vector.add(createVector(x-blank.x, y-blank.y), p),-depot.ground[activeGround].angle);

  // p.add(dif);
  return p
}

function drawGrid(){
  push();
  groundTranform();
  fill(0);
  circle(0,0,100)
  stroke('rgba(0,0,0,0.125)');
  noFill();
  strokeWeight(1);
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
  selectionEnd = selectionStart
}

function gridMaping(px,py){
  // let x = px - blank.x;
  // let y = py - blank.y;

  let p = mouseMap2(px,py)
  let x = p.x;
  let y = p.y;
  
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
  // centerOffset = 
}

function windowResized() {
  resizeCanvas(windowWidth-40, windowHeight-80);
  alignMap();
  redraw();
}

function initTeuArray(){
  for (let g=0; g<ground.length; g++){
    ground[g].verticalArray = [];
    for (let x=0; x<depot.width/depot.contWidth; x++){
      let temp = [];
      for (let y=0; y<depot.height/(depot.contLength+depot.contGap); y++){
        temp.push(new Teu(x,y, 0))
      }
      ground[g].verticalArray.push(temp);
    }
    ground[g].horizontalArray = [];
    for (let x = 0; x<depot.width/(depot.contLength + depot.contGap); x++){
      let temp = [];
      for (let y=0; y<depot.height/depot.contWidth; y++){
        temp.push(new Teu(x,y, 1))
      }
      ground[g].horizontalArray.push(temp);
    }
  }
  
  let temp = gridAngle;
  for (let i=0; i<teuArray.length;i++){
    gridAngle = teuArray[i].orient
    let g = teuArray[i].ground;
    if (teuArray[i].orient==0){
      ground[g].verticalArray[teuArray[i].x][teuArray[i].y] = teuArray[i];
    }else{
      ground[g].horizontalArray[teuArray[i].x][teuArray[i].y] = teuArray[i];
    }
  }
  gridAngle = temp;
}

function updatePanel(teu){
  if ((teu.bay_name===undefined)||(teu.opt===undefined)||(teu.num_of_tier===undefined)){
    document.getElementById("edtxBay").value = "";
    document.getElementById("edtxOpt").value = "";
    document.getElementById("edtxNumTier").value = "";
    document.getElementById("checkAngle").checked = gridAngle;
  }else{
    document.getElementById("edtxBay").value = teu.bay_name;
    document.getElementById("edtxOpt").value = teu.opt;
    document.getElementById("edtxNumTier").value = teu.num_of_tier;
    document.getElementById("checkAngle").checked = teu.orient;
  }
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
  let temp = gridAngle;
  for (let i=0; i<teuArray.length;i++){
    gridAngle = teuArray[i].orient
    let p = gridMapingTranspose(teuArray[i]);
    setColor(teuArray[i].opt)
    stroke(0)
    if (teuArray[i].orient==0){
      rect(p.x, p.y, depot.contWidth, depot.contLength);
      fill(0);
      noStroke();
      text(teuArray[i].num_of_tier, p.x + depot.contWidth/2, p.y+depot.contLength/2)
    }else{
      rect(p.x, p.y, depot.contLength, depot.contWidth);
      noStroke();
      fill(0)
      text(teuArray[i].num_of_tier, p.x + depot.contLength/2, p.y+depot.contWidth/2)
    }
  }
  gridAngle = temp;
  pop();
}

function updateStat(){
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
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  translate(depot.ground[activeGround].offsetX*scaleFactor, depot.ground[activeGround].offsetY*scaleFactor);
  rotate(-depot.ground[activeGround].angle)
  scale(scaleFactor);
  strokeWeight(2);
  stroke("red");
  noFill();
  p = gridMaping(mouseX, mouseY)[0];
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
  // if (!gridAngle){
  //   if (ground[activeGround].verticalArray[p1.x][p1.y].opt != undefined)    return verticalArray[p1.x][p1.y];
  //   if (ground[activeGround].horizontalArray[p2.x][p2.y].opt != undefined)    return horizontalArray[p2.x][p2.y];
  // }else{
  //   if (ground[activeGround].verticalArray[p2.x][p2.y].opt != undefined)    return verticalArray[p2.x][p2.y];
  //   if (ground[activeGround].horizontalArray[p1.x][p1.y].opt != undefined)    return horizontalArray[p1.x][p1.y];
  // }
  // return new Teu(0,0,gridAngle);
  console.log(p1.x, p1.y);
  // console.log(p2.x, p2.y);
}

function insideDepot(x,y){
  if ((x<blank.x)||(y<blank.y)) return false;
  if ((x>(width-blank.x))||(y>(height-blank.y))) return false;
  return true;
}

function drawSelectionRect(){
  if ((mouseIsPressed)&&(selectRectStart!=undefined)){
    push();
    noFill();
    strokeWeight(2);
    translate(selectRectStart.x, selectRectStart.y,)
    rotate(-depot.ground[activeGround].angle);
    let dif = rotateDiff(createVector(mouseX - selectRectStart.x, mouseY-selectRectStart.y) ,depot.ground[activeGround].angle);
    // console.log('dif: ', dif);
    if (insideDepot(mouseX,mouseY)==false) return;
    rect(0,0, mouseX - selectRectStart.x + dif.x, mouseY-selectRectStart.y + dif.y);
    pop();
  }
}

function gridMapingTranspose(p){
  if (!gridAngle){
    return new Point(p.x * depot.contWidth, p.y * (depot.contLength + depot.contGap));
  }else{
    return new Point(p.x * (depot.contLength + depot.contGap), p.y * depot.contWidth);
  }
}

function  checkGround(x,y){
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

function groundTranform(){
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  translate(depot.ground[activeGround].offsetX, depot.ground[activeGround].offsetY);
  rotate(-depot.ground[activeGround].angle)
}

function rotateDiff(a,r){
  let c = a.copy();
  a.rotate(r)
  return p5.Vector.sub(a,c);
}