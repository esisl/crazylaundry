/**
бельё одна штука
*/
function shmotka(id,sprite,x,y){
	this.id=id;
	this.sprite=sprite;
	this.x=x;
	this.y=y;
	this.mode='free';//free - висит
					//take - в руке персонажа
					//hide - в стиралке
	this.cdrCount=this.sprite.count;//число кадров для самостоятельного указания кадров анимации
	this.cdrCurrent=0;//текущий кадр для самостоятельного указания кадров анимации
	
	this.draw=function(){
		switch(this.mode){
			case 'free':
				this.cdrCurrent++;
				if(this.cdrCurrent>=this.cdrCount){this.cdrCurrent=0;}
				return this.sprite.draw(this.x, this.y, 0, false, this.cdrCurrent);
			break;
			case 'take':
				this.x=wong.x;
				this.y=wong.y-50;
				if(this.cdrCurrent>=this.cdrCount){this.cdrCurrent=0;}
				return this.sprite.draw(this.x, this.y, 0, false, this.cdrCurrent);
			break;
			case 'hide':
				return '';
			break;
		}
	}
	
	this.checkOverlap=function(){
		//свои габариты
		var x0=this.x-Math.round(this.sprite.width/2);
		var y0=this.y;
		
		//чужие габариты
		var ox0=wong.x-Math.round(wong.sprite.width/2);
		var oy0=wong.y-wong.sprite.height;

		if(x0 < (ox0 + wong.sprite.width) && y0 < (oy0 + wong.sprite.height) && (x0 + this.sprite.width) > ox0 && (y0 + this.sprite.height) > oy0){
			return true;
		}else{
			return false;
		}
	}
}