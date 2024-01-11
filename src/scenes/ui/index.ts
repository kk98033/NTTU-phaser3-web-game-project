import { Scene } from 'phaser';
import { Score, ScoreOperations } from '../../classes/score';
import { Actor } from '../../classes/actor';
import { Text } from '../../classes/text';
import { EVENTS_NAME, GameStatus } from '../../consts';

import { gameConfig } from '../../';

export class UIScene extends Scene {
    private score!: Score;
    private chestLootHandler: () => void;

    private gameEndPhrase!: Phaser.GameObjects.Text;
    private gameEndHandler: (status: GameStatus) => void;
    private dungeonHandler: (status: GameStatus) => void;


    constructor() {
        super('ui-scene');
        this.chestLootHandler = () => {
            this.score.changeValue(ScoreOperations.INCREASE, 10);
        };
        
        
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
                'Choose an effect to continue:',
                {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
        
            // Define the options for the player
            const options = ["Effect One", "Effect Two", "Effect Three"];
        
            // Create three buttons for the player to choose from
            options.forEach((option, index) => {
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
                    console.log(option);
                    this.applyEffect(options[index]);
        
                    // Continue to the next level
                    this.continueToNextLevel(index);
                    console.log(index);
                });
            });
        };
        
        // this.continueToNextLevel = () => {
        //     const player = this.game.registry.get('player');
        //     this.stopAllScenes(); // Function to stop all scenes
        //     this.scene.start('dungeon-scene', { score: this.score.getValue(), health: player.hp });
        //     this.scene.start('ui-scene', { score: this.score.getValue(), health: player.hp });
        // };
        
        // this.dungeonHandler = (status) => {
        //     this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
        //     this.game.scene.pause('dungeon-scene');
        //     this.gameEndPhrase = new Phaser.GameObjects.Text(
        //         this,
        //         this.game.scale.width / 2,
        //         this.game.scale.height * 0.4,
        //          `TODO: Can Pick a New Effect`,
        //         {
        //             fontFamily: 'Arial',
        //             fontSize: '32px',
        //             align: 'center',
        //             color: '#ff0000'
        //         },
        //         );
        //     this.add.existing(this.gameEndPhrase);
        //     this.gameEndPhrase.setPosition(
        //         this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
        //         this.game.scale.height * 0.4,
        //     );

        //     this.input.on('pointerdown', () => {
        //         this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
        //         this.game.events.off(EVENTS_NAME.goNextLevel, this.gameEndHandler);
        //         const player = this.game.registry.get('player');
        //         // this.game.registry.set('restartData', {
        //         //     score: this.score.getValue(),
        //         //     health: player.hp
        //         // });    
        //         this.stopAllScenes();           
        //         this.scene.start('dungeon-scene', { score: this.score.getValue(), health: player.hp });
        //         this.scene.start('ui-scene', { score: this.score.getValue(), health: player.hp });
        //         // this.scene.get('dungeon-scene').scene.restart();
        //         // this.scene.restart();
        //     });
        // };

        // win ui
        this.chestLootHandler = () => {
            this.score.changeValue(ScoreOperations.INCREASE, 10);
            // if (this.score.getValue() === gameConfig.winScore) {
            //     this.game.events.emit(EVENTS_NAME.gameEnd, 'win');
            // }
        };
    }


    private applyEffect(effect: string) {
        // Logic to apply the selected effect
        console.log(`Effect applied: ${effect}`);
        // TODO: Implement effect application logic here
    }

    private continueToNextLevel(selectedOptionIndex: number) {
        this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
        this.game.events.off(EVENTS_NAME.goNextLevel, this.gameEndHandler);
        console.log('sdfasd')
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

        // this.scene.start('dungeon-scene', { 
        //     score: this.score.getValue(), 
        //     health: player.hp,
        //     selectedEffectIndex: selectedOptionIndex,
        // });
        // this.scene.start('ui-scene', { score: this.score.getValue(), health: player.hp });
    }

    create(data: any): void {
        if (data) {
            this.score = new Score(this, 20, 20, data.score);

        } else {
            this.score = new Score(this, 20, 20, 0);
        }
        this.initListeners();

        this.scene.moveAbove('dungeon-scene');
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
        this.game.events.once(EVENTS_NAME.gameEnd, this.gameEndHandler, this);
        this.game.events.once(EVENTS_NAME.goNextLevel, this.dungeonHandler, this);
    }
}