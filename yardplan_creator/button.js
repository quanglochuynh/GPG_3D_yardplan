const fontSize = 14;

class Button{
	constructor(x,y,text="", value=null, angle=0, scale=1){
		this.x = x;
		this.y = y;
		this.w = (text.length)*(fontSize)*scale;
		this.h = (2*fontSize)*scale ;
		this.text = text;
		this.value = value;
		this.angle = angle;
		this.active = false;
		this.scale = scale;
	}

	draw(){
		push();
		translate(this.x, this.y);
		rotate(this.angle);
		if ((this.isHovering())||(this.active)){
			fill(200);
		}else{
			fill(10)
		}
		rect(0,0,this.w,this.h)
		textAlign(CENTER,CENTER);
		fill(255);
		textSize(18*this.scale);
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