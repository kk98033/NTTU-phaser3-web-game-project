import { Game, Types } from 'phaser';

// @ts-ignore
import { Level1, LoadingScene, UIScene, Dungeon, MainMenu } from './scenes';

interface Window {
    sizeChanged: () => void;
    game: Phaser.Game;
}

type GameConfigExtended = Types.Core.GameConfig & {
    winScore: number;
};

export const gameConfig: GameConfigExtended = {
    title: 'Echoes of the Dungeon',
    type: Phaser.CANVAS,
    parent: 'game',
    backgroundColor: '#351f1b',
    winScore: 40,
    scale: {
        mode: Phaser.Scale.ScaleModes.NONE,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    render: {
        antialiasGL: false,
        pixelArt: true,
    },
    callbacks: {
        postBoot: () => {
            window.sizeChanged();
        },
    },
    canvasStyle: `display: block; width: 100%; height: 100%;`,
    autoFocus: true,
    audio: {
        disableWebAudio: false,
    },
    scene: [LoadingScene, Level1, UIScene, Dungeon, MainMenu],
};

window.sizeChanged = () => {
    if (window.game.isBooted) {
        setTimeout(() => {
            window.game.scale.resize(window.innerWidth, window.innerHeight);
            window.game.canvas.setAttribute(
                'style',
                `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
            );
        }, 100);
    }
};
window.onresize = () => window.sizeChanged();

window.game = new Game(gameConfig);