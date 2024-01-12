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
    private isAttacking;
    
    private playerWidth;
    private playerHeight;

    private debugGraphics: Phaser.GameObjects.Graphics;
    private minimapPlayer: Phaser.GameObjects.Graphics;

    private speed = 210;
    private diagonalSpeed = this.speed * 0.707;

    private isDead = false;
    
    private maxHp = 100;

    // 0 => left
    // 1 => up
    // 2 => right
    // 3 => down
    private currentDirection = 3; 

    private attackingCD = 500;
    private cooldownBar: Phaser.GameObjects.Graphics;
    private cooldownBarWidth!: number;
    private cooldownBarHeight!: number;

    constructor(scene: Phaser.Scene, x: number, y: number, initHP = null) {
        // super(scene, x, y, 'king');
        super(scene, x, y, 'girl');
        if (initHP)
            this.hp = initHP;
        else
            this.hp = this.maxHp;
        
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
        this.isAttacking = false;


        // @ts-ignore
        // attack animtaion
        this.keySpace = this.scene.input.keyboard.addKey(32);
        this.keySpace.on('down', (event: KeyboardEvent) => {
            if (this.isDead || this.isAttacking) return;
            this.anims.play('girl-attack', true);
            this.scene.game.events.emit(EVENTS_NAME.attack);
            this.isAnimating = true;

            this.attack()
        });
        // this.keySpace.on('down', (event: KeyboardEvent) => {
            
            // this.stopAnimation('girl-attack')
            // this.anims.play('girl-attack', true);
            // this.scene.game.events.emit(EVENTS_NAME.attack);

            // this.isMoving = true;
            // if (!this.isAnimating || true) {
            //     this.isAnimating = true; // playing animation
            // }
        // });

        // @ts-ignore
        // this.on('animationcomplete', (animation, frame) => {
        //     if (animation.key === 'girl-attack' || animation.key === 'girl-idle') {
        //         this.isAnimating = false; 
        //     }
        // }, this);

        // listen on death animation
        this.on('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'girl-die') {
                this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
            } else if (animation.key === 'girl-attack') {
                this.scene.time.delayedCall(this.attackingCD, () => {
                    // console.log('attack end')
                    this.isAttacking = false;
                });
            }
        }, this);

        // cooldown bars
        this.cooldownBar = scene.add.graphics();
        this.cooldownBar.fillStyle(0xff0000, 1); 
        this.cooldownBarWidth = 4;
        this.cooldownBarHeight = 20;
        this.resetCooldownBar(); 
        this.cooldownBar.setDepth(11)


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
        this.minimapPlayer.setDepth(10);
        this.scene.cameras.main.ignore(this.minimapPlayer);
    }

    update(): void {
        if (this.isDead) return;

        // cooldown bar position
        if (this.cooldownBar.visible) {
            this.cooldownBar.x = this.x + this.width / 2 + 10;
            this.cooldownBar.y = this.y - this.height / 2 - this.cooldownBarHeight / 4;
        }

        this.getBody().setVelocity(0);
        this.isMoving = false;

        // this.drawCollisionBox();

        this.drawMinimapPlayer();
        
        if (this.isDead) return;
        
        if (this.keyW?.isDown) {
            const velocity = this.keyA?.isDown || this.keyD?.isDown ? this.diagonalSpeed : this.speed;
            this.getBody().velocity.y = -velocity;

            if (this.keyA.isDown || this.keyD.isDown) {
                this.stopAnimation('walk')
                !this.anims.isPlaying && this.anims.play('walk', true);

            } else {
                this.stopAnimation('walk-up')
                !this.anims.isPlaying && this.anims.play('walk-up', true);
            }
            this.isMoving = true;
            this.currentDirection = 1;
        }
        
        if (this.keyA?.isDown) {
            const velocity = this.keyW?.isDown || this.keyS?.isDown ? this.diagonalSpeed : this.speed;
            this.getBody().velocity.x = -this.speed;

            this.checkFlip();
            // this.getBody().setOffset(48, 15);
            this.getBody().setOffset(this.playerWidth, 0);

            this.stopAnimation('walk');
            !this.anims.isPlaying && this.anims.play('walk', true);

            this.isMoving = true;
            this.currentDirection = 0;
        }

        if (this.keyS?.isDown) {
            const velocity = this.keyA?.isDown || this.keyD?.isDown ? this.diagonalSpeed : this.speed;
            this.getBody().velocity.y = velocity;
            
            this.stopAnimation('walk');
            !this.anims.isPlaying && this.anims.play('walk', true);

            this.isMoving = true;
            this.currentDirection = 3;
        }

        if (this.keyD?.isDown) {
            const velocity = this.keyW?.isDown || this.keyS?.isDown ? this.diagonalSpeed : this.speed;
            this.getBody().velocity.x = velocity;

            this.checkFlip();
            // this.getBody().setOffset(15, 15);
            this.getBody().setOffset(0, 0);
            
            this.stopAnimation('walk');
            !this.anims.isPlaying && this.anims.play('walk', true);

            this.isMoving = true;
            this.currentDirection = 2;
        }

        if (!this.isMoving && !this.isAnimating) {
            this.playIdleAnimation();
        }

        this.hpValue.setPosition(this.x, this.y - this.height * 0.4);
        this.hpValue.setOrigin(0.8, 0.5);
        this.hpValue.setDepth(10);
    }

    public attack(): void {
        if (this.isAttacking) {
            return;
        }

        this.scene.sound.play('attackSound');

        this.isAttacking = true;
        this.cooldownBar.visible = true;
        this.cooldownBar.scaleY = 1;

        this.scene.tweens.add({
            targets: this.cooldownBar,
            scaleY: 0,
            duration: this.attackingCD + 333,
            ease: 'Linear',
            onComplete: () => {
                this.cooldownBar.visible = false;
            }
        });
    }

    resetCooldownBar() {
        this.cooldownBar.clear();
        this.cooldownBar.fillStyle(0xffffff, 0.7);
        this.cooldownBar.fillRect(0, 0, this.cooldownBarWidth, this.cooldownBarHeight);
        this.cooldownBar.visible = false;
    }

    private playIdleAnimation() {
        if (this.isAnimating) {
            return; 
        }
    
        // playing idle animation
        switch (this.currentDirection) {
            case 0:
                // left
                this.stopAnimation('girl-idle-right');
                this.anims.play('girl-idle-right', true);

                break;
                
            case 1:
                // up
                if (!(this.keyD?.isDown && this.keyA?.isDown)) {
                    this.stopAnimation('girl-idle-up');
                    this.anims.play('girl-idle-up', true);
                }
                break;

            case 2:
                // right
                this.stopAnimation('girl-idle-right');
                this.anims.play('girl-idle-right', true);
                break;
                
            default:
                // down
                this.stopAnimation('girl-idle');
                this.anims.play('girl-idle', true);
                break;
        }
    }

    private stopAnimation(newAnimation: string) {
        if (this.anims.currentAnim) {
            if (this.anims.currentAnim.key != newAnimation && this.anims.currentAnim.key != 'girl-attack') {
                this.anims.stop();
            }
        }
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
        if (!this.isDead) {
            // super.getDamage(value);
            if (value)
                this.hp -= value;
            this.hpValue.setText(this.hp.toString());
            if (this.hp <= 0) {
                // play death animation
                this.stopAnimation('girl-die');
                this.scene.sound.play('loseSound');
                this.anims.play('girl-die', true);
                this.isDead = true;
            }
        }
        this.updateHPBar();
    }

    public updateHPBar() {
        this.hpValue.setText(this.hp.toString());

    }

    public gainHP(amount: number) {
        this.hp += amount;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
        this.hpValue.setText(this.hp.toString());
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
            // console.log('inroom', gridCol, gridRow);

        } else {
            // in aisle
            // console.log('in aisle', gridCol, gridRow)

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
            key: 'walk-up',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 35,
                end: 40,
            }),
            frameRate: 6,
        });

        // idle animation frame
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
            key: 'girl-idle-up',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 13,
                end: 16,
            }),
            frameRate: 6,
        });

        this.scene.anims.create({
            key: 'girl-idle-left',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 5,
                end: 8,
            }),
            frameRate: 6,
        });

        this.scene.anims.create({
            key: 'girl-idle-right',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 9,
                end: 12,
            }),
            frameRate: 6,
        });

        // die
        this.scene.anims.create({
            key: 'girl-die',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl',
                start: 41,
                end: 44,
            }),
            frameRate: 6,
        });

        // girl attack
        // duration around 333ms
        this.scene.anims.create({
            key: 'girl-attack',
            frames: this.scene.anims.generateFrameNames('a-girl', {
                prefix: 'girl-attack',
                start: 1,
                end: 2,
            }),
            frameRate: 6,
            repeat: 0
        });

        this.on('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'girl-attack') {
                this.isAnimating = false;
                this.playIdleAnimation(); // play idle animate after attack animation complete
            }
        }, this);

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
