let cArray;
let depot;
let showText = false;
let showBay = [];
let easycam;
let stage=0;
let rot,dis;
let ori1;
let ori2;
let contArray3D;
let maxRow=0;
let maxBay = 0;
let maxTier = 0;
const largeFontSize = 48;
const smallFontSize = 12
roofHeight = 20;
p5.disableFriendlyErrors = true;
let currentState;
let heading;
let eye;
let center;
let eyeVector = [0,0,0];
let lut;
let areaList;
let bayNameArray;
let optArray;
let countBay;
let countOpt;;
let sumAll;
// let contScaleFactor = 1;

const states = [
  {
  "distance": 3181.7057108469526,
  "center": [
      561.3654397889591,
      -270.0896240255795,
      695.8011306993076
  ],
  "rotation": [
      -0.8513564699917174,
      0.06907587081447907,
      0.5186968187780248,
      -0.03707148855939367
  ]
}
]

const deviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
	  return 1;
  }
  else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
	  return 2;
  }
  return 0;
};

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
    case "CMA":
      fill(40,40,120);
      break;
    default:
      fill(255);
      break;
  }
}

function cvtArea(a){
  // if (a == "SC") return 4;
  // return a.charCodeAt(0)-65;
  return a;
}

function processCont(){
  lut = [];
  for (let i=0; i<cArray.length; i++){
    maxBay = max(maxBay, parseInt(cArray[i].Bay))
    maxRow = max(maxRow, parseInt(cArray[i].Row))
    maxTier = max(maxTier,parseInt(cArray[i].Tier))
    cArray[i].Block = bayNameArray.indexOf(cArray[i].Block);
  }
  maxBay++;
  maxRow++;
  maxTier++;
  contArray3D = [];
  for (let i=0; i<depot.Area.length;i++){
    area = []
    for (let j=0; j<=maxBay; j++){
      bay = []
      for (let k=0; k<=maxRow; k++){
        let r = [];
        for (let l=0; l<=maxTier; l++){
          r.push(0);
        }
        bay.push(r);
      }
      area.push(bay);
    }
    contArray3D.push(area)
  }
  let a,b,r,t;
  for (let i=0; i<cArray.length; i++){
    a = cArray[i].Block;
    b = cArray[i].Bay;
    r = cArray[i].Row;
    t = cArray[i].Tier;
    try {
      contArray3D[a][b][r][t] = 1;
    } catch (error) {
      console.log('error: ', error);
      console.log(a,b,r,t);
    }
  }
}

function preload(){
  // let path = [
  //   './data/cont3.json',
  //   '../../yardplan_creator/data/etdv2.json'
  // ];
  let path = [
    './data4/cont4.json',
    '../../yardplan_creator/data4/cld.json'
  ];
  // let path = [
  //   './data2/cont2.json',
  //   '../../yardplan_creator/data2/std.json'
  // ];

  $.getJSON(path[0], function(data){
	cArray = data;
	$.getJSON(path[1], function(data){
      depot = data;
      updateStat();
      processCont(cArray);
      init();
      loop();
    })
  })
}

function switchBay(id){
  showBay[id]= 1- showBay[id];
}

function init(){
  setAttributes('antialias', true);
  easycam = new Dw.EasyCam(this._renderer, states[0]); 
  if (deviceType()!=0){
	easycam.setRotationScale(0.0004);
  }else{
	console.log("Desktop");
	easycam.setRotationScale(0.0006);
  }
  document.oncontextmenu = function() { return false; }
  document.onmousedown   = function() { return false; }
  showBay = Array(depot.Area.length).fill(1);
  let myFont = loadFont("Poppins-Light.ttf", )
  textFont(myFont);
  ambientLight(255,255,255)
  normalMaterial();
  stroke(0)
  textSize(smallFontSize);
  // debugMode();
  textAlign(CENTER)
  showTextCheckbox = createCheckbox("Show Container name",false);
  showTextCheckbox.changed(changeTextVisibility);
  for (let i=0; i<showBay.length; i++){
    btn = createButton("Bay "+ bayNameArray[i] + " " + countBay[i]);
    btn.mousePressed(() => {switchBay(i)});
  } 
  heading = dirVector(easycam.getRotation());
  findCenter();
  center = easycam.getCenter();
  dis = easycam.getDistance();
  rot = easycam.getRotation();
  center = [depot.center.x, 0, depot.center.y];
}

