var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "000",
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('player', 
        'ball.png',
        { frameWidth: 20, frameHeight: 20 }
    );
    this.load.image('platform', 
        'mario-brick.png',
        { frameWidth: 20, frameHeight: 20 }
    );
}
let player;
let cursors;
let platforms;

function create ()
{
    cursors = this.input.keyboard.createCursorKeys();
    platforms = this.physics.add.staticGroup();
    platforms.create(600, 550, 'platform');
    platforms.create(500, 500, 'platform');
    platforms.create(400, 450, 'platform');
    platforms.create(150, 375, 'platform');
    player = this.physics.add.sprite(20, 600, 'player');
    player.setCollideWorldBounds(true);
    player.body.gravity.y = 500;
    this.physics.add.collider(player, platforms);
}

function update() {
    if(cursors.left.isDown){
        player.setVelocityX(-300);
    }
    else if(cursors.right.isDown){
        player.setVelocityX(300);
    }
    else if(cursors.up.isDown && player.body.onFloor()){
        player.setVelocityY(-300);
    }
    else if(cursors.left.isDown && cursors.up.isDown && player.body.onFloor()){
        player.setVelocityX(-300);
        player.setVelocityY(-300);
    }
    else if(cursors.right.isDown && cursors.up.isDown && player.body.onFloor()){
        player.setVelocityX(300);
        player.setVelocityY(-300);
    }
    else{
        player.setVelocityX(0);
    }
}

    