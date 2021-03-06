/**
 * Player object
 * @param name
 * @param texture
 * @param data
 * @param stage
 * @param lives
 */

function player (name, texture, data, stage, lives, realtime, bulletTextures, animations, shieldT) {
    // se crea el sprite
    var self = this;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
    this.alive = true;
    this.tomb = new PIXI.Sprite(tombt);
    this.tomb.anchor = new PIXI.Point(0.5,0.5);
    this.tomb.visible = false;

    this.shieldSprite = new PIXI.Sprite(ballTexture);
    this.shieldSprite.anchor = new PIXI.Point(0.5,0.5);
    this.shieldSprite.scale = new PIXI.Point(0.6,0.6);
    this.shielded = false;

    if (animations) {
        this.anim = {
            down: new PIXI.extras.MovieClip(animations.down),
            up: new PIXI.extras.MovieClip(animations.up),
            left: new PIXI.extras.MovieClip(animations.left)
        };

        this.anim.down.animationSpeed = this.anim.up.animationSpeed = this.anim.left.animationSpeed  = 0.2;
        this.anim.down.anchor = this.anim.up.anchor = this.anim.left.anchor = new PIXI.Point(0.5,0.5);

        this.anim.up.visible = false;
        this.anim.left.visible = false;
        this.anim.down.scale = {x: CFG.players.size, y: CFG.players.size};
        this.tomb.scale = this.anim.up.scale = {x: CFG.players.size, y: CFG.players.size};

    }


    this.bulletTextures = bulletTextures;
    this.realtime = realtime;
    this.position = {};
    this.direction = 'right';
    this.player = true;
    this.konami = 'qwer';
    
    this.stage = stage;

    //se crea el nombre
    this.name = name;
    if (name) {
        this.text = new PIXI.Text(name);
        var style = {font:'bold 10px Arial', fill:'black', align:'center'};
        this.text.style = style;
    }


    //se asigna configuraciones
    this.data = data;

    if (data) {
        this.id = data.id ? data.id : CFG.players.default_id;
        //this.sprite.alpha = data.type === CFG.players.type.ENEMY ? CFG.players.alpha.ENEMY : CFG.players.alpha.PLAYABLE;
    }

    if(data.type === CFG.players.type.ENEMY){
        this.player = false;
    }



    //se atachea a una escena
    if (stage) {
        this.attach(stage);
    }

    if (lives) {
        this.lives = lives;
    }

    /*
    this.position.x = CFG.players.default_position.left;
    this.position.y = CFG.players.default_position.top;
    */

    this.position.x = Math.floor(Math.random() * (CFG.width - 70)) + 70;
    this.position.y = Math.floor(Math.random() * (CFG.height - 70)) + 70;

    this.setPosition(this.position , false);


}

// constantes

player.prototype.lives = CFG.players.lives;


player.prototype.respawn = function () {
    this.alive = true;
    this.shielded = false;
    this.tomb.visible = false;
    this.anim.down.visible = true;
    this.anim.up.visible = false;
    this.anim.left.visible = false;
    if(this.player){
        this.lives = 5;
        document.getElementById("game-status-life-opacity").style.opacity = 0;
    }
};



player.prototype.display_tomb = function () {

    this.alive = false;
    this.shielded = false;
    this.tomb.visible = true;
    this.anim.down.visible = false;
    this.anim.up.visible = false;
    this.anim.left.visible = false;
};


//se inicializa la posicion