function drawCont(cont,or1, or2){
  area = cont.Block;
  if (showBay[area]==false) return
  let b =  cont.Bay-1;
  let r =  -cont.Tier+1;
  let t =  cont.Row-1;
  b = Math.floor(b/2);
  let x_flip=0; 
  let x,y,z;
  y = b*(depot.contLength+depot.contGap)+depot.contHalfLength;
  x = t*(depot.contWidth)
  z = -r*(depot.contHeight);
  let dis2cont;
  let d = createVector(depot.Area[area].x_coor + depot.contLength, depot.Area[area].y_coor+depot.contWidth, 0.5*depot.contHeight + 20);
  let k = createVector(-r*depot.contWidth, b*(depot.contLength+depot.contGap));
  k.rotate(-depot.Area[area].angle);
  let d2 = p5.Vector.add(d,k);
  let eye = createVector(eyeVector[0]+depot.center.x, eyeVector[2]+ depot.center.y, -eyeVector[1]);
  let eye2cont = p5.Vector.sub(d2, eye);
  dis2cont = Math.floor(eye2cont.mag());
  let k2 = createVector(0, b*(depot.contLength+depot.contGap));
  k2.rotate(-depot.Area[area].angle);
  let d3 = p5.Vector.add(d,k2);
  let eye2bay = p5.Vector.sub(d3, eye);
  dis2Bay = eye2bay.mag();

  push();  
  try {
    translate(0.5*depot.contLength, -0.5*depot.contWidth*x_flip, 0.5*depot.contHeight + 10);
    translate(depot.Area[area].x_coor, depot.Area[area].y_coor, 0);
    rotateZ(-depot.Area[area].angle);
    translate(x,y,z);
  } catch (error) {
    console.log('error: ', cont);
  }
  setColor(cont.HangTauID);
  if (dis2Bay<600){
    pop();
    return;
  }

  if ((cont.Bay)%2 == 0){
	// Container 40ft
    translate(0,depot.contHalfLength,0)
    box(depot.contWidth, depot.contLength*2, depot.contHeight);     
    if (dis2cont>800) {
      pop();
      return;
    }  
    if (showText){
      fill(255);
      rotateX(-1.5707963268);
      drawSideCont(cont, or2, false)
      if (contArray3D[area][cont.Bay][cont.Row-1][cont.Tier]!=1) {
        rotateY(-PI/2)
        translate(0,0, depot.contWidth/2+2);
        textSize(smallFontSize);
        text(cont.ContID, 0,0);
        // text(dis2cont, 0,0)
        translate(0,0, -depot.contWidth/2-2);
        rotateY(PI/2)
      }
      
      if (contArray3D[area][cont.Bay][cont.Row+1][cont.Tier]!=1) {
        rotateY(PI/2)
        translate(0,0, depot.contWidth/2+2);
        textSize(smallFontSize);
        text(cont.ContID, 0,0);
      }
    }
  }
  else{
	// Container 20ft
  box(depot.contWidth, depot.contLength, depot.contHeight);      
    if (dis2cont>800) {
      pop();
      return;
    }  
    if (showText){
      fill(255);
      rotateX(-1.5707963268);
      drawSideCont(cont, or2, true, dis)
        if (contArray3D[area][cont.Bay][cont.Row-1][cont.Tier]!=1) {
          rotateY(-PI/2)
          translate(0,0, depot.contWidth/2+2);
          textSize(smallFontSize);
          text(cont.ContID, 0,0);
          translate(0,0, -depot.contWidth/2-2);
          rotateY(PI/2)
        }
        if (contArray3D[area][cont.Bay][cont.Row+1][cont.Tier]!=1) {
          rotateY(PI/2)
          translate(0,0, depot.contWidth/2+2);
          textSize(smallFontSize);
          text(cont.ContID, 0,0);
        }
          
      
    }
  }
  pop();
}
  
