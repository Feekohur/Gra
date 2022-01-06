var config = {
    type: Phaser.AUTO,
    width: 500,
    height: 270,
    backgroundColor: "000",
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
    },
    scale: {
        zoom: 2.5
    }
};

var game = new Phaser.Game(config);

let moveForce = 160
let jumpForce = 270

function preload ()
{
    this.load.atlas('mario', 'mario/mario.png', 'mario/mario.json')
    this.load.tilemapTiledJSON('map', 'map/mapa.json');
    this.load.image('bricks-spritesheet', 'map/bricks-spritesheet.png');
    this.load.spritesheet('coin', 'sheets/Coin2.png', {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('goomba', 'sheets/Goomba.png', {frameWidth: 18, frameHeight: 18});  
}

//let player;
let cursors;
let mario;

let goombas;
let gameOver = false;

let map;
let tileset;
let endTile;
let currentLayer;
let currentCollider;
let currentLevelIndex = 0;
let levels = []
let coins;

let CONTEXT

function create ()
{
    CONTEXT = this
    cursors = this.input.keyboard.createCursorKeys();
    /*player = this.physics.add.sprite(20, 600, 'player');
    player.setScale(0.2);
    player.setCollideWorldBounds(true);
    player.body.gravity.y = 500;
    this.physics.add.collider(player, platforms);*/

    levels.push(new Level("Level 1", {x:30, y:400}, null))
    levels.push(new Level("Level 2", {x:110, y:400}, null))

    mario = this.physics.add.sprite(18, 18, 'mario', 'mario-stop.png')
    mario.body.gravity.y = 500;

    map = this.make.tilemap({ key: 'map' });
    tileset = map.addTilesetImage('bricks', 'bricks-spritesheet');
    loadLayer(currentLevelIndex)

    this.anims.create({
        key: 'mario-stop',
        frames: [{ key: 'mario', frame: 'mario-stop.png' }]
    })

    this.anims.create({
        key: 'mario-run',
        frames: this.anims.generateFrameNames('mario', { start: 1, end: 2, prefix: 'mario-', suffix: '.png' }),
        repeat: -1,
        frameRate: 8
    })

    this.anims.create({
        key: 'mario-jump',
        frames: [{ key: 'mario', frame: 'mario-jump.png' }, { key: 'mario', frame: 'mario-fly.png' }],
        frameRate: 4
    })

    this.anims.create({
        key: 'mario-lose',
        frames: [{ key: 'mario', frame: 'mario-lose.png' }]
    })

    this.cameras.main.startFollow(mario, true, 0.05, 0.05)
    //mario.anims.play('mario-stop')
    //mario.flipX = true

    goombas = this.physics.add.group();
    spawnGoomba(200,400,50,50);
    spawnGoomba(715,300,50,50);

    this.anims.create({
        key: 'goomba-run',
        frames: this.anims.generateFrameNames('goomba', {start: 0, end: 1}),
        frameRate:8,
        repeat:-1
    });

    this.anims.create({
        key: 'goomba-dead',
        frames: this.anims.generateFrameNames('goomba', {frame: 2}),
        frameRate:8
    });

    this.anims.create({
        key: 'goomba-shot',
        frames: this.anims.generateFrameNames('goomba', {frame: 3}),
        frameRate:8
    });

    this.anims.create({
        key: 'flipping-coin',
        frames: this.anims.generateFrameNames('coin', {start: 0, end: 3}),
        frameRate:8,
        repeat:-1
    });

    /*Phaser.Actions.Call(goombas.getChildren(), function(goomba) {
        goomba.minX = goomba.x-25;
        goomba.maxX = goomba.x+125;
        goomba.speed = 1;
        goomba.setGravityY(500);
      }, this);*/

    this.physics.add.collider(goombas, currentLayer);
    this.physics.add.collider(mario, goombas, null, function ()
    {
        mario.anims.play('mario-lose');
        this.physics.pause();
        gameOver = true;
        this.cameras.main.stopFollow();
        //MarioDead(mario.y);
    }, this);
   coins = this.physics.add.group();
}

function update(t, dt) {

    let group_of_goombas = goombas.getChildren();
    if(gameOver){
        return;
    }
    // movement
    if(cursors.left.isDown) {
        mario.setVelocityX(-moveForce);
        mario.flipX = true
    }
    else if(cursors.right.isDown) {
        mario.setVelocityX(moveForce);
        mario.flipX = false
    }
    else {
        mario.setVelocityX(0);
    }
    
    if(cursors.up.isDown && mario.body.onFloor()){
        mario.setVelocityY(-jumpForce);
    }

    // animation
    if(cursors.left.isDown && mario.body.onFloor()) {
        mario.anims.play('mario-run', true)
    }
    else if(cursors.right.isDown && mario.body.onFloor()) { 
        mario.anims.play('mario-run', true)
    }
    else if(mario.body.onFloor()) {
        mario.anims.play('mario-stop')
    }

    if(cursors.up.isDown && mario.body.onFloor()){ 
        mario.anims.play('mario-jump', true)
    }
    //Goombas movement
    for(let i=0; i<group_of_goombas.length; i++){
        if(group_of_goombas[i].x>group_of_goombas[i].minX && group_of_goombas[i].x<group_of_goombas[i].maxX){
            group_of_goombas[i].x+=group_of_goombas[i].speed;
            group_of_goombas[i].anims.play('goomba-run', true);
        }
        else if(group_of_goombas[i].x<=group_of_goombas[i].minX){
            group_of_goombas[i].speed*=(-1);
            group_of_goombas[i].x+=group_of_goombas[i].speed;
            group_of_goombas[i].anims.play('goomba-run', true);
        }
        if(group_of_goombas[i].x>=group_of_goombas[i].maxX){
            group_of_goombas[i].speed*=(-1);
            group_of_goombas[i].x+=group_of_goombas[i].speed;
            group_of_goombas[i].anims.play('goomba-run', true);
        }
    }

    //Mario losing
    if(mario.y>550){
        mario.anims.play('mario-lose');
        this.physics.pause();
        gameOver = true;
        this.cameras.main.stopFollow();
        //MarioDead(mario.y);
    }

    if(isInEnd()) {
        loadNextLayer()
    }
}

function checkCollision(player, obj) {
    if(obj.properties.breakable && mario.body.onCeiling()){
        map.removeTile(obj)
        console.log(obj)
    }

    if(obj.properties.pointBlock && mario.body.onCeiling()) {
        let coin = coins.create(mario.x, mario.y-17, 'coin');
        coin.body.gravity.y = 500;
        coin.setVelocityY(-300);
        coin.anims.play('flipping-coin');
        setTimeout(function (){
            coin.disableBody(true, true);
        }, 1000)
        // Dodać pokazywanie się punktu nad blokiem
        console.log("spawn point")
        obj.properties.pointBlock = false
    }
}

function isInEnd() {
    var boundsA = mario.getBounds()
    var boundsB = endTile.getBounds()
    
    return Phaser.Geom.Rectangle.Overlaps(boundsA, boundsB);
}

function setEndTile(layer) {
    console.log(layer)
    endTile = layer.layer.data.find(array => array.find(tile => tile.properties.end == true)).find(tile => tile.properties.end == true)
}

function loadNextLayer() {
    currentLevelIndex++
    console.log(`Loading level ${currentLevelIndex+1}`)
    loadLayer(currentLevelIndex)
}

function loadLayer(levelIndex) {
    let lvl = levels[levelIndex]
    if(!lvl)
        return

    if(currentLayer) {
        currentLayer.visible = false
        map.destroyLayer(currentLayer.layer)
    }
    
    if(currentCollider)
        CONTEXT.physics.world.removeCollider(currentCollider)
    
    currentLayer = map.createLayer(lvl.name, tileset, 0, 0)
    currentLayer.setCollisionByProperty({ collidable: true })
    setEndTile(currentLayer)
    mario.setPosition(lvl.spawnPoint.x, lvl.spawnPoint.y)
    currentCollider = CONTEXT.physics.add.collider(mario, currentLayer, checkCollision)
}

function spawnGoomba(x, y, leftX, rightX){
    let goomba = goombas.create(x, y, 'goomba');
    goomba.minX = x-leftX;
    goomba.maxX = x+rightX;
    goomba.speed = 1;
    goomba.setGravityY(500);
}

class Level {
    constructor(name, spawnPoint, goombaArray) {
        this.name = name
        this.spawnPoint = spawnPoint
        this.goombaArray = goombaArray // np [ {x: 20, y: 20, minX: 10, maxX: 30} ]
    }
}