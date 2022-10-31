const largeFontSize = 28


function drawDepot(){
  push();
  rotate(-PI/2)
  translate(-height/2, width/2);
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
  // rotate(-PI/2)
  // translate(-width/2, height/2);

  fill("pink")
  for (let i=0; i<depot.Area.length; i++){
    translate(depot.Area[i].x_coor,depot.Area[i].y_coor)
    circle(0,0,20)
    x_flip = -1 + 2*depot.Area[i].x_flip;
    for (let j=0; j<depot.Area[i].num_of_bay; j++){
      for (let k=0; k<depot.Area[i].num_of_row; k++){
        push();
        rotate(-depot.Area[i].angle)
        translate(-j*(depot.contLength+depot.contGap),k*depot.contWidth*x_flip)
        rect(0,0,-depot.contLength, depot.contWidth*x_flip)
        pop()
      }
      // translate(-depot.contGap,0)
    }
    translate(-depot.Area[i].x_coor,-depot.Area[i].y_coor)

  }
  fill(0);
  for (let i=0; i<depot.layout.text.length; i++){
    push();
    textSize(largeFontSize);
    pos = depot.layout.text[i].position;
    translate(pos.x, pos.y,11);
    rotate(Math.PI/2);
    text(depot.layout.text[i].content, 0,0);
    pop();
  }
  pop();

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
  translate(width/2-200, height/2)
  scale(0.4)
  background(240)
  fill(255,0,0)
  circle(0,0,50)
  fill(255)
  drawDepot();
  noLoop();
}

function mousePressed(){
  x = mouseX;
  y = mouseY;
  console.log(x,y);
  for (let i=0; i<depot.Area.length; i++){
    shapeID = depot.Area[i].shapeID;
    for (let j=0; j<depot.layout.shape[shapeID].length; j++){
      console.log(depot.layout.shape[shapeID].seq[j].x);
    }
  }
}