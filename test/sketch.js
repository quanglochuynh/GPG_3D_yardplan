/*
	Webgl 3D Picking in P5js with Colour Buffer
	18 May 2017
	David R. <david at the domain of sixhat dot net>
*/
var pg;
var img;

function preload() {
	img = loadImage('cat.jpg');
}

function setup() {
	/* Let's create the "real" canvas */
	createCanvas(1000, 1000, WEBGL);
	// Using pixel density 1 to avoid dealing with retina displays
    	pixelDensity(1);
	
	/* Create the Color buffer canvas */
	pg = createGraphics(windowWidth/2, windowHeight, WEBGL);
	// Using pixel density 1 to avoid dealing with retina displays
	pg.pixelDensity(1);
 	/* These are just to show the canvas in the example 
 			We can comment these two lines in production */
	pg.show();
	pg.style("display", "inline");
}

function draw() {
	/* First we call This drawBackgroundBuffer function where 
	we draw everything in the same way as in the world 
	but using color fills for the material */
	orbitControl()
  drawBackgroundBuffer(); 

	/* The we call the drawActiveCanvas where we do our "real" 
			3D world drawing*/
	// drawActiveCanvas();

}

function drawActiveCanvas(){

		/* Don't forget this for consistency */
	resetMatrix();

	background(0);

	rotateY(frameCount * .01);
	rotateX(frameCount * .01);

	/* Let's get the object at the mouse position
			See the function getObject bellow. That's where de 
			magic happens. */
	var mouseObj = getObject(mouseX, mouseY);

	/* We assume the mouse is not hovering the object and call the texture */
	texture(img);
	/* Then if the mouse is hovering we change it to a fill */
	if (mouseObj==1) fill(200,0,0);
	/* And finally we draw the object */
	box(100);


	texture(img);
	if (mouseObj==2) fill(200,0,0);
	translate(200, 0, 0);
	box(100);

	
	texture(img);
	if (mouseObj==3) fill(200,0,0);
	translate(0, 200, 0);
	box(100);

	texture(img);
	if (mouseObj==4) fill(200,0,0);
	translate(0, 0, 200);
	box(100);
}

/* This function replicates the world in the color buffer 
		The main trick here is to have the background black 
		and the each object with a unique color. In this case
		as I have few objects I'm opting to index the red channel 
		as the index of the object leaving the green and blue channels
		free to make different colors. Notice how for each box the fill
		sets the red channel color to a different value. */
function drawBackgroundBuffer() {
	pg.resetMatrix();

	pg.rotateY(frameCount * .01);
	pg.rotateX(frameCount * .01); 

	pg.background(0);

	pg.fill(1, 255, 0);
	pg.box(100);

	pg.translate(200, 0, 0);
	pg.fill(2, 0, 200);
	pg.box(100);

	pg.translate(0, 200, 0);  
	pg.fill(3, 255, 200);
	pg.box(100);

	pg.translate(0, 0, 200);
	pg.fill(4, 100, 0);
	pg.box(100);
}

/* This function gets the red channel of the pixel under the mouse as 
		the index for the corresponding object. A more advanced version 
		 could use the 4 bytes (see commented section) */
function getObject(mx, my) {
	if (mx > width || my > height) {
		return 0;
	}

	var gl = pg.elt.getContext('webgl');
	var pix = getPixels();

	var index = 4 * ((gl.drawingBufferHeight-my) * gl.drawingBufferWidth + mx);

	// var cor = color(
	// 	pix[index + 0],
	// 	pix[index + 1],
	// 	pix[index + 2],
	// 	pix[index + 3]);
	// return cor;

	return pix[index]; // Only returning the red channel as the object index.
}

/* This function loads the pixels of the color buffer canvas into an array 
		called pixels and returns them. */
function getPixels() {
	var gl = pg.elt.getContext('webgl');
	var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
	gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	return (pixels);
}