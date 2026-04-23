/**
класс реализующий единицу карты платформера
в даный момент может быть:
0 пустой квадрат - nil
1 платформа - pl
2 платформа под которой внизу лестница - pl_lest
3 лестница на платформе - lest_pl
4 лестница на платформе закрытая снизу - lest_pl_cl
5 лестница без платформы - lest
6 стенка по середине - wall
*/
function platform(id, type, width, height, filename, count){
	this.id=id;
	this.type=type;
	this.width=width;
	this.height=height;
	this.filename=filename;//имя файла спрайта
	this.count=count;//спрайт может быть анимированным, в этом случае надо указывать число кадров
	
	this.img = new Image();
	this.img.src = this.filename; 

	
	this.current=0;//текущий кадр
	this.maxY=120;
	
	this.draw = function(x,y,id){
		var frameX=this.current*this.width;
		var s='<div id="';
		if(id!=null){
			s+=id;
		}else{
			s+=this.id;
		}
		s+='" style="position:absolute;overflow: hidden;width:'+this.width+'px; height:'+this.height+'px; left:'+x+'px; top:'+y+'px;"><img src="'+this.filename+'" style="position:relative; left:-'+frameX+'px;top:0px;"></div>';
		
		if(ctx!=null){
			ctx.drawImage(this.img, frameX, 0, this.width, this.height, x,y,this.width, this.height);
			
		}// frameX, 0, this.width, this.height);
//Параметры
//
//    image — объект Image() или элемент canvas;
//    sx, sy — координаты верхнего левого угла слайса относительно изображения;
//    sWidth, sHeight — размеры слайса;
//    dx,dy — координаты верхнего левого угла обрезанного изображения;
//    dWidth, dHeight — размеры обрезанного изображения на холсте.

		
		this.current++;
		if(this.current>=this.count){this.current=0;}
//alert(s);
	return s;
	}
	
	this.canUp = function(x,y){//описывает возможность движения вверх для блока данного типа
		switch(this.type){
			case 'nil':
				return false;
			break;
			case 'pl':
				return false;
			break;
			case 'pl_lest':
				if(y>this.maxY){
					return true;
				}else{
					return false;
				}
			break;
			case 'lest_pl':
				return true;
			break;
			case 'lest_pl_cl':
				return true;
			break;
			case 'lest':
				return true;
			break;
			case 'wall':
				return false;
			break;
		}
	}
	this.canJump = function(x,y){//описывает возможность прыжка вверх для блока данного типа
		switch(this.type){
			case 'nil':
				return false;
			break;
			case 'pl':
				if(y>=this.maxY){
					return true;
				}else{
					return false;
				}
			break;
			case 'pl_lest':
				if(y>=this.maxY){
					return true;
				}else{
					return false;
				}
			break;
			case 'lest_pl':
				return true;
			break;
			case 'lest_pl_cl':
				return true;
			break;
			case 'lest':
				return true;
			break;
			case 'wall':
				if(y>=this.maxY){
					return true;
				}else{
					return false;
				}
			break;
		}
	}
	this.canDown = function(x,y){//описывает возможность движения вниз для блока данного типа
		switch(this.type){
			case 'nil':
				return true;
			break;
			case 'pl':
				if(y<this.maxY){
					return true;
				}else{
					return false;
				}
			break;
			case 'pl_lest':
				return true; 
			break;
			case 'lest_pl':
				return true;
			break;
			case 'lest_pl_cl':
				if(y<this.maxY){
					return true;
				}else{
					return false;
				}
			break;
			case 'lest':
				return true;
			break;
			case 'wall':
				if(y<this.maxY){
					return true;
				}else{
					return false;
				}
			break;
		}
	}

	this.mustDown = function(x,y){//описывает, должен ли предмет падать в данном блоке
		if(this.type=='lest_pl_cl' || this.type=='lest'){
			return false;
		}else{
			if(this.type=='nil'){
				return true;
			}else if(y<this.maxY && (this.type=='pl' || this.type=='wall')){
				return true;
			}else if(this.type=='pl_lest' && y<this.maxY){
				return true
			}else{
				return false;
			}
		}
	}
	this.correctY=function(y){
		//возвратить dy для коррекции недопустимых значений
		switch(this.type){
			case 'nil':
				return 0;
			break;
			case 'pl':
				if(y>this.maxY){return this.maxY-y;}else{return 0;}
			break;
			case 'pl_lest':
				return 0;
			break;
			case 'lest_pl':
				return 0;
			break;
			case 'lest_pl_cl':
				if(y>this.maxY){return this.maxY-y;}else{return 0;}
			break;
			case 'lest':
				return 0;
			break;
			case 'wall':
				if(y>this.maxY){return this.maxY-y;}else{return 0;}
			break;
		}
	}
//	this.mustUp = function(x,y){
//		if(y<this.maxY){
//			return false;
//		}else{
//			if(this.type=='nil' || this.type=='pl_lest' || this.type=='lest'){
//				return false;
//			}else{
//				return true;
//			}
//		}
//	}
	this.getMaxY=function(){
		if(this.type=='nil' || this.type=='pl' || this.type=='wall' || this.type=='lest_pl_cl'){
			return this.maxY;
		}else{
			return null;
		}
	}
	
	this.canLeft = function(x,y){//возможность движения влево для блока данного типа
		if(this.type=='wall'){
			if(x<=70 && x>40){ 
				return false;
			}else{
				return true;
			}
		}else{
			return true;
		}
	}
	this.canRight = function(x,y){//возможность движения вправо для блока данного типа
		if(this.type=='wall'){
			if(x>=30 && x<60){
				return false;
			}else{
				return true;
			}
		}else{
			return true;
		}
	}
	
	this.dirEnemy = function(){
		if(this.type=='nil'){return 'x inv';}
		if(this.type=='pl' || this.type=='lest'){return 'none';}//не менять
		if(this.type=='wall'){return 'x inv';}//инвертировать горизонтальную скорость
		if(this.type=='pl_lest'){return 'lrd';}//лево или право или вниз
		if(this.type=='lest_pl'){return 'lrud';}//лево или право или вверх или вниз
		if(this.type=='lest_pl_cl'){return 'lru';}//лево или право или вверх
	}
}