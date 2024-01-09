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

    private isMoving;
    private isAnimating;
    
    private playerWidth;
    private playerHeight;

    private debugGraphics: Phaser.GameObjects.Graphics;
    private minimapPlayer: Phaser.GameObjects.Graphics;

    private speed = 210;

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

        this.isMoving = false
        this.isAnimating = false;

        // @ts-ignore
        this.keySpace = this.scene.input.keyboard.addKey(32);
        this.keySpace.on('down', (event: KeyboardEvent) => {
            // TODO: have some bugs
            if (!this.isAnimating || true) {
                this.anims.play('girl-attack', true);
                this.scene.game.events.emit(EVENTS_NAME.attack);
                this.isMoving = true;
                this.isAnimating = true; // playing animation
            }
        });
        // @ts-ignore
        this.on('animationcomplete', (animation, frame) => {
            if (animation.key === 'girl-attack' || animation.key === 'girl-idle') {
                this.isAnimating = false; 
            }
        }, this);

        // PHYSICS
        // girl
        this.playerWidth = 24;
        this.playerHeight = 24;
        this.getBody().setSize(this.playerWidth, this.playerHeight);
        // this.getBody().setOffset(8, 0);

        this.initAnimations();

        this.hpValue = new Text(this.scene, this.x, this.y - this.height, this.hp.toString())
            .setFontSize(12)
            .setOrigin(0.8, 0.5);

        // debug hitbox
        this.debugGraphics = this.scene.add.graphics();

        // player on minimap
        this.minimapPlayer = this.scene.add.graphics();
        this.scene.cameras.main.ignore(this.minimapPlayer);
    }

    update(): void {
        this.getBody().setVelocity(0);
        this.isMoving = false;

        // this.drawCollisionBox();

        this.drawMinimapPlayer();
        
        if (this.keyW?.isDown || this.keyA?.isDown || this.keyS?.isDown || this.keyD?.isDown) {
            if (this.anims.currentAnim && this.anims.currentAnim.key === 'girl-idle') {
                this.anims.stop();
            }
        }
        
        if (this.keyW?.isDown) {
            this.getBody().velocity.y = -this.speed;
            !this.anims.isPlaying && this.anims.play('walk', true);
            this.isMoving = true;
        }
        
        if (this.keyA?.isDown) {
            this.getBody().velocity.x = -this.speed;
            this.checkFlip();
            // this.getBody().setOffset(48, 15);
            this.getBody().setOffset(this.playerWidth, 0);
            !this.anims.isPlaying && this.anims.play('walk', true);
            this.isMoving = true;
        }
        if (this.keyS?.isDown) {
            this.getBody().velocity.y = this.speed;
            !this.anims.isPlaying && this.anims.play('walk', true);
            this.isMoving = true;
        }
        if (this.keyD?.isDown) {
            this.getBody().velocity.x = this.speed;
            this.checkFlip();
            // this.getBody().setOffset(15, 15);
            this.getBody().setOffset(0, 0);
            !this.anims.isPlaying && this.anims.play('walk', true);
            this.isMoving = true;
        }
        
        if (!this.isMoving) {
            this.anims.play('girl-idle', true);
        }

        this.hpValue.setPosition(this.x, this.y - this.height * 0.4);
        this.hpValue.setOrigin(0.8, 0.5);
    }

    private drawCollisionBox(): void {
        this.debugGraphics.clear();
        const body = this.getBody();

        this.debugGraphics.lineStyle(1, 0x00ff00); // yellow
        this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
    }

    private drawMinimapPlayer() {
        this.minimapPlayer.clear();
        const body = this.getBody();

        this.minimapPlayer.fillStyle(0x51ff00, 1); // green
        this.minimapPlayer.fillRect(body.x, body.y, body.width * 2, body.height * 2);
    }

    public getDamage(value?: number): void {
        super.getDamage(value);
        this.hpValue.setText(this.hp.toString());
        if (this.hp <= 0) {
            this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
        }
    }

    public getPlayerPosition(playerX: number, playerY: number): [boolean, number, number] {
        const roomSize = 30;
        const corridorSize = 15;
        const totalSize = roomSize + corridorSize;

        let gridCol = Math.floor(playerX / (16 * totalSize));
        let gridRow = Math.floor(playerY / (16 * totalSize));

        // check if player is in room
        let inRoomCol = playerX % (16 * totalSize) < (16 * roomSize);
        let inRoomRow = playerY % (16 * totalSize) < (16 * roomSize);
        let isInRoom = inRoomCol && inRoomRow;

        if (inRoomCol && inRoomRow) {
            // in room
            console.log('inroom', gridCol, gridRow);

        } else {
            // in aisle
            console.log('in aisle', gridCol, gridRow)

        }
        
        return [isInRoom, gridRow, gridCol];
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
