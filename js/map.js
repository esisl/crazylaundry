/**
класс реализующий карту уровня
*/
function map(id, width, height, onewidth, oneheight){
	this.id=id;
	this.width=width;//число блоков по горизонтали
	this.height=height;//число блоков по вертикали
	this.onewidth=onewidth;//ширина блока
	this.oneheight=oneheight;//высота блока
	this.blocks = new Array();//здесь храним блоки
	this.map = new Array();//здесь храним карту в виде двумерного массива
	this.jumpMap = new Array();//перечень блоков с разрешением для jump
	this.shmotki = new Array();//перечень блоков с бельём
	this.shmotkiList = new Array();
	
	this.draw = function(){
		var x=0;
		var y=0;
		var s='';
		//перебираем блоки
		for(y=0;y<this.height;y++){
			for(x=0;x<this.width;x++){
				s+=this.blocks[this.map[y][x]].draw(x*this.onewidth, y*this.oneheight,'block'+x+'_'+y);
			}
		}
		return s;
	}
	this.drawShmotki = function(){
		var x=0;
		var y=0;
		var s='';
		//перебираем бельё
		for(var i in this.shmotkiList){
			s+=this.shmotkiList[i].draw();
		}
		return s;
	}
	
	this.blockByXY=function(x,y){//возвращает индекс блока и относительные координаты по абсолютным
		var bX=Math.floor(x/this.onewidth);
		var bY=Math.floor(y/this.oneheight);
		var dX=x-bX*this.onewidth;
		var dY=y-bY*this.oneheight;
		return [bX,bY,dX,dY];
	}
	
	this.initShmotki = function(){
		this.shmotkiList = new Array();
		var i=0;
		var x=0;
		var y=0;
		for(y=0;y<4;y++){
			for(x=0;x<10;x++){
				if(this.shmotki[y][x]==2){
					this.shmotkiList[i]=new shmotka('sh'+i, raspashonka, x*this.onewidth+Math.round(this.onewidth/2), y*this.oneheight+Math.round(this.oneheight/2));
					i++;
				}
				if(this.shmotki[y][x]==1){
					this.shmotkiList[i]=new shmotka('sh'+i, shtany, x*this.onewidth+Math.round(this.onewidth/2), y*this.oneheight+Math.round(this.oneheight/2));
					i++;
				}
			}
		}
	}
	
	this.checkTakeShmotka=function(){
		var n=0;
		var r;
		for(var i in this.shmotkiList){
			if(this.shmotkiList[i].mode=='free'){
				n++;
				if(!wong.getShmotka){
					r=this.shmotkiList[i].checkOverlap(wong.sprite);
					if(r){
						wong.getShmotka=true;
						this.shmotkiList[i].mode='take';
						get_shmotku_sound.play();
					}
				}
			}else if(this.shmotkiList[i].mode=='take'){n++;}
		}
		return n;
	}
}