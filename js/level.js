/**
класс уровня
*/

function level(id, _map, jumpMap, shmotki, enemys, charaster, stiralka){
	this.id=id;
	this.map=_map;//массив карты уровня
	this.jumpMap=jumpMap;//массив карты прыжков
	this.shmotki=shmotki;//массив карты размещения шмоток
	this.enemys=enemys;//массив из 12 цифр - стартовые координаты и скорости врагов
	this.charaster=charaster;//две цифры - стартовые координаты вонга
	this.stiralka=stiralka;//две цифры - стартовые координаты стиральной машины
	this.isFinal=false;
	
	this.start = function(){//инициализируем глобальные переменные для старта уровня
		map.map=this.map;//0 - пустой блок
		map.jumpMap=this.jumpMap;//1 - можно прыгать
		map.shmotki=this.shmotki;
		map.initShmotki();
		
		wong.x=this.charaster[0];
		wong.y=this.charaster[1];
		wong.vx=0;
		wong.vy=0;
		wong.ay=0;
		
		enemy0.x=this.enemys[0]*100+50;enemy0.y=this.enemys[1]*150+75;enemy0.vx=this.enemys[2];enemy0.vy=this.enemys[3];
		enemy1.x=this.enemys[4]*100+50;enemy1.y=this.enemys[5]*150+75;enemy1.vx=this.enemys[6];enemy1.vy=this.enemys[7];
		enemy2.x=this.enemys[8]*100+50;enemy2.y=this.enemys[9]*150+75;enemy2.vx=this.enemys[10];enemy2.vy=this.enemys[11];
	}
}