/**
класс характера
*/
function charaster(id, sprite){
	this.id=id;
	this.sprite=sprite;
	this.x=0;//абсолютный X
	this.y=0;//абсолютный Y
	this.vx=0;//горизонтальная скорость
	this.vy=0;//вертикальная скорость
	this.vConst=12;
	this.ay=0;//вертикальное ускорение
	this.aConst=5;
	this.jumpConst=35;
	this.mode='standing';//standing
				//moving left
				//moving right
				//walk up
				//walk down
				//jump
				//jump left
				//jump right
	this.old_mode='standing';//нужен чтобы помнить предыдущее состояние и отслеживать их смену
	
	this.startX=0;
	this.startY=0;
	this.startVX=0;
	this.startVY=0;
	this.startAY=0;
	
	this.lives=5;
	this.isStep=false;//флаг для звука "шаг"
	
	this.getShmotka=false;//флаг "шмотка в руках"
	
	this.draw = function(){
		var mirror=false;
		if(this.mode=='moving left' || this.mode=='jump left'){mirror=true;}
		return this.sprite.draw(this.x, this.y, this.spriteByMode(this.mode), mirror, null) + this.livesDraw();
	}
	
	this.livesDraw = function(){
		var s='';
		for(var i=0;i<this.lives;i++){
			s+=liveS.draw(i*20+5,5,0,false);
		}
		return s;
	}
	
	this.popStart=function(){
		this.x=this.startX;
		this.y=this.startY;
		this.vx=this.startVX;
		this.vy=this.startVY;
		this.ay=this.startAY;
	}
	this.pushStart=function(){
		this.startX=this.x;
		this.startY=this.y;
		this.startVX=this.vx;
		this.startVY=this.vy;
		this.startAY=this.ay;
	}
	
	this.spriteByMode = function(mode){
		switch(mode){
			case 'standing':
				return 0;
			break;
			case 'moving left':
				return 1;
			break;
			case 'moving right':
				return 1;
			break;
			case 'walk up':
				return 2;
			break;
			case 'walk down':
				return 3;
			break;
			case 'jump':
				return 0;
			break;
			case 'jump left':
				return 1;
			break;
			case 'jump right':
				return 1;
			break;
		}
	}
	
	this.step=function(map){
		//определить скорость
		//какой блок и смещение
		var bd=map.blockByXY(this.x, this.y);
		var bid=map.map[bd[1]][bd[0]];
		var jumpIt=map.jumpMap[bd[1]][bd[0]];
		var block=map.blocks[bid];
//debug.innerHTML='ix='+bd[2]+' iy='+bd[3]+'<br>vx='+this.vx+' vy='+this.vy+'<br>mode="'+this.mode+'"<br>block.type='+block.type+'<div style="position: absolute; width: 100px; height: 150px; left: '+(bd[0]*100)+'px;top: '+(bd[1]*150)+'px;border:#000 1px solid;">&nbsp;</div>';
		
		var mustDown=block.mustDown(bd[2],bd[3]);
		//var mustUp=block.mustUp(bd[2],bd[3]);
		var canDown=block.canDown(bd[2],bd[3]);
		var canUp=block.canUp(bd[2],bd[3]);
		var canLeft=block.canLeft(bd[2],bd[3]);
		var canRight=block.canRight(bd[2],bd[3]);
		var canJump=block.canJump(bd[2],bd[3]);
		var maxY=block.getMaxY();

//debug.innerHTML='block ['+bd[0]+', '+bd[1]+'] ix='+bd[2]+' iy='+bd[3]+'<br>alignX='+wong.sprite.alignX+' alignY='+wong.sprite.alignY+'<br>mode='+this.mode+' canDown='+canDown.toString()+' mustDown='+mustDown.toString();
		
		if(canDown){
			this.vy+=this.ay;
			if(this.vy>25){this.vy=25;}
		}else{this.vy=0;}

		switch(this.mode){
			case 'standing':
				this.vx=0;
				if(!mustDown){this.vy=0;}
				this.old_mode=this.mode;
			break;
			case 'moving left':
				if(canLeft){
					this.vx=-this.vConst;
				}else{this.vx=0;}
				if(!canDown || !mustDown){this.vy=0;this.isStep=true;}
				this.old_mode=this.mode;
			break;
			case 'moving right':
				if(canRight){
					this.vx=this.vConst;
				}else{this.vx=0;}
				if(!canDown || !mustDown){this.vy=0;this.isStep=true;}
				this.old_mode=this.mode;
			break;
			case 'walk up':
				this.vx=0;
				if(canUp){this.vy=-this.vConst;}else{this.vy=0;}
				this.isStep=true;
				this.old_mode=this.mode;
			break;
			case 'walk down':
				this.vx=0;
				if(canDown){this.vy=this.vConst;}else{this.vy=0;}
				this.isStep=true;
				this.old_mode=this.mode;
			break;
			case 'jump':
				if(canJump && bd[1]>0 && jumpIt){
					this.vy=-this.jumpConst;
				}
			break;
			case 'jump left':
				if(canJump && bd[1]>0 && jumpIt){
					this.vy=-this.jumpConst;
				}else{
					if(!canDown){this.vy=0;}					
				}
				if(canLeft){this.vx=-this.vConst;}else{this.vx=this.vConst;}
				this.old_mode=this.mode;
			break;
			case 'jump right':
				if(canJump && bd[1]>0 && jumpIt){
					this.vy=-this.jumpConst;
				}else{
					if(!canDown){this.vy=0;}					
				}
				if(canRight){this.vx=this.vConst;}else{this.vx=-this.vConst;}
				this.old_mode=this.mode;
			break;
		}
		if(mustDown){
			this.ay=this.aConst;
		}else{
			this.ay=0;
		}
//debug.innerHTML+=' canJump='+canJump.toString()+' this.vy='+this.vy;
		//проверить минимально-допустимый уровень (точнее максимальное y для блока)
		
		if(maxY!=null){
			if(bd[1]>maxY){this.y=bd[1]*block.height + maxY;}
		}

//debug.innerHTML+=' mode='+this.mode+' vy='+this.vy;
		//если край экрана
		if(bd[0]==0 && bd[2]<map.onewidth/2 && this.vx<0){this.vx=0;}
		if(bd[0]>=map.width-1 && bd[2]>map.onewidth/2 && this.vx>0){this.vx=0;}

		//рассчитать позицию
		this.x+=this.vx;
		this.y+=this.vy;
		
		var dy=block.correctY(bd[3]);
		this.y+=dy;
	}
}