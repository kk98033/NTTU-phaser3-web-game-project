import { gameObjectsToObjectPoints } from '../helpers/gameobject-to-object-point';
import { Player } from "./player";
import { Enemy } from './enemy';


export class Battle {
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;

    private closedDoorsWallLayer!: Phaser.Tilemaps.TilemapLayer;
    private closedDoorsGroundLayer!: Phaser.Tilemaps.TilemapLayer;
    private wallColliders: Phaser.Physics.Arcade.Collider[] = [];

    public roomStatus: number[][]; // 1 explored, 0 not explored

    private enemies!: Enemy[];

    private tileSize: number;

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

    setupEnemyDefeatedListener() {
        this.enemies.forEach(enemy => {
            enemy.on('enemy-defeated', () => {
                this.checkAndRemoveWalls();
            });
        });
    }

    checkAndRemoveWalls() {
        const areAllEnemiesDefeated = this.enemies.every(enemy => enemy.active === false);
        if (areAllEnemiesDefeated) {
            this.unlockRoom();
        }
    }

    public isInBattleRoom(isInRoom: boolean, id: number) {
        if (isInRoom && id === 2) {
            return true;
        }
        return false;
    }

    public generateEnemys(row: number, col: number) {
        // random pick 5 ~ 10 enemys
        let enemyAmount = Math.floor(Math.random() * 10) + 5;
        let eliteEnemy = 1 ? enemyAmount <= 5 : 0;

        this.initEnemies(enemyAmount, row, col);

        
    }

    private initEnemies(enemyAmount: number, row: number, col: number): void {
        // get all points
        const enemiesPoints = gameObjectsToObjectPoints(
            this.map.filterObjects('EnemiesPoint', obj => obj.name === 'EnemyPoint') || []
        );

        // random pick n points to spawn enemies
        const selectedPoints = this.getRandomPoints(enemiesPoints, enemyAmount);

        // spawn enemies
        this.scene.time.delayedCall(1000, () => {
            this.enemies = selectedPoints.map((enemyPoint) =>
                new Enemy(this.scene, Math.floor(enemyPoint.x) + (col) * (30 + 15) * 16, Math.floor(enemyPoint.y) + (row) * (30 + 15 - 1) * 16, 'tiles_spr', this.player, 503)
                    .setName(enemyPoint.id.toString())
                    .setScale(1.5)
                    .setDepth(10),
            );
            // add physics
            this.physics.add.collider(this.enemies, this.closedDoorsWallLayer!);
            this.physics.add.collider(this.enemies, this.enemies);
            this.physics.add.collider(this.player, this.enemies, (obj1, obj2) => {
                (obj1 as Player).getDamage(1);
            });

            this.setupEnemyDefeatedListener();
        });
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
                layer.setAlpha(0); 
            }
        });
    }

    public lockRoom(row: number, col: number) {
        if (this.roomStatus[row][col] === 1) {
            // if explored, don't lock the room again
            return;
        }

        this.scene.time.delayedCall(500, () => {
            // draw walls to block entrance
            this.drawTiles(this.closedDoorsGroundLayer, 'closed-doors-ground', false, col * (30 + 15), row * (30 + 15 - 1));
            this.drawTiles(this.closedDoorsWallLayer, 'closed-doors-walls', true, col * (30 + 15), row * (30 + 15 - 1));

            this.setColisions();
    
            this.generateEnemys(row, col);

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