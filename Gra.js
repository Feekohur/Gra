var config = {
    type: Phaser.CANVAS,
    width: 500,
    height: 260,
    backgroundColor: "000",
    canvas: document.getElementById('canvas-element'),
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
    this.load.spritesheet('fireBlock', 'sheets/TheFireBlock.png', {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('fireSprite', 'sheets/FireSprite-8x8.png', {frameWidth: 8, frameHeight: 8});  
    this.load.image('background','sheets/background.png')
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
let group = [];
let fireBlocks;
let line;
let fireCollider = [];
let line1;
let graphics;

let pointCount = 0
let CONTEXT

let levelText = document.getElementById('level')
let pointsText = document.getElementById('points')

function create ()
{
    pointsText.innerHTML = `Points: ${pointCount}`
    levelText.innerHTML = `Level ${currentLevelIndex+1}`

    graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });

    line1 = new Phaser.Geom.Line(0, 0, 1000, 500);

    CONTEXT = this
    cursors = this.input.keyboard.createCursorKeys();
    /*player = this.physics.add.sprite(20, 600, 'player');
    player.setScale(0.2);
    player.setCollideWorldBounds(true);
    player.body.gravity.y = 500;
    this.physics.add.collider(player, platforms);*/

    let background = this.add.image(0, 0,'background');
    background.setOrigin(0);
    background.setScrollFactor(0);

    levels.push(new Level("Level 1", 
        {x:30, y:400}, 
        [{x:200, y:400, leftX:50, rightX:50}, {x:700, y:300, leftX:110, rightX:40}],
        [{x:520, y:180, length:13}, {x:750, y:180, length:13}]))
    levels.push(new Level("Level 2", 
        {x:110, y:400}, 
        null,
        [{x:505, y:440, length: 12}]))

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
    
    //mario.anims.play('mario-stop')
    //mario.flipX = true
    goombas = this.physics.add.group();
    //spawnGoomba(200,400,50,50);
    //spawnGoomba(715,300,50,50);
    fireBlocks = this.physics.add.staticGroup();

    mario = this.physics.add.sprite(18, 18, 'mario', 'mario-stop.png')
    mario.body.gravity.y = 500;

    map = this.make.tilemap({ key: 'map' });
    tileset = map.addTilesetImage('bricks', 'bricks-spritesheet');
    loadLayer(currentLevelIndex)

    this.cameras.main.startFollow(mario, true, 0.05, 0.05)

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

    coins = this.physics.add.group();

    this.anims.create({
        key: 'spinning-fire',
        frames: this.anims.generateFrameNames('fireSprite', {start: 0, end: 3}),
        frameRate:8,
        repeat: -1
    });
}

function update(t, dt) {
    //is level finished
    if(isInEnd()) {
        loadNextLayer()
    }

    Phaser.Geom.Line.Rotate(line1, 0.02);

    graphics.clear();

    graphics.strokeLineShape(line1);

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
    //Fire movement
    for (let i = 0; i < group.length; i++) {
        const group_of_fire = group[i].getChildren();
        for(let j=0; j<group_of_fire.length; j++){
            group_of_fire[j].anims.play('spinning-fire', true);
        }
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
        loseGame();
    }

    for (let i = 0; i < group.length; i++) {
        const group_of_fire = group[i].getChildren();
        const posX = fireBlocks.getChildren()[i].x
        const posY = fireBlocks.getChildren()[i].y
        Phaser.Actions.RotateAround(group_of_fire, { x: posX, y: posY }, 0.05);
    }
}

function checkCollision(player, obj) {
    if(obj.properties.breakable && mario.body.onCeiling()){
        map.removeTile(obj)
    }

    if(obj.properties.pointBlock && mario.body.onCeiling()) {
        let coin = coins.create(obj.pixelX+7.5, obj.pixelY-7, 'coin');
        coin.scale = 0.5
        coin.body.gravity.y = 1500;
        coin.setVelocityY(-300);
        coin.anims.play('flipping-coin');
        CONTEXT.physics.add.collider(coin, currentLayer);
        CONTEXT.physics.add.overlap(mario, coin, collectCoin, null)
        /*setTimeout(function (){
            coin.disableBody(true, true);
        }, 400)*/
        obj.properties.pointBlock = false
    }
}

function collectCoin(player, coin) {
    addPoint()
    coin.destroy(true)
}

function addPoint() {
    pointCount++
    pointsText.innerHTML = `Points: ${pointCount}`
}

function isInEnd() {
    var boundsA = mario.getBounds()
    var boundsB = endTile.getBounds()
    
    return Phaser.Geom.Rectangle.Overlaps(boundsA, boundsB);
}

function setEndTile(layer) {
    endTile = layer.layer.data.find(array => array.find(tile => tile.properties.end == true)).find(tile => tile.properties.end == true)
}

function loadNextLayer() {
    currentLevelIndex++
    loadLayer(currentLevelIndex)
    levelText.innerHTML = `Level ${currentLevelIndex+1}`
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

    if(goombas)
        clearGoombas()
    
    if(group.length > 0)
        clearFirebars()
    
    currentLayer = map.createLayer(lvl.name, tileset, 0, 0)
    currentLayer.setCollisionByProperty({ collidable: true })
    setEndTile(currentLayer)
    mario.setPosition(lvl.spawnPoint.x, lvl.spawnPoint.y)
    currentCollider = CONTEXT.physics.add.collider(mario, currentLayer, checkCollision)

    //spawning goombas
    if(lvl.goombaArray) {
        for (let i = 0; i < lvl.goombaArray.length; i++) {
            const opts = lvl.goombaArray[i];
            spawnGoomba(opts.x, opts.y, opts.leftX, opts.rightX)
        }
    }
    
    if(lvl.firebarArray) {
        for (let i = 0; i < lvl.firebarArray.length; i++) {
            const opts = lvl.firebarArray[i];
            spawnFireBar(opts.x, opts.y, opts.length)
        }
    }
}

function spawnGoomba(x, y, leftX, rightX){
    let goomba = goombas.create(x, y, 'goomba');
    goomba.minX = x-leftX;
    goomba.maxX = x+rightX;
    goomba.speed = 1;
    goomba.setGravityY(500);
    CONTEXT.physics.add.collider(goomba, currentLayer);
    CONTEXT.physics.add.collider(mario, goomba, function (m, g)
    {
        if(g.body.touching.up) {
            g.disableBody(true, true);
        }
        else {
            loseGame()
        }
    });
}

function spawnFireBar(x, y, length){
    fireBlocks.create(x, y, 'fireBlock');
    line = new Phaser.Geom.Line(x, y, x, y - length * 8);
    groupElement = CONTEXT.physics.add.group({ key: 'fireSprite', frameQuantity: length })
    group.push(groupElement)
    Phaser.Actions.PlaceOnLine(groupElement.getChildren(), line);
    fireCollider.push(CONTEXT.physics.add.collider(mario, group, loseGame))
}

function clearGoombas() {
    let group = goombas.getChildren()
    for (let i = 0; i < group.length; i++) {
        const goomba = group[i];
        goomba.disableBody(true, true)
    }
}

function clearFirebars() {
    let groupFireblocks = fireBlocks.getChildren()
    for (let i = 0; i < groupFireblocks.length; i++) {
        const firebar = groupFireblocks[i];
        firebar.disableBody(true, true)
    }

    for (let i = 0; i < group.length; i++) {
        const group_of_fire = group[i].getChildren();
        for (let j = 0; j < group_of_fire.length; j++) {
            const fire = group_of_fire[j];
            fire.disableBody(true, true)
        }
    }

    for (let i = 0; i < fireCollider.length; i++) {
        const collider = fireCollider[i];
        CONTEXT.physics.world.removeCollider(collider);
    }
}

function loseGame() {
    mario.anims.play('mario-lose');
    //CONTEXT.anims.pauseAll();
    gameOver = true;
    CONTEXT.cameras.main.stopFollow();
    mario.setVelocityX(0);
    mario.setVelocityY(-300);
    mario.setGravityY(500);
    CONTEXT.physics.world.removeCollider(currentCollider);
    for (let i = 0; i < fireCollider.length; i++) {
        const collider = fireCollider[i];
        CONTEXT.physics.world.removeCollider(collider);
    }
    //CONTEXT.physics.pause();
    /*CONTEXT.physics.world.removeCollider(currentCollider);
    CONTEXT.physics.world.removeCollider(fireCollider);
    mario.setVelocityX(0);
    mario.setVelocityY(-300);
    mario.setGravityY(500);
    CONTEXT.physics.pause();*/

    //setTimeout(CONTEXT.scene.restart(),5000);
}

//function movingLine();

class Level {
    constructor(name, spawnPoint, goombaArray, firebarArray) {
        this.name = name
        this.spawnPoint = spawnPoint
        this.goombaArray = goombaArray // np [ {x: 20, y: 20, minX: 10, maxX: 30} ]
        this.firebarArray = firebarArray
    }
}