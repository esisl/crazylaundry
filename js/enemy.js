/**
именно тут держим класс описывающий поведение врагов
пока не знаю, может быть разные классы
*/
function enemy(id, sprite){
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
	
	this.draw = function(){
		var mirror=false;
		if(this.vx<0){mirror=true;}
		return this.sprite.draw(this.x, this.y, 0, mirror, null);
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
		var bid=map.map[bd[1]][bd[0]];
		var block=map.blocks[bid];
//		alert(block);
		//если край экрана
		if(bd[0]==0 && bd[2]<map.onewidth/2){this.vx=this.vConst;}
		if(bd[1]==0 && bd[3]<map.oneheight/2){this.vy=0;this.y=Math.round(map.oneheight/2);}
		if(bd[0]>=map.width-1 && bd[2]>map.onewidth/2){this.vx=-this.vConst;}
		if(bd[1]>=map.height-1 && bd[3]>map.oneheight/2){this.vy=0;bd[3]*map.oneheight + Math.round(map.oneheight/2);}
		//проверить попадание в центр текущего блока
		var dir='none';
//debug.innerHTML='if('+bd[2]+'=='+(map.onewidth + this.sprite.alignX)+' && '+bd[3]+'=='+Math.round(map.oneheight/2)+'){<br>vx='+this.vx+'<br>vy='+this.vy;
		if(bd[2]==map.onewidth + this.sprite.alignX && bd[3]==Math.round(map.oneheight/2)){
			dir=block.dirEnemy();
		}
		//вставим костыль. Если натыкаемся на пустой блок 'nil', то жёстко 'x inv'
		if(block.type=='nil'){dir='x inv';}
		
		//определить, как нужно сменить скорость
		switch(dir){
			case 'x inv':
				this.vx=-this.vx;
			break;
			case 'lrd':
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
			break;
			case 'lru':
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
						this.vy=-this.vConst;
					break;
				}
			break;
			case 'lrud':
				switch(Math.floor(Math.random()*4)){
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
					case 3:
						this.vx=0;
						this.vy=-this.vConst;
					break;
				}
			break;
		}
		
		//рассчитать позицию
		this.x+=this.vx;
		this.y+=this.vy;
	}
}