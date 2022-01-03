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
    this.load.atlas('mario', 'mario.png', 'mario.json')
    this.load.tilemapTiledJSON('map', 'mapa.json');
    this.load.image('bricks-spritesheet', 'bricks-spritesheet.png');  
}

//let player;
let cursors;
let mario;

function create ()
{
    cursors = this.input.keyboard.createCursorKeys();
    /*player = this.physics.add.sprite(20, 600, 'player');
    player.setScale(0.2);
    player.setCollideWorldBounds(true);
    player.body.gravity.y = 500;
    this.physics.add.collider(player, platforms);*/

    let map = this.make.tilemap({ key: 'map' });
    let tileset = map.addTilesetImage('bricks', 'bricks-spritesheet');  // set tileset name
    let layer = map.createLayer('Blocks', tileset, 0, 0);  // set layer name
    layer.setCollisionByProperty({ collidable: true })
    console.log(map.getLayer(layer).properties)

    mario = this.physics.add.sprite(18, 18, 'mario', 'mario-stop.png')
    mario.setPosition(30, 400)
    mario.body.gravity.y = 500;
    this.physics.add.collider(mario, layer)

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
        frameRate: 2
    })

    this.anims.create({
        key: 'mario-lose',
        frames: [{ key: 'mario', frame: 'mario-lose.png' }]
    })

    this.cameras.main.startFollow(mario, true, 0.05, 0.05)

    //mario.anims.play('mario-stop')
    //mario.flipX = true
}

function update(t, dt) {
    if(cursors.left.isDown) {
        mario.setVelocityX(-moveForce);
        mario.anims.play('mario-run', true)
        mario.flipX = true
    }
    else if(cursors.right.isDown) {
        mario.setVelocityX(moveForce);
        mario.anims.play('mario-run', true)
        mario.flipX = false
    }
    else {
        mario.setVelocityX(0);
        mario.anims.play('mario-stop')
    }
    
    if(cursors.up.isDown && mario.body.onFloor()){
        mario.setVelocityY(-jumpForce);
        mario.anims.play('mario-jump', true)
    }
}

    