function drawDepot(){
  push();
  fill(140);
  for (let i=0 ;i<depot.ground.length; i++){
    shapeID = depot.ground[i].shapeID;
    offsetZ = depot.ground[i].offsetZ
    beginShape();
    for (let j=0; j<depot.layout.shape[shapeID].length; j++){
      p1 = depot.layout.shape[shapeID].seq[j];
      vertex(p1.x,p1.y, offsetZ+10)
    }
    endShape(CLOSE);
    beginShape();
    for (let j=0; j<depot.layout.shape[shapeID].length; j++){
      p1 = depot.layout.shape[shapeID].seq[j];
      vertex(p1.x,p1.y, 0)
    }
    endShape();
    for (let j=0; j<depot.layout.shape[shapeID].length-1; j++){
      beginShape();
      p1 = depot.layout.shape[shapeID].seq[j];
      p2 = depot.layout.shape[shapeID].seq[j+1];
      vertex(p1.x,p1.y,0);
      vertex(p2.x,p2.y,0);
      vertex(p2.x,p2.y,+depot.ground[i].offsetZ+10);
      vertex(p1.x,p1.y,+depot.ground[i].offsetZ+10);
      endShape();
    }
  }
  pop();

  // noFill();
  // for (let j=1; j<depot.layout.shape.length; j++){
  //   for (let i =0; i<depot.layout.shape[j].length-1; i++){
  //     p1 = depot.layout.shape[j].seq[i]
  //     p2 = depot.layout.shape[j].seq[i+1]
  //     line(p1.x, p1.y,10, p2.x, p2.y,10)
  //   }
  // }
  // draw slope
  // for (let i=0; i<depot.slope.length; i++){
	// let shapeID = depot.slope[i].shapeID;
	// let hei = depot.slope[i].height;
	// beginShape();
	// vertex(depot.layout.shape[shapeID].seq[3].x, depot.layout.shape[shapeID].seq[3].y,hei+10);
	// vertex(depot.layout.shape[shapeID].seq[2].x, depot.layout.shape[shapeID].seq[2].y,10);
	// vertex(depot.layout.shape[shapeID].seq[1].x, depot.layout.shape[shapeID].seq[1].y,10);
	// vertex(depot.layout.shape[shapeID].seq[0].x, depot.layout.shape[shapeID].seq[0].y,hei+10);
	// endShape();
	// beginShape();
	// vertex(depot.layout.shape[shapeID].seq[3].x, depot.layout.shape[shapeID].seq[3].y,hei+10);
	// vertex(depot.layout.shape[shapeID].seq[2].x, depot.layout.shape[shapeID].seq[2].y,10);
	// vertex(depot.layout.shape[shapeID].seq[3].x, depot.layout.shape[shapeID].seq[3].y,10);
	// vertex(depot.layout.shape[shapeID].seq[3].x, depot.layout.shape[shapeID].seq[3].y,hei+10);
	// endShape();
	// beginShape();
	// vertex(depot.layout.shape[shapeID].seq[0].x, depot.layout.shape[shapeID].seq[0].y,hei+10);
	// vertex(depot.layout.shape[shapeID].seq[1].x, depot.layout.shape[shapeID].seq[1].y,10);
	// vertex(depot.layout.shape[shapeID].seq[0].x, depot.layout.shape[shapeID].seq[0].y,10);
	// vertex(depot.layout.shape[shapeID].seq[0].x, depot.layout.shape[shapeID].seq[0].y,hei+10);
	// endShape();
  // }
  // sphere(20,6,6)
  // for (let i=0; i<depot.Area.length; i++){
  //   push();
  //   // rotateZ(PI);
  //   translate(depot.Area[i].x_coor, depot.Area[i].y_coor,0)
  //   fill(0);
  //   sphere(20,6,6);
  //   pop();
  // }
  // draw text
  fill(0);
  for (let i=0; i<depot.Area.length; i++){
    push();
    textSize(largeFontSize);
    pos = depot.Area[i].x_coor;
    translate(depot.Area[i].x_coor-largeFontSize, depot.Area[i].y_coor,11);
    rotateZ(Math.PI/2 - depot.Area[i].angle);
    text(depot.Area[i].name, 0,0)
    pop();
  }
  stroke(0,255,0);
  for (let i=0; i<depot.layout.line.length; i++){
    line(depot.layout.line[i].p1.x,depot.layout.line[i].p1.y,10,depot.layout.line[i].p2.x, depot.layout.line[i].p2.y,10);
  }
  stroke(0);
}

