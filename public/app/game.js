var width = document.body.clientWidth > 1000 ? document.body.clientWidth : 1000;

var renderer = PIXI.autoDetectRenderer( CFG.width , CFG.height,  { transparent: true, view: document.getElementById('game-canvas') });
var stage = new PIXI.Container();
var enemy = [];
var yetiTexture;
var bulletsTextures;
var yeti;
var key = [];
var shieldTexture;

var animations = {};

var previous = 0,
    frameDuration = 1000 / CFG.fps,
    lag = 0;

var socket = io();
var imsocket = {};
var tombt;

PIXI.loader
    .add('yeti', 'assets/yeti.png')
    .add('anim_down', 'assets/caminar_down.json')
    .add('anim_up', 'assets/caminar_up.json')

    .add('anim_left', 'assets/caminar_left.json')

    .add('bullet1', 'assets/bullet-one.png')
    .add('bullet2', 'assets/bullet-two.png')
    .add('shieldt', 'assets/shield.png')
    .add('tomb_texture', 'assets/tomb.png')
    .add('shield', 'assets/shield.png')

    

    .load(onLoadedCallback);


function onLoadedCallback(loader, resources) {
    
    yetiName = parseInt((Math.random() * 10000));
    yetiTexture = resources.yeti.texture;

    shieldTexture = resources.shieldt.texture;
    tombt = resources.tomb_texture.texture;

    bulletsTextures = {
        bullet1: resources.bullet1.texture,
        bullet2: resources.bullet2.texture
    };


    var frames_down = [];

    for (var i = 1; i < 8; i++) {
        frames_down.push(PIXI.Texture.fromFrame('Caminar_d_0' + i + '.png'));
    }

    animations.down = frames_down;


    var frames_up = [];

    for (var i = 1; i < 8; i++) {
        frames_up.push(PIXI.Texture.fromFrame('Caminar_a_0' + i + '.png'));
    }
    animations.up = frames_up;


    var frames_left = [];

    for (var i = 1; i < 7; i++) {
        frames_left.push(PIXI.Texture.fromFrame('Caminar_c_0' + i + '.png'));
    }

    animations.left = frames_left;



    yeti = new player(yetiName, yetiTexture, {type: CFG.players.type.PLAYABLE}, stage, undefined, socket, bulletsTextures, animations,  shieldTexture, tombt);
    socket.emit('add user', yetiName);


    document.getElementById("loader").className = '';
    animate();
}

socket.on('user joined', function(data) {
    var newEnemy = new player(data.username, yetiTexture, {type: CFG.players.type.ENEMY, id: data.id}, stage, undefined, socket, undefined, animations, shieldTexture, tombt);
    enemy.push(newEnemy);
});

socket.on('render fire', function(data) {
    var b = new bullet(data, bulletsTextures, data.type, stage,  false, socket, enemy);
});



socket.on('init users', function(data){

    imsocket = {id: data.id, username: data.username};
    socket.emit('change position', {x: yeti.position.x, y: yeti.position.y});

    var users = data.users;

    console.log(data);
    if(users) {
        var l = users.length;
        if(users.length) {
            for (var i = 0; i < l ; i++) {
                var newEnemy = new player(users[i].username, yetiTexture, {type: CFG.players.type.ENEMY, id: users[i].id}, stage, undefined, socket, undefined , animations);
                var playerData = users[i].playerData;
                newEnemy.setPosition(playerData, false);

                enemy.push(newEnemy);
            }

        }
    }
});

socket.on('die', function(data){
    var toRemove = _.findIndex(enemy, {id: data});
    if(toRemove >= 0){
        enemy[toRemove].display_tomb();
        enemy[toRemove].destroy(stage);
        enemy.splice(toRemove, 1);
    }
    else {
        if(imsocket.id == data){
            console.log('DIE!!!!');
        }
    }
});

socket.on('user left', function(data){

    var toRemove = _.findIndex(enemy, {id: data.id});

    if(toRemove >= 0){
        enemy[toRemove].destroy(stage);
        enemy.splice(toRemove, 1);
    }
});

socket.on('change position', function(data) {
    var toUpdate = _.find(enemy, {id: data.id});
    if(toUpdate) { toUpdate.updateServer(data);}
});

function animate(timestamp) {
    requestAnimationFrame(animate);
    checkActions();
    if (!timestamp) timestamp = 0;
    var elapsed = timestamp - previous;
    if (elapsed > 1000) elapsed = frameDuration;
    lag += elapsed;

    while (lag >= frameDuration) {
        //yeti.update(socket);
        lag -= frameDuration;
    }

    renderer.render(stage);
    previous = timestamp;

}

window.addEventListener('keydown', checkKey, true);
window.addEventListener('keyup', function (e) {

    if (e.keyCode == '81' || e.keyCode == '87' || e.keyCode == '69' || e.keyCode == '82') {
        return false;
    }

    delete key[e.keyCode];

}, true);


function checkKey(e) {

    key[e.keyCode] = true;


    if (e.keyCode == '81') {
        yeti.fire('q');
    }
    if (e.keyCode == '87') {
        yeti.fire('w');
    }
     if (e.keyCode == '69') {
        yeti.fire('e');
    }
     if (e.keyCode == '82') {
        yeti.fire('r');
    }



}

function checkActions () {
    if (key['38']) {
        // up arrow
        var y =  yeti.position.y;
        y = y - CFG.players.velocity.min ;
        yeti.setPosition({y: y, x: yeti.position.x });
    }
    else if (key['40']) {
        // down arrow
        var y =  yeti.position.y;
        y = y + CFG.players.velocity.min ;
        yeti.setPosition({y: y, x: yeti.position.x });
    }
     if (key['37']) {
        // left arrow
        var x =  yeti.position.x;
        x = x - CFG.players.velocity.min ;
        yeti.setPosition({x: x, y: yeti.position.y });
    }
    else if (key['39']) {
        // right arrow
        var x =  yeti.position.x;
        x = x + CFG.players.velocity.min ;
        yeti.setPosition({x: x, y: yeti.position.y });
    }



}



