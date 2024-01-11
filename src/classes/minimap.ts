import { Scene, Cameras } from 'phaser';

export class Minimap {
    scene: Phaser.Scene;
    renderTexture!: Phaser.GameObjects.RenderTexture;
    roomMaps: number[][][];
    tileSize: number;
    mapWidth: number;
    mapHeight: number;
    
    public uiCamera: Cameras.Scene2D.Camera;

    constructor(scene: Phaser.Scene, roomMaps: number[][][], tileSize: number) {
        this.scene = scene;
        this.roomMaps = roomMaps;
        this.tileSize = tileSize;
        

        // Calculate the total size of the minimap based on the roomMaps dimensions and tileSize
        this.mapWidth = roomMaps[0].length * tileSize;
        this.mapHeight = roomMaps.length * tileSize;

        // // Create the RenderTexture for the minimap
        // this.renderTexture = scene.make.renderTexture({
        //     width: this.mapWidth,
        //     height: this.mapHeight
        // }, false);


        // this.uiCamera = scene.cameras.add(0, 0, scene.cameras.main.width, scene.cameras.main.height);
        // console.log(scene.cameras.main.width, this.mapWidth, this.mapHeight)
        const uiCameraX = ((0) * 16);
        const uiCameraY = -(this.mapHeight- 28) * 16;
        this.uiCamera = this.scene.cameras.add(uiCameraX, uiCameraY, this.mapWidth * 16, this.mapHeight * 16);
        this.uiCamera.setScroll(0, 0); // 確保 UI 攝像機不會跟隨世界滾動
        this.uiCamera.setZoom(0.1);

        


        
        
        // 先不用

        // 使用 UI 攝像機來顯示 RenderTexture
        // this.renderTexture = this.scene.add.renderTexture(this.mapWidth, 0, this.mapWidth , this.mapHeight);
        // this.renderTexture.setScrollFactor(0); // 設置滾動因子為 0 以固定在畫面上
        // this.uiCamera.ignore(this.renderTexture); // 確保 RenderTexture 不受主攝像機影響

        // this.renderTexture.setPosition(xPosition, yPosition);
        // this.renderTexture.setPosition(16 * 3, 16 * this.mapHeight / (4 - scene.cameras.main.zoom));
        // this.renderTexture.setPosition((this.mapWidth) * 9, 16 * this.mapHeight / (4 - scene.cameras.main.zoom));

        // Draw the initial state of the minimap
        // this.drawMinimap();

        // Fix the minimap to the camera
        // this.renderTexture.setScrollFactor(0);

        // Add the minimap to the scene
        // scene.add.existing(this.renderTexture);
    }

    drawMinimap() {
        // Clear the previous drawing
        // this.renderTexture.clear();
        // console.log(this.roomMaps);
        // Create a Graphics object for drawing the rectangles
        const graphics = this.scene.add.graphics();
        graphics.clear();

        // Iterate through the roomMaps and draw a square for each room
        for (let row = 0; row < this.roomMaps.length; row++) {
            for (let col = 0; col < this.roomMaps[row].length; col++) {
                if (this.roomMaps[row][col].some(val => val > 0)) {
                    // If there's a value greater than 0, draw a square
                    const x = col * this.tileSize;
                    const y = row * this.tileSize;
                    graphics.fillStyle(0x666666, 1);
                    graphics.fillRect(x, y, this.tileSize, this.tileSize);
                    // graphics.fillRect(10, 10, 250, 250);
                }
            }
        }

        // Draw the Graphics object to the RenderTexture and then destroy the Graphics object
        this.renderTexture.draw(graphics);
        graphics.destroy();
    }

    // update the minimap if the roomMaps change
    updateMinimap(newRoomMaps: number[][][]) {
        this.roomMaps = newRoomMaps;
        this.drawMinimap();
    }

    updatePosition(x: number, y: number) {
        // 根据摄像机的位置更新小地图的位置
        this.renderTexture.x = x;
        this.renderTexture.y = y;
    }
}