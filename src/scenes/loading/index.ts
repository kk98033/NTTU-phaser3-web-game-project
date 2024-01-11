import { Scene } from 'phaser';

export class LoadingScene extends Scene {
    constructor() {
        super('loading-scene');
    }

    create(): void {
        // console.log('Loading scene was created');
        this.scene.start('dungeon-scene');
        // this.scene.launch('level-1-scene');
        this.scene.launch('ui-scene');

    }

    preload(): void {
        this.load.baseURL = 'assets/';
        // texture
        this.load.image('king', 'sprites/king.png');
        this.load.image('girl', 'sprites/girl.png');
        // atlas
        this.load.atlas('a-king', 'spritesheets/a-king.png', 'spritesheets/a-king_atlas.json');
        this.load.atlas('a-girl', 'spritesheets/a-girl.png', 'spritesheets/a-girl_atlas.json');

        this.load.image({
            key: 'tiles',
            url: 'tilemaps/tiles/dungeon-16-16.png',
        });

        this.load.image({
            key: 'backgroundImage',
            url: 'images/background.png',
        });

        this.load.image({
            key: 'settingsIcon',
            url: 'images/settingsIcon.png',
        });

        // load background music
        this.load.audio('backgroundMusic', 'mp3/background-music.mp3');
        // sound effects
        this.load.audio('attackSound', 'mp3/attack.mp3');
        this.load.audio('collectSound', 'mp3/collect.mp3');
        this.load.audio('loseSound', 'mp3/lose.mp3');
        this.load.audio('punchSound', 'mp3/punch.mp3');
        this.load.audio('fallingSound', 'mp3/falling.mp3');
        this.load.audio('completeSound', 'mp3/complete.mp3');
        this.load.audio('collectChestSound', 'mp3/collect-chest.mp3');
        this.load.audio('successSound', 'mp3/success.mp3');

        this.load.tilemapTiledJSON('dungeon', 'tilemaps/json/dungeon.json');
        
        this.load.tilemapTiledJSON('dungeonAssets', 'tilemaps/json/dungeon-assets.json');
        
        this.load.spritesheet('tiles_spr', 'tilemaps/tiles/dungeon-16-16.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
    }
}