function drawHouse(house){
  for (let i=0; i<house.length; i++){
    if (house[i].type<2){
      // push();
      // p1 = house[i].shape.seq[house[i].id1]
      // p2 = house[i].shape.seq[house[i].id2]
      // let dif = rotateDiff(createVector(p2.x-p1.x, p2.y-p1.y), house[i].angle)
      // w = Math.abs(p1.x-p2.x) + dif.x;
      // h = Math.abs(p1.y-p2.y) + dif.y;
      // fill(180);
      // translate(p1.x-w/2,p1.y-h/2,house[i].height/2+house[i].offsetZ)
      // rotateZ(-house[i].angle)
      // box(w, h, house[i].height)
    //   // noStroke();
    //   strokeWeight(1)
    //   if (w>h){
    //   rotateZ(1.5707963268);
    //   translate(0,0,(roofHeight/3)+(house[i].height/2)+4)
    //   scale(0.6*h/(roofHeight),1,1 )
    //   cylinder(roofHeight,w,4,1)
    //   scale((roofHeight)/(0.6*h),1,1 )
    //   }else{
    //   translate(0,0,(roofHeight/3)+(house[i].height/2)+4)
    //   scale(0.6*w/(roofHeight),1,1 )
    //   cylinder(roofHeight,h,4,1)
    //   scale((roofHeight)/(0.6*w),1,1 )
    //   }
    //   fill(255)
    //   // resetMatrix();
    //   if (w>h){
    //   rotateZ(-Math.PI/2);
    //   }else{
    //   rotateZ(Math.PI/2);
    //   }
    //   translate(0,0,roofHeight)
    //   textSize(largeFontSize)
    //   text(house[i].name, 0,0)
      // pop();
    // }else{
    //   p1 = house[i].shape.seq[house[i].id1]
    //   p2 = house[i].shape.seq[house[i].id2]
    //   w = Math.abs(p1.x-p2.x)
    //   h = Math.abs(p1.y-p2.y)
    //   translate(0,0,house[i].offsetZ)
    //   drawSlope(p1.x+house[i].offsetX, p1.y+house[i].offsetY, h,w,20,0.9, Math.PI/2)
      fill(200);
      for (let j=0; j<house[i].shape.seq.length-1; j++){
        beginShape()
        vertex(house[i].shape.seq[j].x,house[i].shape.seq[j].y,10);
        vertex(house[i].shape.seq[j+1].x, house[i].shape.seq[j+1].y, 10);
        vertex(house[i].shape.seq[j+1].x,house[i].shape.seq[j+1].y,house[i].height+10);
        vertex(house[i].shape.seq[j].x, house[i].shape.seq[j].y, house[i].height+10);
        endShape(CLOSE)
      }
      beginShape()
      for (let j=0; j<house[i].shape.seq.length; j++){
        vertex(house[i].shape.seq[j].x,house[i].shape.seq[j].y,house[i].height+10);
      }
      endShape(CLOSE)
    }
  }
}

function setup() {
  createCanvas(windowWidth-10, windowHeight-100, WEBGL);
  noLoop();
}

function draw() {
  center = easycam.getCenter();
  dis = easycam.getDistance();
  rot = easycam.getRotation();
  translate(-depot.center.x,0, -depot.center.y)
  calcEYE();
  background(240);
  rotateX(1.5707963268);
  drawDepot();
  ori1 = rot[2]**2;
  ori2 = rot[0]+rot[2];
  strokeWeight(1);
  for(let i =0; i<cArray.length; i++){
    drawCont(cArray[i],depot.Area,ori1, ori2)
  }
  drawHouse(depot.house);
  checkKeyPress();
}

function windowResized() {
  resizeCanvas(windowWidth-10, windowHeight-100);
  easycam.setViewport([0,0,windowWidth, windowHeight]);
}

function changeTextVisibility(){
  if (showTextCheckbox.checked()){
	showText = true;
	// frameRate(24);
  }else{
	showText = false;
	// frameRate(60);
  }
}

function drawSlope(x, y, wid, len, hei, offset, angle){
  push();
  rotateZ(angle);
  translate(-x,y,0);
  fill(100);
  beginShape();
  vertex(0,0,0);
  vertex(offset*wid,0,hei);
  vertex(offset*wid,len,hei);
  vertex(0, len,0);
  endShape(CLOSE);

  beginShape();
  vertex(offset*wid,0,hei);
  vertex(offset*wid,len,hei);
  vertex(wid, len,0);
  vertex(wid, 0,0);

  endShape(CLOSE);
  pop();
}

function mouseReleased(){
  heading = dirVector(easycam.getRotation());
  let eX = dis*Math.sin(eye[0])*Math.cos(eye[1]);
  let eY = dis*Math.cos(eye[0])*Math.cos(eye[1]);
  let eZ = -dis*Math.sin(eye[1]);
  eyeVector = [eX+center[0], eY+center[2], eZ+(-center[1])]
}

