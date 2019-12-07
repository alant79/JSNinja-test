const WebSocket = require('ws');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var ws; 
var levers, leversHistory = [];
ws = new WebSocket('ws://node-test-task.javascript.ninja');
ws.onopen = () => {
  console.log('Соединение установлено.');
};

const request = new XMLHttpRequest();
const url = 'http://node-test-task.javascript.ninja';

/* Здесь мы указываем параметры соединения с сервером, т.е. мы указываем метод соединения GET, 
а после запятой мы указываем путь к файлу на сервере который будет обрабатывать наш запрос. */

request.open('GET', url);
request.addEventListener('readystatechange', () => {
  /*   request.readyState - возвращает текущее состояние объекта XHR(XMLHttpRequest) объекта, 
     бывает 4 состояния 4-е состояние запроса - операция полностью завершена, пришел ответ от сервера, 
     вот то что нам нужно request.status это статус ответа, 
     нам нужен код 200 это нормальный ответ сервера, 401 файл не найден, 500 сервер дал ошибку и прочее...   */
  if (request.readyState === 4 && request.status === 200) {
    // выводим в консоль то что ответил сервер
    res = JSON.parse(request.responseText);
    levers = res.levers;
    rev = res.revision;
    console.log('Begin ',levers,' ',res.revision); 
  }
});

// Выполняем запрос
var flReq = false;
var flFirst = true;
var isEnd = false;
//ws.send('shutdown');
ws.onmessage = response => {
try {
    if (isEnd) {
        console.log(response.data);
    }
    else {
        const str = JSON.parse(response.data);
        const lev = str.levers;
        console.log('change ',lev, ' ', str.revision);
        if (levers) {
            var revision;
    
            if (flFirst) {
                console.log(leversHistory);
                for (let index = 0; index < leversHistory.length; index++) {
                    const element = leversHistory[index];
                    if (element.revision> rev) {
                        revision = element.revision;
                        for (key in element.levers) {
                            if (element.levers[key] === 'changed') {
                              levers[key] = levers[key] === 'up' ? 'down' : 'up';
                            }
                          }
                    }
                    
                }
                flFirst  =false;
                console.log('Revision ',levers, ' ', revision);      
            }
            console.log('lever before ',levers, ' ', str.revision);      
            for (key in lev) {
              if (lev[key] === 'changed') {
                levers[key] = levers[key] === 'up' ? 'down' : 'up';
              }
            }
            console.log('lever after ',levers, ' ', str.revision);
            fl = false;
            for (key in levers) {
              if (levers[key] === 'up') {
                fl = true;
                break;
              }
            }
            if (!fl) {
                isEnd  =true;
              ws.send('shutdown');
            }
        } else {
            leversHistory.push(str);
            console.log('request');
            if (!flReq) {
                request.send();
                flReq = true;
            }
    
        }
    }
   
    
}
catch (err) {
    console.log(err);
    console.log(response.data);
}
  
};

ws.onerror = function(error) {
  console.log('Ошибка ' + error.message);
};
