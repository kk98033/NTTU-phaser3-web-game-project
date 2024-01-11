import { Math, Scene } from 'phaser';
import { Actor } from './actor';
import { Player } from './player';
import { EVENTS_NAME } from '../consts';

export class Enemy extends Actor {
    private target: Player;
    private AGRESSOR_RADIUS = 30 * 16;
    private moveSpeed = 50;

    private playerAttackRange = 1;

    private attackHandler: () => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        target: Player,
        frame?: string | number,
    ) {
        super(scene, x, y, texture, frame);
        this.target = target;
        // ADD TO SCENE
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // PHYSICS MODEL
        this.getBody().setSize(16, 16);
        this.getBody().setOffset(0, 0);

        this.attackHandler = () => {
            // get attacked
            if (
                Phaser.Math.Distance.BetweenPoints(
                    { x: this.x, y: this.y },
                    { x: this.target.x, y: this.target.y },
                ) < this.target.width + 16 * this.playerAttackRange
            ) {
                this.getDamage();
                this.disableBody(true, false);
                this.scene.time.delayedCall(300, () => {
                    this.die();
                    this.destroy();
                });
            }
        };
        // EVENTS
        this.scene.game.events.on(EVENTS_NAME.attack, this.attackHandler, this);
        this.on('destroy', () => {
            this.scene.game.events.removeListener(EVENTS_NAME.attack, this.attackHandler);
        });
    }

    die() {
        this.emit('enemy-defeated', this);
        this.destroy();
    }
    
    preUpdate(): void {
        const distance = Phaser.Math.Distance.BetweenPoints(
            { x: this.x, y: this.y },
            { x: this.target.x, y: this.target.y }
        );

        if (distance < this.AGRESSOR_RADIUS) {
            const directionX = this.target.x - this.x;
            const directionY = this.target.y - this.y;
            const normalizedDirectionX = directionX / distance;
            const normalizedDirectionY = directionY / distance;

            this.getBody().setVelocityX(normalizedDirectionX * this.moveSpeed);
            this.getBody().setVelocityY(normalizedDirectionY * this.moveSpeed);

        } else {
            this.getBody().setVelocity(0);
        }
        // if (
        //     Phaser.Math.Distance.BetweenPoints(
        //         { x: this.x, y: this.y },
        //         { x: this.target.x, y: this.target.y },
        //     ) < this.AGRESSOR_RADIUS
        // ) {
        //     this.getBody().setVelocityX(this.target.x - this.x);
        //     this.getBody().setVelocityY(this.target.y - this.y);
        // } else {
        //     this.getBody().setVelocity(0);
        // }
    }

    public setTarget(target: Player): void {
        this.target = target;
    }
}
