import { GameObjects, Scene, Tilemaps } from 'phaser';
import { Player } from '../../classes/player';
import { Enemy } from '../../classes/enemy';
import { Minimap } from '../../classes/minimap';
import { Battle } from '../../classes/battle';
import { gameObjectsToObjectPoints } from '../../helpers/gameobject-to-object-point';

import { EVENTS_NAME, GameStatus } from '../../consts';

import { DungeonGenerator } from '../../classes/dungeonGenerator';

export class Dungeon extends Scene {
    private dungeonGenerator!: DungeonGenerator;

    private player!: Player;

    private map!: Tilemaps.Tilemap;
    private tileset!: Tilemaps.Tileset;
    private wallsLayer!: Tilemaps.TilemapLayer;
    private groundLayer!: Tilemaps.TilemapLayer;

    private chests!: Phaser.GameObjects.Sprite[];
    private points!: Phaser.GameObjects.Sprite[];
    private enemies!: Enemy[];

    private minimap!: Minimap;

    private battleEvent!: Battle;

    constructor() {
        super('dungeon-scene');
    }

    preload() {
        // load background music
        this.load.audio('backgroundMusic', '../../assets/mp3/Joshua McLean - Mountain Trials.mp3');
    }
    
    create(data: any): void {
        this.game.events.on(EVENTS_NAME.getHealth, this.posionHandler, this);
        // get data from previous level
        if (data && typeof data.health === 'number') {
            this.player = new Player(this, 16 * 16, 16 * 20, data.health);
            
        } else {
            console.log(data, 'sdfasfdasfdasf')
            this.player = new Player(this, 16 * 16, 16 * 20);
            // TODO: background music
            // player background music ＯＮＣＥ
            let bgMusic = this.sound.add('backgroundMusic', { loop: true });
            bgMusic.play();
        }
        this.game.registry.set('player', this.player);
        this.player.setDepth(10);

        console.log(data)

        // for battle rooms
        this.battleEvent = new Battle(this, this.physics, this.player);
        
        // create reandom dungeon
        this.dungeonGenerator = new DungeonGenerator(this, this.physics);
        this.dungeonGenerator.initMap();
        this.dungeonGenerator.generateRandomRooms();

        this.dungeonGenerator.setColisions(this.player);
        
        // this.physics.add.collider(this.player, this.wallsLayer);
        
        // create minimap
        this.minimap = new Minimap(this, this.dungeonGenerator.getRoomMaps(), 16);

        // create main camera
        this.initCamera()
        // this.initChests();
        // this.initEnemies();

        this.initPoints();

        this.cameras.main.fadeIn(1000, 0, 0, 0);
        // this.minimap.uiCamera.fadeIn(1000, 0, 0, 0);
    }

    update(): void {
        this.player.update();
        let [isInRoom, gridRow, gridCol] = this.player.getPlayerPosition(this.player.x, this.player.y);

        // in battle room
        if (this.battleEvent.isInBattleRoom(isInRoom, this.dungeonGenerator.getRoomsID(gridRow, gridCol))) {
            this.battleEvent.lockRoom(gridRow, gridCol);
        }
        
    }

    public posionHandler() {
        this.player.gainHP(10);
        console.log(this.player.getHPValue());
    };

    private initPoints(): void {
        this.dungeonGenerator.getPoints().forEach(point => {
            let sprite = this.physics.add.sprite(point.x, point.y, 'tiles_spr', point.id).setScale(2);
            sprite.setDepth(9);

            this.physics.add.overlap(this.player, sprite, (player, collidedSprite) => {
                if (point.id === 357) {
                    // next dungeon entrance
                    this.game.events.emit(EVENTS_NAME.goNextLevel);
                    collidedSprite.destroy();

                } else {
                    // chest
                    this.game.events.emit(EVENTS_NAME.chestLoot);
                    this.cameras.main.flash();
                    collidedSprite.destroy();
                }
    
            });
        });
    }

    private initMap(): void {
        // this.map = this.make.tilemap({ key: 'dungeonAssets', tileWidth: 16, tileHeight: 16 });
        // this.tileset = this.map.addTilesetImage('dungeon', 'tiles')!;
        // this.groundLayer = this.map.createLayer('aisle-ground-vertical', this.tileset, 0, 0)!;
        // this.wallsLayer = this.map.createLayer('aisle-walls-vertical', this.tileset, 0, 0)!;
        // this.wallsLayer.setCollisionByProperty({ collides: true });
        // this.physics.world.setBounds(0, 0, this.wallsLayer.width, this.wallsLayer.height);

        // this.dungeonGenerator.initMap();
        // this.dungeonGenerator.generateRandomRooms();

        // this.showDebugWalls();
    }

    private showDebugWalls(): void {
        const debugGraphics = this.add.graphics().setAlpha(0.7);
        this.wallsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        });
    }

    private initChests(): void {
        const objects = this.map.filterObjects('chests', obj => obj.name === 'ChestPoint') || [];
        const chestPoints = gameObjectsToObjectPoints(objects);

        this.chests = chestPoints.map(chestPoint =>
            this.physics.add.sprite(chestPoint.x, chestPoint.y, 'tiles_spr', 595).setScale(1.5),
        );

        this.chests.forEach(chest => {
            this.physics.add.overlap(this.player, chest, (obj1, obj2) => {
                this.game.events.emit(EVENTS_NAME.chestLoot);
                obj2.destroy();
                this.cameras.main.flash();
            });
        });
    }

    private initCamera(): void {
        this.cameras.main.setSize(this.game.scale.width, this.game.scale.height);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(2);
    }

    private initEnemies(): void {
        const enemiesPoints = gameObjectsToObjectPoints(
            this.map.filterObjects('Enemies', obj => obj.name === 'EnemyPoint') || []
        );
        this.enemies = enemiesPoints.map((enemyPoint) =>
            new Enemy(this, enemyPoint.x, enemyPoint.y, 'tiles_spr', this.player, 503)
                .setName(enemyPoint.id.toString())
                .setScale(1.5),
        );
        this.physics.add.collider(this.enemies, this.wallsLayer);
        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.player, this.enemies, (obj1, obj2) => {
            (obj1 as Player).getDamage(1);
        });
    }
}