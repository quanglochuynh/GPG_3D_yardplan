let largeFontSize = 16;
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
let area;
let etd=0;
let selectGround;
let autoSelectGround = true;
let buttonArray;

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}
class Area{
  constructor(name,x,y,a){
    this.name = name;
    this.angle = a;
    this.x_coor = x;
    this.y_coor = y;
    this.x_flip = 0;
    // this.y_flip = undefined;

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
    this.bay = undefined;
    this.row = undefined;
    this.ground = undefined
  }
}

function preload(){
  if (etd){
    $.getJSON("./data/etdv2.json", function(data){
      depot = data;
      depot.Area = [];
      $.getJSON("./data/etd_reservation.json", function(data){
        teuArray = data;
        ground = depot.ground;
        init()
        console.log("Done");
      })
    })
  }else{
    $.getJSON("./data2/std.json", function(data){
      depot = data;
      depot.Area = [];
      $.getJSON("./data2/std_reservation.json", function(data){
        teuArray = data;
        ground = depot.ground;
        init()
        console.log("Done");
      })
    })
  }
}

function init(){
  document.getElementById("checkAngle").checked = false;
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  document.body.classList.add("stop-scrolling")
  selectGround = document.getElementById("selectGround");
  selectGround.innerText = "";
  let opt = document.createElement('option');
  opt.value = depot.ground.length;
  opt.innerHTML = "Auto";
  selectGround.appendChild(opt);
  for (let i=0; i<depot.ground.length; i++){
    opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = "Area " + i;
    selectGround.appendChild(opt);
  }
  findCenter();
  alignMap();
  initTeuArray();
  updateStat();
  resetSelection();
  initButton();
  noLoop();
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-120);
  myCanvas.parent("main_canvas");
  myCanvas.mouseMoved(redraw)
  frameRate(10)
}

function draw(){
  background(250); 
  textAlign(LEFT)
  textSize(2*largeFontSize);
  text(depot.name,0,2*largeFontSize)
  if (showGrid){
    drawGrid();
  }
  drawDepot();
  drawTeu();
  if (!keyIsPressed){
    drawSelectionRect();
  }
  drawSelection();
  drawCursor();
  drawStat();
  drawButton()
  // push();
  // circle(mouseX, mouseY, 16)
  // // translate(blank.x, blank.y)
  // let v1 = createVector(ground[activeGround].offsetX, ground[activeGround].offsetY)
  // v1.mult(scaleFactor);
  // v1.add(width/2 + depot.offset.x, height/2 + depot.offset.y)
  // translate(v1.x, v1.y)
  // circle(0,0,16)
  // pop();
}

// P5 DRAW
function drawDepot(){
  push();
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  strokeWeight(2);
  noFill();
  for (let i=0; i<depot.layout.shape.length;i++){
    if (depot.layout.shape[i].visible!=0){
      stroke('rgba(0,0,0,' + depot.layout.shape[i].visible +')')
      beginShape();
      for (let j=1; j<depot.layout.shape[i].length; j++){
        p1 = depot.layout.shape[i].seq[j];
        vertex(p1.x,p1.y,0)
      }
      endShape(CLOSE);
    }
  }
  fill(40);
  for (let j=0; j<depot.house.length; j++){   
    beginShape()
    for (let i =0; i<depot.house[j].shape.seq.length; i++){
      p1 = depot.house[j].shape.seq[i];
      vertex(p1.x, p1.y);
    }
    endShape(CLOSE);
  }
  pop();
}

