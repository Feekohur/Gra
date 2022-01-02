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
    this.load.image('player', 'Mario.png');
    this.load.image('platform', 'platform.png');
}
let player;
let cursors;
let platforms;

function create ()
{
    cursors = this.input.keyboard.createCursorKeys();
    platforms = this.physics.add.staticGroup();
    platforms.create(600, 550, 'platform');
    platforms.create(150, 400, 'platform');
    platforms.create(600, 250, 'platform');
    platforms.create(150, 100, 'platform');
    player = this.physics.add.sprite(20, 600, 'player');
    player.setScale(0.2);
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
        player.setVelocityY(-450);
    }
    else if(cursors.left.isDown && cursors.up.isDown && player.body.onFloor()){
        player.setVelocityX(-300);
        player.setVelocityY(-450);
    }
    else if(cursors.right.isDown && cursors.up.isDown && player.body.onFloor()){
        player.setVelocityX(300);
        player.setVelocityY(-450);
    }
    else{
        player.setVelocityX(0);
    }
}

    