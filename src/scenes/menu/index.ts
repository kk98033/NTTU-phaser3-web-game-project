export class MainMenu extends Phaser.Scene {
    private bgMusic!: any;

    constructor() {
        super('menu-scene');
    }

    preload() {
    }
    
    create() {
        this.bgMusic = this.sound.add('menuMusic', { loop: true });
        this.bgMusic.play();

        // backgtound image
        this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'backgroundImage2')
            .setOrigin(0, 0)
            .setTileScale(1, 1);

        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6)
            .setOrigin(0, 0);


        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY / 2,
            'Echoes of the Dungeon', 
            {
                fontFamily: 'PixelFont', 
                fontSize: '100px', 
                fontStyle: 'bold', 
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: this.cameras.main.width }
            }
        ).setOrigin(0.5, 0.5); 

        const buttonSpacing = 50; 
        let startGameButton = this.createButton('開始遊戲', () => this.startGame());
        let gameWebsiteButton = this.createButton('遊戲官方網站', () => this.openGameWebsite());

        startGameButton.setPosition(this.cameras.main.centerX, this.cameras.main.centerY - buttonSpacing / 2 + 100);
        gameWebsiteButton.setPosition(this.cameras.main.centerX, this.cameras.main.centerY + startGameButton.height + buttonSpacing / 2 + 100);

        // hide loading image
        var loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    createButton(text: string, onClick: any) {
        let buttonText = this.add.text(0, 0, text, { 
            fontFamily: 'PixelFontChinese',
            fontSize: '32px', 
            color: '#FFFFFF',
            fontStyle: 'bold' 
        })
        .setOrigin(0.5, 0.5);

        const buttonWidth = 300;

        let buttonBackground = this.add.rectangle(0, 0, buttonWidth, buttonText.height + 20, 0x6666ff)
            .setOrigin(0.5, 0.5);

        let button = this.add.container(0, 0, [buttonBackground, buttonText]);

        button.setSize(buttonBackground.width, buttonBackground.height);
        button.setInteractive({ useHandCursor: true })
            .on('pointerdown', onClick)
            .on('pointerover', () => buttonBackground.setFillStyle(0x7777ff))
            .on('pointerout', () => buttonBackground.setFillStyle(0x6666ff));

        return button;
    }

    startGame() {
        this.bgMusic.stop();

        this.cameras.main.fadeOut(2000, 0, 0, 0);

        // wait for fadeout
        this.time.delayedCall(2000, () => {
            // transition to next scence
            this.scene.start('dungeon-scene');
            this.scene.start('ui-scene');

            this.time.delayedCall(100, () => {
                this.scene.get('dungeon-scene').cameras.main.fadeIn(1000);
            });
        });
    }

    openGameWebsite() {
        window.open('https://games.iddle.dev/Echoes-of-the-Dungeon/about', '_blank');
    }
}
