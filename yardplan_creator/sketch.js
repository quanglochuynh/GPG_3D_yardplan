const depot_scale = 3

function drawDepot(){
  push();
  translate(width/2, height/2);
  rotate(-PI/2)
  strokeWeight(2)
  beginShape();
  for (let j=1; j<depot.layout.shape[0].length; j++){
    p1 = depot.layout.shape[0].seq[j];
    vertex(p1.x/depot_scale,p1.y/depot_scale,0)
  }
  endShape(CLOSE);
  noFill();
  for (let j=1; j<depot.layout.shape.length; j++){
    for (let i =0; i<depot.layout.shape[j].length-1; i++){
      p1 = depot.layout.shape[j].seq[i]
      p2 = depot.layout.shape[j].seq[i+1]
      line(p1.x/depot_scale, p1.y/depot_scale, p2.x/depot_scale, p2.y/depot_scale)
    }
  }
  pop();
}

function preload(){
  $.getJSON("../data/etd.json", function(data){
    depot = data;
    init()
  })
  console.log("Done");
}

function init(){
  background(240)
  drawDepot();
}

function setup() {
  createCanvas(windowWidth-10, windowHeight-20);
  noLoop();
}