import { gameObjectsToObjectPoints } from '../helpers/gameobject-to-object-point';
import { Player } from "./player";
import { Enemy } from './enemy';

import { EVENTS_NAME, GameStatus } from '../consts';


export class Battle {
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;

    private closedDoorsWallLayer!: Phaser.Tilemaps.TilemapLayer;
    private closedDoorsGroundLayer!: Phaser.Tilemaps.TilemapLayer;
    private wallColliders: Phaser.Physics.Arcade.Collider[] = [];

    public roomStatus: number[][]; // 1 explored, 0 not explored

    private enemies!: Enemy[];

    private tileSize: number;

    private isDroppedChestOnThisRoom = false;

    constructor(private scene: Phaser.Scene, private physics: Phaser.Physics.Arcade.ArcadePhysics, private player: Player) {
        // 1 => explored
        // 0 => not explored
        this.roomStatus = Array(3).fill(null).map(() => Array(3).fill(0));

        this.tileSize = 16;

        this.map = this.scene.make.tilemap({ key: 'dungeonAssets', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('dungeon', 'tiles')!;

        this.closedDoorsWallLayer = this.map.createBlankLayer('closed-doors-walls-layer', this.tileset, 0, 0, 150, 150)!;
        this.closedDoorsGroundLayer = this.map.createBlankLayer('closed-doors-ground-layer', this.tileset, 0, 0, 150, 150)!;

        this.closedDoorsWallLayer.setDepth(3);
        this.closedDoorsGroundLayer.setDepth(2);
        // console.log('careafkljasdp;fasdjlfsdjafdlas')
        // this.closedDoorsWallLayer = this.map.createLayer('closed-doors-walls', this.tileset, 0 * (30 + 15) * this.tileSize, 0 * (30 + 15) * this.tileSize)!;
        // this.closedDoorsGroundLayer = this.map.createLayer('closed-doors-ground', this.tileset, 0 * (30 + 15) * this.tileSize, 0 * (30 + 15) * this.tileSize)!;
        // this.closedDoorsWallLayer.setDepth(3);
        // this.closedDoorsGroundLayer.setDepth(3);
    }

    private setupEnemyDefeatedListener() {
        this.enemies.forEach(enemy => {
            enemy.on('enemy-defeated', () => {
                this.checkAndRemoveWalls();
                this.dropLoot(enemy);
            });
        });
    }

    private dropLoot(enemy: Enemy) {
        // 10% to drop a loot
        const randomChance = Math.random() * 100;

        if (randomChance < 10) {
            // pick potion or coin
            if (Math.random() < 0.5) {
                this.dropHealthPotion(enemy.x, enemy.y);
            } else {
                this.dropCoin(enemy.x, enemy.y);
            }
        }
    }

    // TODO: get potion and coin
    private dropHealthPotion(enemyX: number, enemyY: number) {
        let potion = this.physics.add.sprite(enemyX, enemyY, 'tiles_spr', 466)
            .setScale(1)
            .setDepth(9);
    
        this.physics.add.overlap(this.player, potion, (player, collidedPotion) => {
            console.log("get health potion!");
            collidedPotion.destroy();
        });
    }

    private dropCoin(enemyX: number, enemyY: number) {
        let coin = this.physics.add.sprite(enemyX, enemyY, 'tiles_spr', 562)
            .setScale(1)
            .setDepth(9);
    
        this.physics.add.overlap(this.player, coin, (player, collidedCoin) => {
            console.log("get coin!");
            collidedCoin.destroy();
        });
    }

    private spawnChest(row: number, col: number) {
        console.log('spawn chest')
        // get all chest points
        const chestPoints = gameObjectsToObjectPoints(
            this.map.filterObjects('ChestsPoint', obj => obj.name === 'ChestPoint') || []
        );

        // random pick 1 point to spawn chest
        const selectedPoint = this.getRandomPoints(chestPoints, 1)[0];

        // spawn chest
        this.scene.time.delayedCall(2000, () => {
            // calcute chest position
            const targetX = Math.floor(selectedPoint.x) + col * (30 + 15) * 16;
            const targetY = Math.floor(selectedPoint.y) + row * (30 + 15 - 1) * 16;
        
            // create chest outside the screen
            let chest = this.physics.add.sprite(targetX, -100, 'tiles_spr', 627)
                .setScale(2)
                .setDepth(2);
        
            // use tweens to move chest 
            this.scene.tweens.add({
                targets: chest,
                y: targetY,
                duration: 1000, 
                ease: 'Power2', // 动画缓动类型，可根据需要调整
                onComplete: () => {
                    // shake camera after chest dropped down
                    this.scene.cameras.main.shake(200, 0.01);
                }
            });
        
            // add physics
            this.physics.add.overlap(this.player, chest, (player, collidedChest) => {
                this.scene.game.events.emit(EVENTS_NAME.chestLoot);
                this.scene.cameras.main.flash();
                collidedChest.destroy();
            });
        
            // add listener
            this.setupEnemyDefeatedListener();
        });

        // this.scene.time.delayedCall(2000, () => {
        //     let sprite = this.physics.add.sprite(Math.floor(selectedPoint.x) + (col) * (30 + 15) * 16, Math.floor(selectedPoint.y) + (row) * (30 + 15 - 1) * 16, 'tiles_spr', 627)
        //             .setScale(2)
        //             .setDepth(2);

        //     // add physics
        //     this.physics.add.overlap(this.player, sprite, (player, collidedSprite) => {
        //         this.scene.game.events.emit(EVENTS_NAME.chestLoot);
        //         this.scene.cameras.main.flash();
        //         collidedSprite.destroy();
        //     });

        //     this.setupEnemyDefeatedListener();
        // });
    }

    private checkAndRemoveWalls() {
        const areAllEnemiesDefeated = this.enemies.every(enemy => enemy.active === false);
        // all enemies are defeated
        if (areAllEnemiesDefeated) {
            this.unlockRoom();
            console.log('unlock roomm');

            let [isInRoom, gridRow, gridCol] = this.player.getPlayerPosition(this.player.x, this.player.y);

            if (!this.isDroppedChestOnThisRoom) {
                this.spawnChest(gridRow, gridCol);
            }
            this.isDroppedChestOnThisRoom = true;
        }
    }

    public isInBattleRoom(isInRoom: boolean, id: number) {
        if (isInRoom && id === 2) {
            return true;
        }
        return false;
    }

    public spawnEnemys(row: number, col: number) {
        // random pick 5 ~ 10 enemys
        let enemyAmount = Math.floor(Math.random() * 10) + 5;
        let eliteEnemy = 1 ? enemyAmount <= 5 : 0;

        this.initEnemies(enemyAmount, row, col);
    }

    private initEnemies(enemyAmount: number, row: number, col: number): void {
        this.enemies = [];
        // Get all enemy spawn points
        const enemiesPoints = gameObjectsToObjectPoints(
            this.map.filterObjects('EnemiesPoint', obj => obj.name === 'EnemyPoint') || []
        );
    
        // Randomly pick n points to spawn enemies
        const selectedPoints = this.getRandomPoints(enemiesPoints, enemyAmount);
    
        // Spawn each enemy with a delay and fade-in animation
        selectedPoints.forEach((enemyPoint, index) => {
            this.scene.time.delayedCall(1000 * index, () => {
                // Calculate spawn position
                const x = Math.floor(enemyPoint.x) + col * (30 + 15) * 16;
                const y = Math.floor(enemyPoint.y) + row * (30 + 15 - 1) * 16;
    
                // Create enemy initially invisible
                const enemy = new Enemy(this.scene, x, y, 'tiles_spr', this.player, 503)
                    .setName(enemyPoint.id.toString())
                    .setScale(1.5)
                    .setDepth(10)
                    .setAlpha(0); // Start with alpha 0 (invisible)
    
                // Animate enemy fade-in
                this.scene.tweens.add({
                    targets: enemy,
                    alpha: 1, // Target alpha value (fully visible)
                    duration: 2000, // Duration of the fade-in effect
                    ease: 'Power2', // Easing function
                    onStart: () => {
                        // Create particle effect when the animation starts
                        this.createParticleEffect(x, y);
                    }
                });
    
                // Add enemy to the enemies array
                this.enemies.push(enemy);
    
                // Add physics interactions
                this.physics.add.collider(enemy, this.closedDoorsWallLayer!);
                this.physics.add.collider(enemy, this.enemies);
                this.physics.add.collider(this.player, enemy, (player, collidedEnemy) => {
                    (player as Player).getDamage(1);
                });
    
                // Set up listener for when enemies are defeated
                this.setupEnemyDefeatedListener();
            });
        });
    }
    
    
    private createParticleEffect(x: number, y: number) {
        // Create particle effect logic here
        // Example: this.add.particles('particleKey').createEmitter({ ... });
    }

    private getRandomPoints(points: any[], n: number): any[] {
        const shuffled = points.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    private unlockRoom() {
        this.wallColliders.forEach(collider => collider.destroy());
        this.wallColliders = [];

        // add flash effect
        this.flashLayer(this.closedDoorsWallLayer);
        this.flashLayer(this.closedDoorsGroundLayer);

        // claer walls
        this.scene.time.delayedCall(2500, () => {
            this.clearTiles(this.closedDoorsWallLayer);
            this.clearTiles(this.closedDoorsGroundLayer);
        });
    }

    private flashLayer(layer: Phaser.Tilemaps.TilemapLayer) {
        this.scene.tweens.add({
            targets: layer,
            alpha: { from: 1, to: 0 },
            duration: 350, 
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                // layer.setAlpha(0); 
            }
        });
    }

    private resetLayer(layer: Phaser.Tilemaps.TilemapLayer) {
        this.scene.tweens.killTweensOf(layer);
        if (layer) {
            layer.setAlpha(1);
        }
    }

    public lockRoom(row: number, col: number) {
        this.isDroppedChestOnThisRoom = false;
        if (this.roomStatus[row][col] === 1) {
            // if explored, don't lock the room again
            return;
        }

        this.scene.time.delayedCall(500, () => {
            // draw walls to block entrance
            this.resetLayer(this.closedDoorsWallLayer);
            this.resetLayer(this.closedDoorsGroundLayer);

            this.drawTiles(this.closedDoorsGroundLayer, 'closed-doors-ground', false, col * (30 + 15), row * (30 + 15 - 1));
            this.drawTiles(this.closedDoorsWallLayer, 'closed-doors-walls', true, col * (30 + 15), row * (30 + 15 - 1));

            this.setColisions();
    
            this.spawnEnemys(row, col);

            this.checkAndTeleportPlayer(row, col);
        });

        // explored
        this.roomStatus[row][col] = 1;
    }

    private checkAndTeleportPlayer(row: number, col: number) {
        const roomX = col * (30 + 15) * this.tileSize;
        const roomY = row * (30 + 15) * this.tileSize;
        const roomWidth = 30 * this.tileSize; 
        const roomHeight = 30 * this.tileSize;
    
        if (
            this.player.x < roomX + 16 || this.player.x > roomX + roomWidth - 16 ||
            this.player.y < roomY + 16 || this.player.y > roomY + roomHeight - 16
        ) {
            // player not in the room, teleport to center
            this.player.setPosition(roomX + roomWidth / 2, roomY + roomHeight / 2);
        }
    }

    public setColisions() {
        this.closedDoorsWallLayer!.setCollisionByProperty({ collides: true });
        const wallCollider = this.physics.add.collider(this.player, this.closedDoorsWallLayer!);
        this.wallColliders.push(wallCollider);
    }

    private clearTiles(layerType: Phaser.Tilemaps.TilemapLayer) {
        layerType.forEachTile(tile => {
            if (tile) {
                layerType.removeTileAt(tile.x, tile.y);
            }
        }, this, 0, 0, layerType.width, layerType.height);
    }

    private drawTiles(layerType: Phaser.Tilemaps.TilemapLayer, layerName: string, collides: boolean, xOffset = 0, yOffset = 0): void {
        console.log('type:', layerType)
        this.map.layers.forEach(layer => {
            if (layer.name === layerName || layer.name === 'battle-ground') {
                let data = layer.data;
                let width = layer.width;
                let height = layer.height;

                // Iterate over each tile and draw it
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let tile = data[y][x];
                        if (tile.index !== -1) {
                            // Draw walls or floor based on layer name
                            if (layer.name === layerName) {
                                let newTile = layerType.putTileAt(tile.index, x + xOffset, y + yOffset);
                                if (collides && newTile) newTile.properties.collides = true; // Set collision property
                            } else {
                                
                            }
                        }
                    }
                }
            }
        });
        this.map.setCollisionByProperty({ collides: true });
    }
}