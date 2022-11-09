const fontSize = 14;

class Button{
	constructor(x,y,text="", value=null, angle=0){
		this.x = x;
		this.y = y;
		this.w = (text.length)*(fontSize*0.75);
		this.h = fontSize + 2 ;
		this.text = text;
		this.value = value;
		this.angle = angle;
		console.log(text);
	}

	draw(){
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		if (!this.isHovering()){
			fill(10);
		}else{
			fill(200)
		}
		rect(0,0,this.w,this.h)
		textAlign(CENTER,CENTER);
		fill(255);
		textSize(14);
		text(this.text, this.w/2, this.h/2);
		pop();
	}

	isHovering(){
		let dif = rotateDiff(createVector(mouseX-this.x, mouseY-this.y), -this.angle);
		let x = mouseX + dif.x;
		let y = mouseY + dif.y;
		if ((x > this.x)&&(x<this.x+this.w)&&(y>this.y)&&(y<this.y+this.h)){
			return true;
		}
		return false
	}
}