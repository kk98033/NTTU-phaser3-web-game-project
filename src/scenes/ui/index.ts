import { Scene } from 'phaser';
import { Score, ScoreOperations } from '../../classes/score';
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
            this.game.scene.pause('level-1-scene');
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
                this.scene.get('level-1-scene').scene.restart();
                this.scene.restart();
            });

        };

        // next level ui
        // TODO: alow to enter next level
        this.dungeonHandler = (status) => {
            this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
            this.game.scene.pause('dungeon-scene');
            this.gameEndPhrase = new Phaser.GameObjects.Text(
                this,
                this.game.scale.width / 2,
                this.game.scale.height * 0.4,
                 `TODO: Can Pick a New Effect`,
                {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    align: 'center',
                    color: '#ff0000'
                },
                );
            this.add.existing(this.gameEndPhrase);
            this.gameEndPhrase.setPosition(
                this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
                this.game.scale.height * 0.4,
            );

            this.input.on('pointerdown', () => {
                this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
                this.game.events.off(EVENTS_NAME.goNextLevel, this.gameEndHandler);
                this.scene.get('dungeon-scene').scene.restart();
                this.scene.restart();
            });
        };

        // win ui
        this.chestLootHandler = () => {
            this.score.changeValue(ScoreOperations.INCREASE, 10);
            if (this.score.getValue() === gameConfig.winScore) {
                this.game.events.emit(EVENTS_NAME.gameEnd, 'win');
            }
        };
    }

    create(): void {
        this.score = new Score(this, 20, 20, 0);
        this.initListeners();

        this.scene.moveAbove('dungeon-scene');
    }

    private initListeners(): void {
        this.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler, this);
        this.game.events.once(EVENTS_NAME.gameEnd, this.gameEndHandler, this);
        this.game.events.once(EVENTS_NAME.goNextLevel, this.dungeonHandler, this);
    }
}