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
        
    }
    
    create(data: any): void {
        this.game.events.on(EVENTS_NAME.getHealth, this.posionHandler, this);
        // get data from previous level
        if (data && typeof data.health === 'number') {
            this.player = new Player(this, 16 * 16, 16 * 20, data.health);
            
        } else {
            this.player = new Player(this, 16 * 16, 16 * 20);

            // player background music ＯＮＣＥ
            let bgMusic = this.sound.add('backgroundMusic', { loop: true });
            bgMusic.setVolume(0.2); 
            bgMusic.play();
        }
        this.game.registry.set('player', this.player);
        this.player.setDepth(10);

        // console.log(data)

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
        // console.log(this.player.getHPValue());
    };

    private initPoints(): void {
        this.dungeonGenerator.getPoints().forEach(point => {
            let sprite = this.physics.add.sprite(point.x, point.y, 'tiles_spr', point.id).setScale(2);
            sprite.setDepth(9);

            this.physics.add.overlap(this.player, sprite, (player, collidedSprite) => {
                if (point.id === 357) {
                    // next dungeon entrance
                    this.sound.play('successSound');
                    this.game.events.emit(EVENTS_NAME.goNextLevel);
                    collidedSprite.destroy();
                }
                else if (point.id === 661) {
                    // fakeChest
                    this.sound.play('punchSound');
                    // this.game.events.emit(EVENTS_NAME.goNextLevel);
                    this.player.getDamage(20);
                    this.player.updateHPBar();
                    this.cameras.main.flash();
                    collidedSprite.destroy();

                } else {
                    // chest
                    this.sound.play('collectChestSound');
                    this.game.events.emit(EVENTS_NAME.chestLoot);
                    this.cameras.main.flash();
                    collidedSprite.destroy();
                }
    
            });
        });
    }

    private initCamera(): void {
        this.cameras.main.setSize(this.game.scale.width, this.game.scale.height);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(2);
    }
}