(function(){ //анонимная функция чтобы не сорить в глобальную область видимости
    function addEvent(elem, type, func) { //кроссбраузерное навешивание события, в любой(почти) библтотеке есть своя
        return elem.addEventListener ? elem.addEventListener(type, func, false) : elem.attachEvent('on' + type, func); //первый случай для нормальных браузеров, второй для осла
    }

    var keys = [], //массив нажтых клавиш
        names = {
            16: 'Shift',
            17: 'Ctrl',
            18: 'Alt',
            19: 'Pause',
            37: 'Left',
            38: 'Up',
            39: 'Right',
            40: 'Down',
            32: 'Space'
            //...
        }; //имена спецклавиш, если нужно


    function key(e) {
        e || (e = event);
        var key = e.which || e.keyCode, //первый случай для нормальных браузеров, второй для осла
            i = keys.length;
        if(e.type === 'keydown'){ //если событие keydown, т.е. клавиша нажата
            if( keys[i-1] !== key ){ //если срабатываение не повторное
                keys.push(key); //добавляем нажатую в конец массива
            }
        } else { //если клавиа поднята
            while(i--){ //перебор массива, можно было бы обойтись indexOf, да осёл не позволяет
                if( keys[i] === key){ //если есть такая
                    keys.splice(i,1); //то удаляем её из массива
                }
            }
        }
        show() //обновление выводимой информации, если вывод не планируется, то это вам не нужно
        e.preventDefault ? e.preventDefault() : ( e.returnValue = false ); //отмена срабатывания стандартного сочетания клавиш, как обычно первый случай для нормальных браузеров, второй для осла
    }
    function show() { //
        var i = keys.length,
            arr = keys.slice(0); //копируем массив клавиш
        while(i--){
            /* 
                Перебираем копию массива,
                сначаля ищем совпадения среди спецклавиш в names,
                затем пытаемся получить букву по коду клавиши,
                и в итоге, если ничего не вышло, оставляем код.
            */
        	arr[i] = names[ arr[i] ] || String.fromCharCode( arr[i] ) || '['+arr[i]+']';
        }
	setCharasterKey(arr);
	
//    if(arr.length==1){
//		setCharasterKey(arr[0]);
//	}else if(arr.length==0){
//		setCharasterKey(null);
//	}
        //document.getElementById('test_key').innerHTML = arr.join('+'); //вывод в первый элемент документа, в данном случае input
    }
    addEvent(document, 'keydown', key);
    addEvent(document, 'keyup', key);
}())