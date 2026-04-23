/**
именно тут держим класс описывающий поведение врага типа fairy
пока не знаю, может быть разные классы
*/
function fairy(id, sprite){
	this.id=id;
	this.sprite=sprite;
	this.x=0;//абсолютный X
	this.y=0;//абсолютный Y
	this.vx=0;//горизонтальная скорость
	this.vy=0;//вертикальная скорость
	this.vConst=5;
	this.startX=0;
	this.startY=0;
	this.startVX=0;
	this.startVY=0;
	this.mainDir=this.vConst;
	this.firstRot=true;
	
	this.draw = function(){
		return this.sprite.draw(this.x, this.y, 0, false, null);
	}
	
	this.popStart=function(){
		this.x=this.startX;
		this.y=this.startY;
		this.vx=this.startVX;
		this.vy=this.startVY;
	}
	this.pushStart=function(){
		this.startX=this.x;
		this.startY=this.y;
		this.startVX=this.vx;
		this.startVY=this.vy;
	}
	this.step=function(map){
		//определить скорость
		//какой блок и смещение
		var bd=map.blockByXY(this.x, this.y);
		if(bd[1]<0){bd[1]=0;}//тупо блокируем, ибо поведение этих врагов примитивно беспредельно
		if(bd[1]>3){bd[1]=3;}
		var bid=map.map[bd[1]][bd[0]];
		var block=map.blocks[bid];
//		alert(block);
		//если край экрана
		if(this.x<10){this.vx=this.vConst;}
		if(this.x>990){this.vx=-this.vConst;}
		
		//опишем всё поведение костыльно кодом
		if(this.y==75){
			if(this.x==350 || this.x==650){
				this.vx=0;
				this.vy=this.vConst;
			}else{
				this.vx=this.mainDir;
				this.vy=0;
			}
		}
		if(this.y==225 && (this.x==350 || this.x==650)){
			this.vx=this.mainDir;
			this.vy=0;
		}
		if(this.y==225 && (this.x==250 || this.x==750)){
			this.vx=0;
			this.vy=this.vConst;
		}
		if(this.y==375 && (this.x==250 || this.x==750)){
			this.vx=this.mainDir;
			this.vy=0;
		}
		if(this.y==375 && (this.x==150 || this.x==850)){
			this.vx=0;
			this.vy=this.vConst;
		}
		if(this.y==525 && (this.x==150 || this.x==850)){
			switch(Math.floor(Math.random()*3)){
				case 0:
					this.vx=-this.vConst;
					this.vy=0;
				break;
				case 1:
					this.vx=this.vConst;
					this.vy=0;
				break;
				case 2:
					this.vx=0;
					this.vy=this.vConst;
				break;
			}
		}
		
		//рассчитать позицию
		this.x+=this.vx;
		this.y+=this.vy;
		
		if(this.y>610){
			this.x=505;
			this.y=75-19*50;
			this.vx=0;
			this.vy=this.vConst;
			if(Math.random()>0.5){
				this.mainDir=this.vConst;
			}else{
				this.mainDir=-this.vConst;
			}
		}
	}
}