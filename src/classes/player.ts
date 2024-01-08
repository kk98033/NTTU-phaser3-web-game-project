import { Input, Scene } from 'phaser';
import { Actor } from './actor';
import { Text } from './text';
import { EVENTS_NAME, GameStatus } from '../consts';

export class Player extends Actor {
    private keyW: Phaser.Input.Keyboard.Key;
    private keyA: Phaser.Input.Keyboard.Key;
    private keyS: Phaser.Input.Keyboard.Key;
    private keyD: Phaser.Input.Keyboard.Key;
    private keySpace: Input.Keyboard.Key;

    private hpValue: Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // super(scene, x, y, 'king');
        super(scene, x, y, 'girl');
        // KEYS
        // @ts-ignore
        this.keyW = this.scene.input.keyboard.addKey('W');
        // @ts-ignore
        this.keyA = this.scene.input.keyboard.addKey('A');
        // @ts-ignore
        this.keyS = this.scene.input.keyboard.addKey('S');
        // @ts-ignore
        this.keyD = this.scene.input.keyboard.addKey('D');

        // @ts-ignore
        this.keySpace = this.scene.input.keyboard.addKey(32);
        this.keySpace.on('down', (event: KeyboardEvent) => {
            this.anims.play('girl-attack', true);
            this.scene.game.events.emit(EVENTS_NAME.attack);
        });

        // PHYSICS
        this.getBody().setSize(16, 16);
        this.getBody().setOffset(8, 0);

        this.initAnimations();

        this.hpValue = new Text(this.scene, this.x, this.y - this.height, this.hp.toString())
            .setFontSize(12)
            .setOrigin(0.8, 0.5);
    }

    update(): void {
        this.getBody().setVelocity(0);

        let isMoving = false;
        if (this.keyW?.isDown || this.keyA?.isDown || this.keyS?.isDown || this.keyD?.isDown) {
            if (this.anims.currentAnim && this.anims.currentAnim.key === 'girl-idle') {
                this.anims.stop();
            }
        }
        if (this.keyW?.isDown) {
            this.getBody().velocity.y = -110;
            !this.anims.isPlaying && this.anims.play('walk', true);
            isMoving = true;
        }
        if (this.keyA?.isDown) {
            this.getBody().velocity.x = -110;
            this.checkFlip();
            this.getBody().setOffset(48, 15);
            !this.anims.isPlaying && this.anims.play('walk', true);
            isMoving = true;
        }
        if (this.keyS?.isDown) {
            this.getBody().velocity.y = 110;
            !this.anims.isPlaying && this.anims.play('walk', true);
            isMoving = true;
        }
        if (this.keyD?.isDown) {
            this.getBody().velocity.x = 110;
            this.checkFlip();
            this.getBody().setOffset(15, 15);
            !this.anims.isPlaying && this.anims.play('walk', true);
            isMoving = true;
        }

        if (!isMoving) {
            this.anims.play('girl-idle', true);
        }

        this.hpValue.setPosition(this.x, this.y - this.height * 0.4);
        this.hpValue.setOrigin(0.8, 0.5);
    }

    public getDamage(value?: number): void {
        super.getDamage(value);
        this.hpValue.setText(this.hp.toString());
        if (this.hp <= 0) {
            this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
        }
    }

    private initAnimations(): void {
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 29,
                end: 34,
            }),
            frameRate: 6,
        });

        this.scene.anims.create({
            key: 'girl-idle',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 1,
                end: 4,
            }),
            frameRate: 6,
        });

        this.scene.anims.create({
            key: 'girl-attack',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl-attack',
                start: 1,
                end: 2,
            }),
            frameRate: 6,
        });

        // king
        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNames('a-king', {
                prefix: 'run-',
                end: 7,
            }),
            frameRate: 8,
        });
        this.scene.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNames('a-king', {
                prefix: 'attack-',
                end: 2,
            }),
            frameRate: 8,
        });
    }
}