function drawGrid(){
  push();
  groundTranform();
  // fill(0);
  // circle(0,0,100)
  stroke('rgba(0,0,0,0.125)');
  noFill();
  strokeWeight(1);
  if (document.getElementById("checkAngle").checked == false){
    for (let x=0; x<depot.ground[activeGround].wid; x+=depot.contWidth){
      for (let y=0; y<depot.ground[activeGround].hei; y+=(depot.contLength+depot.contGap)){
        rect(x,y, depot.contWidth, depot.contLength);
      }
    }
  }else{
    for (let x = 0; x<depot.ground[activeGround].wid; x+=(depot.contLength + depot.contGap)){
      for (let y=0; y<depot.ground[activeGround].hei; y+= (depot.contWidth)){
        rect(x, y, depot.contLength, depot.contWidth)      
      }
    }
  }
  pop();
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

function drawSelection(){
  push()
  groundTranform()
  stroke("blue");
  noFill();
  for (let i=0; i<selection.length; i++){
    if (!gridAngle){
      rect(selection[i].x*depot.contWidth, selection[i].y*(depot.contLength + depot.contGap), depot.contWidth, (depot.contLength))
    }else{
      rect(selection[i].x*(depot.contLength + depot.contGap), selection[i].y*depot.contWidth, (depot.contLength), depot.contWidth)
    }
  }
  pop();
}

function drawTeu(){
  textAlign(CENTER,CENTER);
  strokeWeight(3*scaleFactor)
  let temp = gridAngle;
  let temp2 = activeGround;
  for (let i=0; i<teuArray.length;i++){
    push();
    activeGround = teuArray[i].ground;
    groundTranform();
    gridAngle = teuArray[i].orient
    let p = gridMapingTranspose(teuArray[i]);
    setColor(teuArray[i].opt)
    // noFill()
    stroke(0)
    textSize(depot.contWidth)
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
    if (teuArray[i].bay == 1){
      if (teuArray[i].row == 1){
        noStroke();
        fill(0);  
        textSize(depot.contWidth*2)
        text(teuArray[i].bay_name,p.x-(depot.contWidth), p.y-(depot.contWidth));
      }
    }
    pop();
  }
  gridAngle = temp;
  activeGround = temp2;
}

function drawStat(){
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

function drawButton(){
  for (let i=0; i<buttonArray.length;i++){
    buttonArray[i].draw();
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

function groundTranform(){
  translate(width/2+depot.offset.x,height/2 + depot.offset.y);
  scale(scaleFactor);
  translate(depot.ground[activeGround].offsetX, depot.ground[activeGround].offsetY);
  rotate(-depot.ground[activeGround].angle)
}


// P5 EVENT

function mousePressed(){
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  for (let i=0; i<buttonArray.length;i++){
    if (buttonArray[i].isHovering()){
      resetSelection();
      activeGround = i
      redraw();
      break;
    }
  }
  if (checkGround(x,y)<0) {
    return
  }
  currentTeu = getTeuFromCursor(x,y);
  updatePanel(currentTeu);
  gridAngle = currentTeu.orient;
  let p = gridMaping(x, y)[0] ;
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
    // redraw();
  }
}

function mouseReleased(){
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  let cg = checkGround(x,y)
  if (cg<0) {
    return
  };
  let p = gridMaping(mouseX, mouseY)[0];
  if (keyIsPressed){
    if (key=="Control"){
      selection.push(p); 
    }
  }else{
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
        // let p = mouseMap(i,j);
        // if (checkGround(p.x,p.y)>=0){
        // if ((i>0)&&(i<depot.ground[activeGround].wid) && (j>0)&&(j<depot.ground[activeGround].hei)){
          selection.push(new Point(i,j));
        // }
      }
    }
  }
  redraw();
}

function keyPressed(){
  switch (key){
    case "Backspace":
      resetArea();
      break;
    case "Enter":
      doneAddArea();
      break;
  }
  console.log(key);
}

function windowResized() {
  resizeCanvas(windowWidth-40, windowHeight-120);
  alignMap();
  initButton();
  redraw();
}


// MAPPING
function mouseMap(i,j){
  // let mm2 = mouseMap2(px,py);
  // let x = mm2.x;
  // let y = mm2.y;
  let p = createVector(i-width/2-depot.offset.x,j-height/2 - depot.offset.y);
  p.mult(1/scaleFactor)
  return p
}

function mouseMap2(x,y){
  let m = createVector(x,y);
  m.sub(blank);
  let v0 = depot.gridOrigin;
  let v1 = createVector(ground[activeGround].offsetX, ground[activeGround].offsetY)
  let vOff = p5.Vector.sub(v1,v0);
  vOff.mult(scaleFactor)
  let p = p5.Vector.sub(m, vOff);
  let v3 = p5.Vector.mult(v1,scaleFactor);
  v3.add(width/2 + depot.offset.x, height/2 + depot.offset.y)
  let m2 = p5.Vector.sub(createVector(x,y),v3)
  let dif = rotateDiff(m2,depot.ground[activeGround].angle);
  p.add(dif);
  return p
}

function gridMaping(px,py){
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

function gridMapingTranspose(p){
  if (!gridAngle){
    return new Point(p.x * depot.contWidth, p.y * (depot.contLength + depot.contGap));
  }else{
    return new Point(p.x * (depot.contLength + depot.contGap), p.y * depot.contWidth);
  }
}

// INITIALIZATION EVENTS
function resetSelection(){
  selection = [];
  // selectionStart = {x:0, y:0};
  // selectionStart = selectionEnd;
  // selectionEnd = {x:0, y:0};
  selectionEnd = selectionStart
}

function findCenter(){
  var minX = Infinity, maxX = -Infinity;
  var minY = Infinity, maxY = -Infinity;
  for (let i=0; i<depot.layout.shape.length; i++){
    polygon = depot.layout.shape[i].seq;
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

function updateVerticalHorizontal(){
  teuArray = []
  for (let g=0; g<ground.length; g++){
    for (let x=0; x<ground[g].verticalArray.length; x++){
      for (let y=0; y<ground[g].verticalArray[0].length; y++){
        if (ground[g].verticalArray[x][y].opt==undefined) continue
        teuArray.push(ground[g].verticalArray[x][y])
      }
    }
    for (let x = 0; x<ground[g].horizontalArray.length; x++){
      for (let y=0; y<ground[g].horizontalArray[0].length; y++){
        if (ground[g].horizontalArray[x][y].opt==undefined) continue
        teuArray.push(ground[g].horizontalArray[x][y])
      }
    }
  } 
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

function initButton(){
  buttonArray = [];
  let p = (createVector(width/2 + depot.offset.x, height/2 + depot.offset.y));
  for (let i=0; i<depot.ground.length; i++){
    let p1 = createVector(depot.ground[i].button.position.x, depot.ground[i].button.position.y);
    let p2 = p5.Vector.add(p, p1.mult(scaleFactor));
    buttonArray.push(new Button(p2.x,p2.y, depot.ground[i].button.text, i, -depot.ground[i].button.angle));
  }
}


// CALCULATION
function rotateDiff(a,r){
  let c = a.copy();
  a.rotate(r)
  return p5.Vector.sub(a,c);
}

function findAreaOrigin(area){
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity
  let g;
  for (let t=0; t<teuArray.length; t++){
    if (teuArray[t].bay_name == area){
      minX = min(minX, teuArray[t].x)
      minY = min(minY, teuArray[t].y)
      maxX = max(maxX, teuArray[t].x)
      maxY = max(maxY, teuArray[t].y)
      g = teuArray[t].ground;
    }
  }
  return {position: {x:minX, y:minY}, ground: parseInt(g), wid: maxX-minX, hei: maxY-minY};
}

function getTeuFromCursor(x,y){
  let p1 = gridMaping(x,y)[0];
  gridAngle = !gridAngle;
  let p2 = gridMaping(x,y)[0];
  gridAngle = !gridAngle;
  if (!gridAngle){
    if ((p1.x>=0)&&(p1.y>=0)&&(ground[activeGround].verticalArray[p1.x][p1.y].opt != undefined))    return ground[activeGround].verticalArray[p1.x][p1.y];
    if ((p2.x>=0)&&(p2.y>=0)&&(ground[activeGround].horizontalArray[p2.x][p2.y].opt != undefined))    return ground[activeGround].horizontalArray[p2.x][p2.y];
  }else{
    if ((p1.x>=0)&&(p1.y>=0)&&(ground[activeGround].verticalArray[p2.x][p2.y].opt != undefined))   return ground[activeGround].verticalArray[p2.x][p2.y];
    if ((p1.x>=0)&&(p1.y>=0)&&(ground[activeGround].horizontalArray[p1.x][p1.y].opt != undefined))    return ground[activeGround].horizontalArray[p1.x][p1.y];
  }
  return new Teu(0,0,gridAngle);
}

function insideDepot(x,y){
  if ((x<blank.x)||(y<blank.y)) return false;
  if ((x>(width-blank.x))||(y>(height-blank.y))) return false;
  return true;
}

function  checkGround(x,y){
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


// DOM EVENTS

function changeActiveGround(){
  activeGround = document.getElementById("selectGround").value;
  if (activeGround == depot.ground.length){
    activeGround--;
    autoSelectGround = true;
  }else{
    autoSelectGround = false;
  }
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
    let x = selection[i].x;
    let y = selection[i].y;
    if (bayNameArray.indexOf(bay.toUpperCase())>=0){
      if (!gridAngle){
        if ((ground[activeGround].verticalArray[x-1][y].bay_name==bay.toUpperCase())||(ground[activeGround].verticalArray[x][y-1].bay_name==bay.toUpperCase())){
          ground[activeGround].verticalArray[x][y].opt = opt.toUpperCase();
          ground[activeGround].verticalArray[x][y].bay_name = bay.toUpperCase();
          ground[activeGround].verticalArray[x][y].num_of_tier = tier;
          ground[activeGround].verticalArray[x][y].orient = gridAngle;
          ground[activeGround].verticalArray[x][y].ground = activeGround;
        }else{
          alert("Các Row phải liền kề nhau");
          break;
        }
      }else{
        if ((ground[activeGround].horizontalArray[x-1][y].bay_name==bay.toUpperCase())||(ground[activeGround].horizontalArray[x][y-1].bay_name==bay.toUpperCase())){
          ground[activeGround].horizontalArray[x][y].opt = opt.toUpperCase();
          ground[activeGround].horizontalArray[x][y].bay_name = bay.toUpperCase();
          ground[activeGround].horizontalArray[x][y].num_of_tier = tier;
          ground[activeGround].horizontalArray[x][y].orient = gridAngle;
          ground[activeGround].horizontalArray[x][y].ground = activeGround;
        }else{
          alert("Các Row phải liền kề nhau");
          break;
        }
      }
    }else{
      try {
        if (!gridAngle){
          ground[activeGround].verticalArray[x][y].opt = opt.toUpperCase();
          ground[activeGround].verticalArray[x][y].bay_name = bay.toUpperCase();
          ground[activeGround].verticalArray[x][y].num_of_tier = tier;
          ground[activeGround].verticalArray[x][y].orient = gridAngle;
          ground[activeGround].verticalArray[x][y].ground = activeGround;
        }else{
          ground[activeGround].horizontalArray[x][y].opt = opt.toUpperCase();
          ground[activeGround].horizontalArray[x][y].bay_name = bay.toUpperCase();
          ground[activeGround].horizontalArray[x][y].num_of_tier = tier;
          ground[activeGround].horizontalArray[x][y].orient = gridAngle;
          ground[activeGround].horizontalArray[x][y].ground = activeGround;
        }
      } catch (error) {
        alert(error)
        return;
      }
      
    }
  }
  updateVerticalHorizontal();
  updateStat();
  resetSelection();
  exportJson();
}

function resetArea(){
  for (let i=0; i<selection.length; i++){
    if (!gridAngle){
      ground[activeGround].verticalArray[selection[i].x][selection[i].y].opt = undefined;
      ground[activeGround].verticalArray[selection[i].x][selection[i].y].bay_name = undefined
      ground[activeGround].verticalArray[selection[i].x][selection[i].y].num_of_tier = "";
    }else{
      ground[activeGround].horizontalArray[selection[i].x][selection[i].y].opt = undefined;
      ground[activeGround].horizontalArray[selection[i].x][selection[i].y].bay_name = undefined
      ground[activeGround].horizontalArray[selection[i].x][selection[i].y].num_of_tier = "";
    }
  }
  updateVerticalHorizontal();
  updateStat();
  exportJson()
}

function changeGridAngle(){
  // selection = [];
  resetSelection();
  gridAngle = (document.getElementById("checkAngle").checked)
  redraw();
}

function exportJson(){
  area = [];
  for (let i=0; i<bayNameArray.length; i++){
    let origin = findAreaOrigin(bayNameArray[i])
    let id = origin.ground;
    let p = gridMapingTranspose(origin.position);
    let x = ground[id].offsetX + p.x;
    let y = ground[id].offsetY + p.y
    area.push(new Area(bayNameArray[i], x, y, ground[origin.ground].angle));

    for (let t=0; t<teuArray.length; t++){
      if (teuArray[t].bay_name == bayNameArray[i]){
        if (!teuArray[t].orient){
          teuArray[t].row = teuArray[t].x - origin.position.x + 1;
          teuArray[t].bay = (teuArray[t].y - origin.position.y)*2 + 1;
        }else{
          teuArray[t].bay = teuArray[t].x - origin.position.x + 1;
          teuArray[t].row = (teuArray[t].y - origin.position.y)*2 + 1;
        }
      }
    }
  }
  depot.Area = area;
  depot.teuArray = teuArray;
  console.log(depot);
  redraw();
}