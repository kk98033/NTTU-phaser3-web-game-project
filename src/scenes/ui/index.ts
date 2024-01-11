import { Scene } from 'phaser';
import { Score, ScoreOperations } from '../../classes/score';
import { Actor } from '../../classes/actor';
import { Text } from '../../classes/text';
import { EVENTS_NAME, GameStatus } from '../../consts';

import { gameConfig } from '../../';

export class UIScene extends Scene {
    private score!: Score;
    private chestLootHandler: () => void;
    private coinHandler: () => void;

    private gameEndPhrase!: Phaser.GameObjects.Text;
    private gameEndHandler: (status: GameStatus) => void;
    private dungeonHandler: (status: GameStatus) => void;


    constructor() {
        super('ui-scene');
        
        // game over ui
        this.gameEndHandler = (status) => {
            this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
            this.game.scene.pause('dungeon-scene');
            this.gameEndPhrase = new Phaser.GameObjects.Text(
                this,
                this.game.scale.width / 2,
                this.game.scale.height * 0.4,
                status === GameStatus.LOSE
                    ? `WASTED!\nCLICK TO RESTART`
                    : `YOU ARE ROCK!\nCLICK TO RESTART`,
                {
                    // fontFamily: 'Arial',
                    fontSize: '32px',
                    align: 'center',
                    color: status === GameStatus.LOSE ? '#ff0000' : '#ffffff'
                },
            );
            this.add.existing(this.gameEndPhrase);
            this.gameEndPhrase.setPosition(
                this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
                this.game.scale.height * 0.4,
            );

            // restart
            this.input.on('pointerdown', () => {
                this.sound.stopAll();
                this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
                this.game.events.off(EVENTS_NAME.gameEnd, this.gameEndHandler);
                this.scene.get('dungeon-scene').scene.restart();
                this.scene.restart();
            });

        };

        // next level ui
        this.dungeonHandler = (status) => {
            this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
            this.game.scene.pause('dungeon-scene');
            
            // Display a message for the player to pick a new effect
            this.gameEndPhrase = this.add.text(
                this.game.scale.width / 2,
                this.game.scale.height * 0.3,
                '恭喜通過這層地牢！\n請選擇增益效果獎勵:D',
                {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
        
            // Define the options for the player
            const options = ["+15 血量", "+20 金幣", "+10% 移動速度", "+10% 攻擊速度", "+10% 獲取金幣量"];
            this.shuffleArray(options);
            const selectedOptions = options.slice(0, 3);

            // Create three buttons for the player to choose from
            selectedOptions.forEach((option, index) => {
                let button = this.add.text(
                    this.game.scale.width / 2,
                    this.game.scale.height * 0.4 + index * 60, // Position buttons below the message
                    option,
                    {
                        fontFamily: 'Arial',
                        fontSize: '24px',
                        color: '#ff0000',
                        backgroundColor: '#000',
                        padding: {
                            left: 10,
                            right: 10,
                            top: 5,
                            bottom: 5
                        },
                        align: 'center'
                    }
                )
                .setOrigin(0.5)
                .setInteractive() // Make the text interactive
                .on('pointerdown', () => {
                    // TODO: Apply the selected effect
                    // console.log(option);
                    this.applyEffect(options[index]);
        
                    // Continue to the next level
                    this.continueToNextLevel(index);
                    // console.log(index);
                });
            });
        };
        
        // win ui
        this.chestLootHandler = () => {
            this.score.changeValue(ScoreOperations.INCREASE, Math.floor(Math.random() * 20) + 10);
        };

        this.coinHandler = () => {
            // console.log('getcoin')
            this.score.changeValue(ScoreOperations.INCREASE, 2);
        };
    }


    private applyEffect(effect: string) {
        // Logic to apply the selected effect
        // console.log(`Effect applied: ${effect}`);
    }

    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            // 生成随机索引
            const j = Math.floor(Math.random() * (i + 1));
            // 交换元素
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    private continueToNextLevel(selectedOptionIndex: number) {
        this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
        this.game.events.off(EVENTS_NAME.goNextLevel, this.gameEndHandler);
        // this.stopAllScenes();           

        const player = this.game.registry.get('player');

        this.cameras.main.fadeOut(2000, 0, 0, 0);

        // wait for fadeout
        this.time.delayedCall(2000, () => {
            // transition to next scence
            this.scene.start('dungeon-scene', {
                score: this.score.getValue(),
                health: player.hp,
                selectedEffectIndex: selectedOptionIndex
            });

            this.scene.start('ui-scene', { score: this.score.getValue(), health: player.hp });

            this.time.delayedCall(100, () => {
                this.scene.get('dungeon-scene').cameras.main.fadeIn(1000);
            });
        });
    }

    create(data: any): void {
        if (data) {
            this.score = new Score(this, 20, 20, data.score);

        } else {
            this.score = new Score(this, 20, 20, 0);
        }
        this.initListeners();

        // setting ui
        let settingsButton = this.add.image(this.game.scale.width - 30 * 2, 30, 'settingsIcon').setInteractive();
        settingsButton.setOrigin(0.5, 0.5);
        settingsButton.on('pointerdown', () => {
            this.showSettingsWindow();
        });

        this.scene.moveAbove('dungeon-scene');
    }

    private showSettingsWindow() {
        let panel = this.add.rectangle(this.game.scale.width / 2, this.game.scale.height / 2, 400, 300, 0x000000);
        panel.setOrigin(0.5, 0.5);

        let closeButton = this.add.text(panel.x + 150, panel.y - 130, 'X', { fontSize: '24px' }).setInteractive();
        closeButton.on('pointerdown', () => {
            panel.destroy();
            closeButton.destroy();
            volumeSlider.destroy();
        });
    
        // adjust music
        let volumeSlider = this.add.dom(panel.x, panel.y).createFromHTML('<input type="range" min="0" max="1" step="0.1" value="' + this.sound.volume + '">');
        // console.log(volumeSlider);
        volumeSlider.addListener('input');
        volumeSlider.on('input', () => {
            let inputElement = volumeSlider.getChildByName('input') as HTMLInputElement;
            this.sound.volume = parseFloat(inputElement.value);
        });
    }

    private stopAllScenes() {
        const scenes = this.scene.manager.scenes;
    
        for (let scene of scenes) {
            if (scene.scene.isActive()) {
                scene.scene.stop();
            }
        }
    }

    private initListeners(): void {
        this.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler, this);
        this.game.events.on(EVENTS_NAME.coin, this.coinHandler, this);
        this.game.events.once(EVENTS_NAME.gameEnd, this.gameEndHandler, this);
        this.game.events.once(EVENTS_NAME.goNextLevel, this.dungeonHandler, this);
    }
}