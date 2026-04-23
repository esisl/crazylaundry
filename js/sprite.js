/**
класс реализующий анимированный спрайт.
каждый спрайт хранится в одной картинке
одна анимация - одна строка высотой height
число кадров для данной анимации - в массиве count
для каждой строки типа анимации - одно значение в count
*/

function sprite(id, filename, width, height, count){
	this.id=id;
	this.filename=filename;//имя файла с тайлами
	this.width=width;//ширина одного спрайта
	this.height=height;//высота одного спрайта
	this.count=count;//число спрайтов в анимации
	this.current = new Array(count.length);//массив значений, где хранится текущий номер кадра для каждой анимации
	this.alignX = 0;//смещение
	this.alignY = 0;
	this.lastX = 0;
	this.lastY =0;
	
	//костыль для Canvas
	this.img = new Image();
	this.img.src = this.filename;
	
	for(var i=0;i<count.length;i++){this.current[i]=0;}

	this.checkOverlap = function (otherSprite){
		//свои габариты
		var x0=this.alignX+this.lastX;
		var y0=this.alignY+this.lastY;
		
		//чужие габариты
		var ox0=otherSprite.alignX+otherSprite.lastX;
		var oy0=otherSprite.alignY+otherSprite.lastY;		
		
		if(x0 < (ox0 + otherSprite.width) && y0 < (oy0 + otherSprite.height) && (x0 + this.width) > ox0 && (y0 + this.height) > oy0){
			return true;
		}else{
			return false;
		}
	}
	
	this.setAlign = function (align){//как центровать?
		switch(align){
			case 'center':
				this.alignX=-Math.round(this.width/2);
				this.alignY=-Math.round(this.height/2);
			break;
			case 'bottom':
				this.alignX=-Math.round(this.width/2);
				this.alignY=-this.height;
			break;
			case 'top':
				this.alignX=-Math.round(this.width/2);
				this.alignY=0;
			break;
			case 'left':
				this.alignX=0;
				this.alignY=-Math.round(this.height/2);
			break;
			case 'right':
				this.alignX=-this.width;
				this.alignY=-Math.round(this.height/2);
			break;
		}
	}
	
	this.draw = function (x,y,animation,mirror,cadr){//x,y - координаты
													//animation - тип анимации, число 0 - ... :(
													//mirror - если надо отразить
													//cadr - номер кадра
		this.lastX=x;
		this.lastY=y;
		if(cadr==null){
			this.current[animation]++;
			if(this.current[animation]>=this.count[animation]){
				this.current[animation]=0;
			}
		}else{
			if(cadr<this.count[animation]){
				this.current[animation]=cadr;
			}
		}
		var frameX=this.current[animation] * this.width;
		var frameY=animation*this.height;
		//костыль для отражений
		if(mirror){
			if(this.id=='utjugS'){frameY=58;}
			if(this.id=='charasterS' && animation==1){frameY=400;}
		}

		//пробуем поменять absolute на relative
		var s='<div id="'+this.id+'" style="position:absolute;overflow: hidden;width:'+this.width+'px; height:'+this.height+'px; left:'+(x*1+this.alignX)+'px; top:'+(y*1+this.alignY)+'px;"><img src="'+this.filename+'" style="position:relative; left:-'+frameX+'px;top:-'+frameY+'px;';
	//if(mirror){s+="-moz-transform: scaleX(-1); -webkit-transform: scaleX(-1); -o-transform: scaleX(-1); transform: scaleX(-1); -ms-filter: fliph; filter: fliph;";}
		s+='"></div>';
		
		if(ctx!=null){
			ctx.drawImage(this.img, frameX, frameY, this.width, this.height, (x*1+this.alignX), (y*1+this.alignY), this.width, this.height);
		}
		
	
	
//Параметры
//
//    image — объект Image() или элемент canvas;
//    sx, sy — координаты верхнего левого угла слайса относительно изображения;
//    sWidth, sHeight — размеры слайса;
//    dx,dy — координаты верхнего левого угла обрезанного изображения;
//    dWidth, dHeight — размеры обрезанного изображения на холсте.
	
	
//alert(s);
	return s;
	}
}