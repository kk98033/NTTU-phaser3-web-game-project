import { Player } from "./player";

export class DungeonGenerator {
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;

    // testing 
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private wallLayer!: Phaser.Tilemaps.TilemapLayer;

    private groundLayers!: Phaser.Tilemaps.TilemapLayer;
    private wallLayers!: Phaser.Tilemaps.TilemapLayer;

    private startRoom!: Phaser.Tilemaps.TilemapLayer;
    public startRoomWalls!: Phaser.Tilemaps.TilemapLayer;

    constructor(private scene: Phaser.Scene, private physics: Phaser.Physics.Arcade.ArcadePhysics) {

    }

    private mapWidth = 100;
    private mapHeight = 100;

    public initMap(): void {
        this.map = this.scene.make.tilemap({ key: 'dungeonAssets', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('dungeon', 'tiles')!;

        this.groundLayers = this.map.createBlankLayer('groundLayers', this.tileset, 0, 0, this.mapWidth * 16, this.mapHeight * 16)!;
        this.wallLayers = this.map.createBlankLayer('wallLayers', this.tileset, 0, 0, this.mapWidth * 16, this.mapHeight * 16)!;

        // test
        // this.groundLayer = this.map.createLayer('battle-ground', this.tileset, 0, 0)!;
        // this.wallLayer = this.map.createLayer('battle-walls-up', this.tileset, 0, 0)!;
        
        this.startRoom = this.map.createLayer('ground', this.tileset, 0, 0)!;
        this.startRoomWalls = this.map.createLayer('walls-down', this.tileset, 0, 0)!;
        
        // draw map outline
        let graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xff0000); // red
        graphics.strokeRect(0, 0, this.mapWidth * 16, this.mapHeight * 16);
    }

    public setColisions(player: Player) {
        this.scene.physics.world.setBounds(0, 0, this.mapWidth * 16, this.mapHeight * 16); // set game bounds

        // start room
        this.startRoomWalls.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.startRoomWalls);

        // wall layers
        this.wallLayers.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.wallLayers);

        this.showDebugWalls();
    }

    private showDebugWalls(): void {
        const debugGraphics = this.scene.add.graphics().setAlpha(0.7);
        this.startRoomWalls.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        });
    }

    public generateRandomRooms(): void {
        const roomCount = Phaser.Math.Between(1, 3); // random pick 1~3 battle rooms
        const roomDefinitions = this.getRandomRoomDefinitions(roomCount);

        roomDefinitions.forEach(roomDef => {
            this.createRoom(roomDef.x, roomDef.y, roomDef.width, roomDef.height);
        });
    }

    private createRoom(xOffset: number, yOffset: number, width: number, height: number): void {
        this.map.layers.forEach(layer => {
            if (layer.name === 'battle-walls-up' || layer.name === 'battle-ground') {
                console.log('add')
                let data = layer.data; // get tile data
                let width = layer.width;
                let height = layer.height;
        
                // iterate every tiles of 'battle-walls-up'
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let tile = data[y][x];
                        if (tile.index !== -1) {
                            // draw tiles
                            if (layer.name === 'battle-walls-up') {
                                let newTile = this.wallLayers.putTileAt(tile.index, x + xOffset, y + yOffset);
                                newTile.properties.collides = true;
                            } else {
                                this.groundLayers.putTileAt(tile.index, x + xOffset, y + yOffset);
                            }
                        }
                    }
                }
            }
        });

        this.map.setCollisionByProperty({ collides: true });
    }

    private getRandomRoomDefinitions(count: number): { id: number, x: number, y: number, width: number, height: number }[] {
        const rooms = [];
        for (let i = 0; i < count; i++) {
            const width = 20;
            const height = 20;
            let x: number, y: number, overlap;

            do {
                overlap = false;
                x = Phaser.Math.Between(0, this.mapWidth - width); 
                y = Phaser.Math.Between(0, this.mapHeight - height);

                overlap = rooms.some(room => {
                    return (
                        x < room.x + room.width &&
                        x + width > room.x &&
                        y < room.y + room.height &&
                        height + y > room.y
                    );
                });
            } while (overlap);

            rooms.push({ id: i, x, y, width, height });
        }

        return rooms;
    }
}