player.prototype.setPosition = function (position, update) {
    if(!position) {return false;}
    if(!this.alive) {
        this.display_tomb();
        return false;
    }

    if(position.x >= (CFG.width - 32)){return false;}
    if(position.x <= (0 + 32)){return false;}
    if(position.y >= (CFG.height - 64)){return false;}
    if(position.y <= (0 + 64)){return false;}

    for (var i in enemy) {
      if(enemy[i].id != this.id){
        if(position.x > enemy[i].position.x){
            var x = position.x - enemy[i].position.x;
          }
          else {
            var x = enemy[i].position.x - position.x;
          }
          if(position.y > enemy[i].position.y){
            var y = position.y - enemy[i].position.y;
          }
          else {
            var y = enemy[i].position.y - position.y;
          }

          if(x <= 70 && y <= 70){
            return false;
          } 
      }       
    }

    if(position.x != this.position.x){

        this.anim.left.gotoAndStop(this.anim.left.currentFrame + 1 );

        if(position.x > this.position.x){
            this.direction = 'right';
            this.anim.up.visible = false;
            this.anim.down.visible = false;
            this.anim.left.visible = true;
            this.anim.left.scale = {x:-CFG.players.size, y:CFG.players.size};

        }
        else {
            this.direction = 'left';
            this.anim.up.visible = false;
            this.anim.down.visible = false;
            this.anim.left.visible = true;
            this.anim.left.scale = {x:CFG.players.size, y:CFG.players.size};

        }
        this.position.x = position.x;
    }
    
    if(position.y != this.position.y){
        this.anim.up.gotoAndStop(this.anim.up.currentFrame + 1 );
        this.anim.down.gotoAndStop(this.anim.down.currentFrame + 1 );

        if(position.y < this.position.y){
            this.direction = 'up';
            this.anim.up.visible = true;
            this.anim.down.visible = false;
            this.anim.left.visible = false;
        }
        else {
            this.direction = 'down';
            this.anim.up.visible = false;
            this.anim.down.visible = true;
            this.anim.left.visible = false;

        }
        this.position.y = position.y;    
    }

    this.tomb.position.x = this.anim.down.position.x = this.anim.up.position.x =  this.anim.left.position.x = this.position.x;
    this.tomb.position.y = this.anim.down.position.y = this.anim.up.position.y = this.anim.left.position.y =  this.position.y;
    this.text.x = this.position.x + 3 - (this.anim.up.width / 7);
    this.text.y = this.position.y - (25 + this.anim.up.height * CFG.players.size);
    this.shieldSprite.position.x = this.position.x;
    this.shieldSprite.position.y = this.position.y;


    if(update === false){
        return false;
    }
    this.realtime.emit('change position', this.position);
};

//Se realiza un disparo
player.prototype.fire = function (type) {
    var self = this;
    if(!type) {return false;}
    
    if(this.konami.length <= 3){
        this.konami += type;
    }
    else {
        this.konami = this.konami.substr(1, 3) + type;
    }



    if(this.konami.length >= 4){
        if(this.konami == 'qwwq'){
            var b = new bullet(this, this.bulletTextures, '1', this.stage, true, this.realtime, enemy);
            document.getElementById("sound-act1").play();           
        }
        if(this.konami == 'wqew'){
            var b = new bullet(this, this.bulletTextures, '2', this.stage, true, this.realtime, enemy);
            document.getElementById("sound-act2").play();
        }
        if(this.konami == 'ewwe'){
            document.getElementById("sound-act3").play();
            this.realtime.emit('shield');
            this.stage.addChild(this.shieldSprite);
            this.shielded = true;
            setTimeout(function(){
                self.shielded = false;
                self.stage.removeChild(self.shieldSprite);
            }, 2000);
        }
    }
    return true;
};


//se updatea la posicion desde el server

player.prototype.updateServer = function (data) {

    if(!data ) {return false; }
    var self = this;

    if(data.shield){
        self.shielded = true;
        self.shieldSprite.position.x = data.data.x;
        self.shieldSprite.position.y = data.data.y;
        self.stage.addChild(self.shieldSprite);
        setTimeout(function(){
            self.shielded = false;
            self.stage.removeChild(self.shieldSprite);
        }, 2000);    
                    
    }
    
    this.lives = data.life;
    this.setPosition(data.data, false);
};


// ataccheame esta
player.prototype.attach = function (stage) {

    stage.addChild(this.anim.down);
    stage.addChild(this.anim.up);
    stage.addChild(this.anim.left);

    stage.addChild(this.tomb);


    if(this.text) {
        stage.addChild(this.text);
    }
};

// borra todo
player.prototype.destroy = function (stage) {
  if(!stage) {return false};
    stage.removeChild(this.anim.down);
    stage.removeChild(this.anim.up);
    stage.removeChild(this.anim.left);

    if(this.text){
        stage.removeChild(this.text);
    }
};