const depot_scale = 3

function drawDepot(){
  push();
  translate(width/2, height/2);
  rotate(-PI/2)
  strokeWeight(2)
  beginShape();
  for (let j=1; j<depot.layout.shape[0].length; j++){
    p1 = depot.layout.shape[0].seq[j];
    vertex(p1.x,p1.y,0)
  }
  endShape(CLOSE);
  noFill();
  for (let j=1; j<depot.layout.shape.length; j++){
    for (let i =0; i<depot.layout.shape[j].length-1; i++){
      p1 = depot.layout.shape[j].seq[i]
      p2 = depot.layout.shape[j].seq[i+1]
      line(p1.x, p1.y, p2.x, p2.y)
    }
  }
  // translate(400,-600)
  pop();

  fill("red")
  for (let i=0; i<3; i++){
    translate(depot.Area[i].y_coor,-depot.Area[i].x_coor)
    circle(0,0,20)

    // for (let j=0; j<depot.Area[i].num_of_bay; j++){
    //   for (let k=0; k<depot.Area[i].num_of_row; k++){
    //     push();
    //     translate(k*10,j*20)
    //     circle(0,0,4)
    //     pop()
    //   }
    // }
    translate(-depot.Area[i].y_coor,+depot.Area[i].x_coor)

  }
}

function preload(){
  $.getJSON("./data/etd.json", function(data){
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
  // debugMode()
  // noLoop();
}

function draw(){
  // orbitControl();
  translate(width/2, height/2)
  scale(0.2)
  background(240)
  fill(255,0,0)
  circle(0,0,50)
  fill(255)
  drawDepot();

}