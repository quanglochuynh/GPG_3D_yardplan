let cArray = undefined;
let depot = undefined;
let showText = false;
let showBay = [];
let easycam;
let stage=0;
let rot,dis;
let ori1;
let ori2;
let contArray3D;
const maxRow=20;
const maxBay = 32;
const maxTier = 6;
const largeFontSize = 48;
const smallFontSize = 12
roofHeight = 20;
p5.disableFriendlyErrors = true;
let currentState;
let heading;
let eye;

const states = [{
  "distance": 2059.3289393985488,
  "center": [
      291.1905894992754,
      28.64227214233992,
      -254.39126097724892
  ],
  "rotation": [
      0.3544999517122829,
      -0.06668080137401443,
      0.9208759403662182,
      -0.14788832752699732
  ]
},
{
  "distance": 1685.9791504657426,
  "center": [
      -276.4506264579203,
      106.16259098032675,
      -211.9164391674737
  ],
  "rotation": [
      -0.3537624022177311,
      0.041863659727330145,
      0.9269739476041958,
      -0.11755380569964356
  ]
},
{
  "distance": 1977.4167746454539,
  "center": [
      277.24663009745524,
      317.9617307877529,
      353.8653951073716
  ],
  "rotation": [
      -0.9288240460479843,
      0.14723126224919147,
      -0.33506782123915624,
      0.05777890678786246
  ]
},
{
  "distance": 1977.4167746454539,
  "center": [
      441.7313948620282,
      376.2394294929234,
      142.73667287233428
  ],
  "rotation": [
      -0.4237331232220197,
      0.08465511407126676,
      -0.8820071472604534,
      0.18800836185541125
  ]
},
{
  "distance": 1063.2537348041867,
  "center": [
      109.47893418893946,
      -37.743662779817925,
      -403.4403825980332
  ],
  "rotation": [
      0.6763999840037055,
      -0.1631002257457524,
      -0.7028718750384398,
      0.1478259289888153
  ]
},
{
  "distance": 533.0972798979914,
  "center": [
      124.47713497822522,
      -176.33047332493723,
      1296.5832422652277
  ],
  "rotation": [
      0.8713838273437718,
      -0.13264547865021642,
      -0.47013966633787396,
      0.04543232960216371
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
    default:
      fill(132,232,232);
  }
}

function cvtArea(a){
  if (a == "SC") return 4;
  return a.charCodeAt(0)-65;
}

function processCont(array){
  contArray3D = [];
  for (let i=0; i<depot.Area.length;i++){
    area = []
    for (let j=0; j<maxBay; j++){
      bay = []
      for (let k=0; k<maxRow; k++){
        r = [];
        for (let l=0; l<maxTier; l++){
          r.push(0);
        }
        bay.push(r);
      }
      area.push(bay);
    }
    contArray3D.push(area)
  }
  for (let i=0; i<array.length; i++){
    a = cvtArea(array[i].Block);
    b = array[i].Bay;
    r = array[i].Row;
    t = array[i].Tier;
    contArray3D[a][b][r][t] = 1;
  }
}

function preload(){
  $.getJSON("../data/cont3.json", function(data){
    cArray = data;
    $.getJSON("../data/etd.json", function(data){
      depot = data;
      console.log(depot);
      showBay = Array(depot.Area.length).fill(1);
      processCont(cArray);
      init()
      loop();
    })
  })
  console.log("Done");
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
  // for (let i=0; i<states.length; i++){
  //   button.push(createButton("View "+ (i+1)));
  //   button[i].mousePressed(() => {setCamera(states[i])});
  // }
  for (let i=0; i<showBay.length; i++){
    btn = createButton("Bay "+ depot.Area[i].name);
    btn.mousePressed(() => {switchBay(i)});
  } 
  heading = dirVector(easycam.getRotation());

}

function drawCont(cont, ar,or1, or2, center){
  area = cvtArea(cont.Block);
  if (showBay[area]==false) return
  b =  cont.Bay-1;
  r =  -cont.Tier+1;
  t =  cont.Row-1;
  push();  
  strokeWeight(1)
  rotateY(3.1415926548);
  rotateZ(ar[area].angle);
  x_flip = 1 - 2*ar[area].x_flip;
  translate(0.5*depot.contLength, -0.5*depot.contWidth*x_flip, -0.5*depot.contHeight);
  b = Math.floor(b/2);
  let x = b*(depot.contLength+depot.contGap)+depot.contHalfLength - depot.Area[area].x_coor + ar[area].offset.x;
  let y = -t*(depot.contHeight)*x_flip + depot.Area[area].y_coor + ar[area].offset.y;
  let z = r*(depot.contWidth);
  translate(x,y, z);
  setColor(cont.HangTauID);
  // let d = easycam.getDistance();
  // let v = subVec(subVec([0, -d,0],[-center[0], center[2], -center[1]]), [x,y,z]);
  // let dis = myDist(v[0], v[1], v[2]);
  if (b%2 != 0){
    // Container 40ft
    box(depot.contLength*2, depot.contHeight, depot.contWidth);     
    // if (dis>2000) {
    //   pop();
    //   return;
    // }   
    if (showText){
      fill(255);
      rotateX(1.5707963268);
      if (((or2>1)||(or2<-1))){
        if (cont.Bay<maxBay-4){
          if (contArray3D[area][cont.Bay+4][cont.Row][cont.Tier]!=1){
            drawSideCont(cont, or2, false, dis)
          }
        }else{
          drawSideCont(cont, or2, false, dis)
        }
      }else{
        if (cont.Bay>4){
          if (contArray3D[area][cont.Bay-4][cont.Row][cont.Tier]!=1){
            drawSideCont(cont, or2, false)
          }
        }else{
          drawSideCont(cont, or2, false, dis)
        }
      }

      if (or1<0.5){
        if (contArray3D[area][cont.Bay][cont.Row-(1*x_flip)][cont.Tier]==1) {
          pop();
          return;
        }
        rotateY(Math.PI)
      }else{
        if (contArray3D[area][cont.Bay][cont.Row+(1*x_flip)][cont.Tier]==1) {
          pop();
          return;
        }
      }      
      translate(0,0, depot.contWidth/2+2);
      textSize(smallFontSize);
      text(cont.ContID, 0,0);
    }
  }else{
    // Container 20ft
    box(depot.contLength, depot.contHeight, depot.contWidth);
    if (dis>2000) {
      pop();
      return;
    }
    if (showText){
      fill(255)
      rotateX(1.5707963268);
      if (((or2>1)||(or2<-1))){
        if (cont.Bay<maxBay-2){
          if (contArray3D[area][cont.Bay+2][cont.Row][cont.Tier]!=1){
            drawSideCont(cont, or2, true,dis)
          }
        }else{
          drawSideCont(cont, or2, true,dis)
        }
      }else{
        if (cont.Bay>2){
          if (contArray3D[area][cont.Bay-2][cont.Row][cont.Tier]!=1){
            drawSideCont(cont, or2, true,dis)
          }
        }else{
          drawSideCont(cont, or2, true,dis)
        }
      }

      if (or1<0.5){
        if (contArray3D[area][cont.Bay][cont.Row-(1*x_flip)][cont.Tier]==1) {
          pop();
          return;
        }
        rotateY(Math.PI)
      }else{
        if (contArray3D[area][cont.Bay][cont.Row+(1*x_flip)][cont.Tier]==1) {
          pop();
          return;
        }
      }      
      translate(0,0, depot.contWidth/2+2);
      text(cont.ContID, 0,0);
    }
  }
  pop();
}
  
function drawDepot(depot){
  push();
  fill(140);
  beginShape();
  for (let j=1; j<depot.layout.shape[0].length; j++){
    p1 = depot.layout.shape[0].seq[j];
    vertex(p1.x,p1.y,0)
  }
  endShape(CLOSE);
  beginShape();
  for (let j=1; j<depot.layout.shape[0].length; j++){
    p1 = depot.layout.shape[0].seq[j];
    vertex(p1.x,p1.y,-10)
  }
  endShape(CLOSE);
  for (let j=1; j<depot.layout.shape[0].length-1; j++){
    beginShape();
    p1 = depot.layout.shape[0].seq[j];
    p2 = depot.layout.shape[0].seq[j+1];
    vertex(p1.x,p1.y,0);
    vertex(p2.x,p2.y,0);
    vertex(p2.x,p2.y,-10);
    vertex(p1.x,p1.y,-10);
    endShape(CLOSE);
  }
  
  // noFill();
  // for (let j=1; j<depot.layout.shape.length; j++){
  //   for (let i =0; i<depot.layout.shape[j].length-1; i++){
  //     p1 = depot.layout.shape[j].seq[i]
  //     p2 = depot.layout.shape[j].seq[i+1]
  //     line(p1.x, p1.y, p2.x, p2.y)
  //   }
  // }
  pop();
  // draw text
  fill(0);
  for (let i=0; i<depot.layout.text.length; i++){
    push();
    textSize(largeFontSize);
    pos = depot.layout.text[i].position;
    translate(pos.x, pos.y,10);
    rotateZ(Math.PI/2);
    text(depot.layout.text[i].content, 0,0)
    pop();
  }
}

function drawHouse(house){
  for (let i=0; i<house.length; i++){
    if (house[i].type<2){
      push();
      p1 = house[i].shape.seq[house[i].id1]
      p2 = house[i].shape.seq[house[i].id2]
      w = Math.abs(p1.x-p2.x)
      h = Math.abs(p1.y-p2.y)
      fill(180);
      translate(p1.x-w/2,p1.y-h/2,house[i].height/2)
      rotateZ(-house[i].angle)
      box(w, h, house[i].height)
      // noStroke();
      strokeWeight(1)
      if (w>h){
        rotateZ(1.5707963268);
        translate(0,0,(roofHeight/3)+(house[i].height/2)+4)
        scale(0.6*h/(roofHeight),1,1 )
        cylinder(roofHeight,w,4,1)
        scale((roofHeight)/(0.6*h),1,1 )
      }else{
        translate(0,0,(roofHeight/3)+(house[i].height/2)+4)
        scale(0.6*w/(roofHeight),1,1 )
        cylinder(roofHeight,h,4,1)
        scale((roofHeight)/(0.6*w),1,1 )
      }
      fill(255)
      // resetMatrix();
      if (w>h){
        rotateZ(-Math.PI/2);
      }else{
        rotateZ(Math.PI/2);
      }
      translate(0,0,roofHeight)
      textSize(largeFontSize)
      text(house[i].name, 0,0)
      pop();
    }else{
      p1 = house[i].shape.seq[house[i].id1]
      p2 = house[i].shape.seq[house[i].id2]
      w = Math.abs(p1.x-p2.x)
      h = Math.abs(p1.y-p2.y)
      drawSlope(p1.x+house[i].offsetX, p1.y+house[i].offsetY, h,w,20,0.9, Math.PI/2)
    }
  }
}

function setup() {
  createCanvas(windowWidth-10, windowHeight-100, WEBGL);
  noLoop();
}

function draw() {
  checkKeyPress();
  rotateX(1.5707963268);
  background(240);
  strokeWeight(2)
  drawDepot(depot);
  rot = easycam.getRotation();
  ori1 = rot[2]**2;
  ori2 = rot[0]+rot[2];
  let center = easycam.getCenter();
  push()
  translate(center[0], center[2], -center[1])
  sphere(20)
  pop();
  for(let i =0; i<cArray.length; i++){
    drawCont(cArray[i],depot.Area,ori1, ori2, center)
  }
  drawHouse(depot.house);
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

function setCamera(state){
  // easycam.setRotation(state.rotation,500);
  // easycam.setDistance(state.distance,500);
  // easycam.setCenter(state.center,500);
  console.log(state);
}

// function mouseDragged(){
//   redraw();
// }

function mouseReleased(){
  heading = dirVector(easycam.getRotation());
}


function drawSideCont(cont, or2, twenty_feet,dis){
  if (((or2>1)||(or2<-1))){
    rotateY(Math.PI/2);
  }else{
    rotateY(-Math.PI/2);
  }
  if (!twenty_feet){
    translate(0,0, depot.contLength+2);
    textSize(7)
    text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);
    translate(0,0, -depot.contLength-2);
  }else{
    translate(0,0, depot.contLength/2+2);
    textSize(7)
    text(cont.ContID.substring(0,4)+"\n" + cont.ContID.substring(4,11), 0,0);
    translate(0,0, -(depot.contLength/2)-2);
  }
  if (((or2>1)||(or2<-1))){
    rotateY(-Math.PI/2);
  }else{
    rotateY(Math.PI/2);
  }
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
  currentState = easycam.getCenter();
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

function myDist(x,y,z){
  return sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2));
}

function subVec(a,b){
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}