let largeFontSize = 16;
let depot;
let depotArray = [];
let scaleFactor=1;
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
let teuArrayList=[];
let activeGround = 0;
let centerOffset;
let area;
let selectGround;
let autoSelectGround = true;
let buttonArray;
let screenOffset, offsetStart;
let screenCenter;
let mouseOffset, mo;

const path = [
  './data/etdv2.json',
  './data2/std.json',
  './data3/tbd.json',
  './data4/cld.json',
  './data5/cpd.json',
  './data6/ctc.json',
  './data7/tkd.json'
]

var currentDepotID = 2;




function preload(){
  // let dPath = path[currentDepotID];
  // $.getJSON(dPath, function(data){
  //   depot = data;
  //   // 
  //   ground = depot.ground;
  //   teupath = dPath.substring(0,dPath.indexOf('.json')) + '_reservation.json';
  //   // 
  //   $.getJSON(teupath,function(json){
  //     teuArray = json;
  //     init()
  //     // 
      
  //   })
  //   // 
  //   if (teuArray===undefined){
  //     teuArray = [];
  //     init();
  //   }
  // })
  changeDepot();
}

// async function preload(){
//   currentDepotID = 0;
//   await batchLoadDepot();
//   currentDepotID = 0;
//   await batchLoadTeu();


// }

// function batchLoadDepot(){
//   if (currentDepotID=path.length){
//     return;
//   }else{
//     let dPath = path[currentDepotID];
//     $.getJSON(dPath,function(json){
//       depotArray.push(json);
//     })
//     currentDepotID++;
//     batchLoadDepot()
//   }
// }
// function batchLoadTeu(){
//   if (currentDepotID=path.length){
//     return;
//   }else{
//     let teupath = dPath.substring(0,dPath.indexOf('.json')) + '_reservation.json';
//     $.getJSON(teupath,function(json){
//       depotArray.push(json);
//     })
//     currentDepotID++;
//     batchLoadDepot()
//   }
// }

// function loadDepot(data){
//   depotArray.push(data);
//   if ((teuArrayList.length==path.length)&&(depotArray.length==path.length)&&(depot===undefined)){
//     depot = depotArray[currentDepotID];
//     ground = depot.ground;
//     teuArray = teuArrayList[currentDepotID]
//     init()
//   }
// }

// function loadTeu(data){
//   teuArrayList.push(data);
//   if ((teuArrayList.length==path.length)&&(depotArray.length==path.length)){
//     depot = depotArray[currentDepotID];
//     ground = depot.ground;
//     teuArray = teuArrayList[currentDepotID]
//     init()
//   }
// }

function init(){
  document.getElementById("checkAngle").checked = false;
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  document.body.classList.add("stop-scrolling")
  changeLinePropertiesState(true);
  screenOffset = createVector(0,0)    //pixel
  screenCenter = createVector(width/2,height/2);
  findCenter();
  mouseOffset = depot.center.copy();
  if (depot.defaultGround!=undefined){
    activeGround = depot.defaultGround;
  }
  alignMap();
  initTeuArray();
  updateStat();
  resetSelection();
  initButton();
  noLoop();
  redraw();
}

function setup() {
  myCanvas = createCanvas(windowWidth-40, windowHeight-120);
  myCanvas.parent("main_canvas");
  myCanvas.mouseMoved(redraw);
  myCanvas.mouseWheel(zoom);
  frameRate(10);
}

function draw(){
  background(250); 
  textAlign(LEFT, BOTTOM);
  textSize(1.25*largeFontSize);
  text(depot.name,0,height)
    // rotate(PI/2)

  if (showGrid){
    drawGrid();
  }
  drawDepot();
  drawTeu();
  if ((!keyIsPressed)&&(mouseButton===LEFT)){
    drawSelectionRect();
  }
  drawSelection();
  drawLine();
  drawCursor();
  drawStat();
  drawButton()
}