function drawSideCont(cont, or2, twenty_feet){
  // if (((or2>1)||(or2<-1))){
  //   rotateY(Math.PI/2);
  // }else{
  //   rotateY(-Math.PI/2);
  // }
  push();
  if (!twenty_feet){
    translate(0,0, depot.contLength+1);
    textSize(7)
    text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);
    rotateY(Math.PI);
    translate(0,0, 2*depot.contLength+2);
    text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);

  }else{
    translate(0,0, depot.contLength/2+1);
    textSize(7)
    text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);
    rotateY(Math.PI);
    translate(0,0, (depot.contLength)+2);
    text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);

  }
  pop();
  // if (((or2>1)||(or2<-1))){
  //   rotateY(-Math.PI/2);
  // }else{
  //   rotateY(Math.PI/2);
  // }
}

function dirVector(quat){
  eye = getAng(quat);
  let V=Array(2);
  V[1] = Math.cos(eye[0]);
  V[0] = Math.sin(eye[0]);
  return V;
}

function getAng(quat){
  x = quat[0];
  y = quat[1];
  z = quat[2];
  w = quat[3];
  var test = x*y + z*w;
  var heading, attitude, bank;
  var test = x*y + z*w;
  if (test > 0.499) { // singularity at north pole
	  heading = 2 * Math.atan2(x,w);
	  attitude = Math.PI/2;
	  bank = 0;
  }
  if (test < -0.499) { // singularity at south pole
	  heading = -2 * Math.atan2(x,w);
	  attitude = - Math.PI/2;
	  bank = 0;
  }
  if(isNaN(heading)){
	  var sqx = x*x;
	  var sqy = y*y;
	  var sqz = z*z;
	  heading = Math.atan2(2*y*w - 2*x*z , 1 - 2*sqy - 2*sqz); // Heading
	  attitude = Math.asin(2*test); // attitude
	  bank = Math.atan2(2*x*w - 2*y*z , 1 - 2*sqx - 2*sqz); // bank
  }
  return [heading, attitude, bank];
}

function checkKeyPress(){
  currentState = center;
  if (keyIsPressed){
	dirVec = heading;
	// console.log('dirVec: ', dirVec);
	switch (key){
	  case (('ArrowUp')):
      currentState[0]-=10*dirVec[0];
      currentState[2]-=10*dirVec[1];
      break;
	  case (('ArrowDown')):
      currentState[0]+=10*dirVec[0];
      currentState[2]+=10*dirVec[1];
      break;
	  case (('ArrowLeft')):
      currentState[0]-=10*dirVec[1];
      currentState[2]+=10*dirVec[0];
      break;
	  case (('ArrowRight')):
      currentState[0]+=10*dirVec[1];
      currentState[2]-=10*dirVec[0];
      break;
	  case ('w'):
      currentState[0]-=10*dirVec[0];
      currentState[2]-=10*dirVec[1];
      break;
	  case (('s')):
      currentState[0]+=10*dirVec[0];
      currentState[2]+=10*dirVec[1];
      break;
	  case (('a')):
      currentState[0]-=10*dirVec[1];
      currentState[2]+=10*dirVec[0];
      break;
	  case (('d')):
      currentState[0]+=10*dirVec[1];
      currentState[2]-=10*dirVec[0];
      break;
	  case ('z'):
      currentState[1]+=10;
      break;
	  case ('x'):
      currentState[1]-=10;
      break;
	  }
  }
}

function myDist(a){
  return sqrt(Math.pow(a[0],2) + Math.pow(a[1],2) + Math.pow(a[2],2));
}

function subVec(a,b){
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

function calcEYE(){
  let eX = dis*Math.sin(eye[0])*Math.cos(eye[1]);
  let eY = dis*Math.cos(eye[0])*Math.cos(eye[1]);
  let eZ = -dis*Math.sin(eye[1]);
  eyeVector = [eX+center[0], -eZ+center[1], eY+center[2]];
  // eyeVector = [eX, eY, eZ];

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

function updateStat(){
  sumAll = 0;
  bayNameArray = [];
  optArray = [];
  countBay = [];
  countOpt = [];
  for (let i=0; i<depot.Area.length; i++){
    bayNameArray.push(depot.Area[i].name);
    countBay.push(0);
  }
  for (let i=0; i<cArray.length; i++){
    let idBay = bayNameArray.indexOf(cArray[i].Block);
    if (idBay==-1) {
      console.log(cArray[i]);
      continue
    };
    countBay[idBay] ++;
    let idOpt = optArray.indexOf(cArray[i].HangTauID);
    if (idOpt == -1){
      optArray.push(cArray[i].HangTauID)
      countOpt.push(0);
      idOpt = optArray.length-1;
    }
    countOpt[idOpt] +=1;
  }
}

function rotateDiff(a,r){
  let c = a.copy();
  a.rotate(r)
  return p5.Vector.sub(a,c);
}
