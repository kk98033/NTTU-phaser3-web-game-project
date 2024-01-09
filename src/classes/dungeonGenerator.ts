import { Player } from "./player";

export class DungeonGenerator {
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;

    // testing 
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private wallLayer!: Phaser.Tilemaps.TilemapLayer;

    private groundLayers!: Phaser.Tilemaps.TilemapLayer;
    private wallLayers!: Phaser.Tilemaps.TilemapLayer;
    private aisleGroundLayers!: Phaser.Tilemaps.TilemapLayer;
    private aisleWallLayers!: Phaser.Tilemaps.TilemapLayer;
    
    private startRoom!: Phaser.Tilemaps.TilemapLayer;
    public startRoomWalls!: Phaser.Tilemaps.TilemapLayer;
    
    public aisleWallsVertical!: Phaser.Tilemaps.TilemapLayer;
    public aisleGroundVertical!: Phaser.Tilemaps.TilemapLayer;

    constructor(private scene: Phaser.Scene, private physics: Phaser.Physics.Arcade.ArcadePhysics) {

    }

    private mapWidth = 100;
    private mapHeight = 100;
    private tileSize = 16;

    public initMap(): void {
        this.map = this.scene.make.tilemap({ key: 'dungeonAssets', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('dungeon', 'tiles')!;

        this.groundLayers = this.map.createBlankLayer('groundLayers', this.tileset, 0, 0, this.mapWidth * 16, this.mapHeight * 16)!;
        this.wallLayers = this.map.createBlankLayer('wallLayers', this.tileset, 0, 0, this.mapWidth * 16, this.mapHeight * 16)!;

        // test
        // this.groundLayer = this.map.createLayer('battle-ground', this.tileset, 0, this.tileSize * 36)!;
        // this.wallLayer = this.map.createLayer('battle-walls-up', this.tileset, 0, this.tileSize * 36)!;
        
        this.startRoom = this.map.createLayer('ground', this.tileset, this.tileSize * 0, 0)!;
        this.startRoomWalls = this.map.createLayer('walls-down', this.tileset, this.tileSize * 0, 0)!;

        // test
        // this.aisleGroundVertical = this.map.createLayer('aisle-ground-vertical', this.tileset, this.tileSize * 0, this.tileSize * 13)!;
        // this.aisleWallsVertical = this.map.createLayer('aisle-walls-vertical', this.tileset, this.tileSize * 0, this.tileSize * 13)!;
        
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
        // this.wallLayers.setCollisionByProperty({ collides: true });
        // this.physics.add.collider(player, this.wallLayers);

        // this.showDebugWalls();
    }

    private showDebugWalls(): void {
        const debugGraphics = this.scene.add.graphics().setAlpha(0.7);
        this.startRoomWalls.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        });
    }

    public generateRandomRooms(): void {
        const rooms = this.createRandomDungeon();
        this.createRoom(rooms)
        // roomDefinitions.forEach(roomDef => {
        //     this.createRoom(roomDef.x, roomDef.y, roomDef.width, roomDef.height);
        // });
    }

    private createRoom(roomMaps: number[][][]): void {
        const roomSize = 30; // Size of each room
    
        // Iterate through each room
        for (let row = 0; row < roomMaps.length; row++) {
            for (let col = 0; col < roomMaps[row].length; col++) {
                // if (row === 0 && col === 0) continue;
                // Calculate the position of the room on the map
                let xOffset = col * roomSize;
                let yOffset = row * roomSize;
                console.log(xOffset, yOffset);
                // Check if the room has any openings
                let openings = roomMaps[row][col];
                if (openings.some(o => o === 1)) {
                    // Select the appropriate wall layer based on room openings configuration
                    let wallLayerName = this.getWallLayerName(openings);
    
                    // Draw the room
                    this.map.layers.forEach(layer => {
                        if (layer.name === wallLayerName || layer.name === 'battle-ground') {
                            let data = layer.data;
                            let width = layer.width;
                            let height = layer.height;
    
                            // Iterate over each tile and draw it
                            for (let y = 0; y < height; y++) {
                                for (let x = 0; x < width; x++) {
                                    let tile = data[y][x];
                                    if (tile.index !== -1) {
                                        // Draw walls or floor based on layer name
                                        if (layer.name === wallLayerName) {
                                            let newTile = this.wallLayers.putTileAt(tile.index, x + xOffset, y + yOffset);
                                            newTile.properties.collides = true; // Set collision property
                                        } else {
                                            this.groundLayers.putTileAt(tile.index, x + xOffset, y + yOffset);
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    private getWallLayerName(openings: number[]): string {
        // Determine the name of the wall layer based on the room's openings
        if (openings[1] === 1) return 'battle-walls-up';
        // ... logic for other cases
        return 'battle-walls-up'; // Default wall layer
    }

    private createRoomOld(xOffset: number, yOffset: number, width: number, height: number): void {
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

    private createRandomDungeon(): number[][][] {
        // Initialize the room map with default values
        let roomMaps = this.initializeRoomMap();
        // Randomly decide the number of battle rooms
        let battleRoomCount = Phaser.Math.Between(2, 3);
        // Start generating rooms using DFS from the starting point
        // this.generateRoomsDFS(0, 0, roomMaps, battleRoomCount, [0, 0, 0, 0]);
        for (let i = 0; i < 4; i++) {
            if (roomMaps[0][0][i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(0, 0, i);
                console.log(nextRow, nextCol);
                this.generateRoomsDFS(nextRow, nextCol, roomMaps, battleRoomCount, roomMaps[0][0]);
            }
        }
        // Check if there is a path from the start to the end
        if (!this.canReachEnd(0, 0, roomMaps, new Set())) {
            // If not, regenerate the map
            return this.createRandomDungeon();
        }
        console.log(roomMaps)
        return roomMaps;
    }
    
    private initializeRoomMap(): number[][][] {
        // Create a 3x3 grid of rooms, each with 4 possible openings (left, up, right, down)
        let roomMaps: number[][][] = Array(3).fill(null).map(() => Array(3).fill(null).map(() => [0, 0, 0, 0]));
        // Define openings for the start and end rooms
        roomMaps[0][0] = [0, 0, Phaser.Math.Between(0, 1), 1]; // Start
        roomMaps[2][2] = [Phaser.Math.Between(0, 1), 1, 0, 0]; // End
        return roomMaps;
    }
    
    private generateRoomsDFS(row: number, col: number, roomMaps: number[][][], remainingRooms: number, lastDirection: number[]): void {
        // Exit condition for recursion
        if (remainingRooms <= 0 || row < 0 || row >= 3 || col < 0 || col >= 3 || roomMaps[row][col].some(o => o === 1)) {
            // console.log(remainingRooms, roomMaps[row][col], row, col)
            return; // No remaining rooms or out of bounds or room already exists
        }
    
        // Randomly decide to create a room or not
        // if (Phaser.Math.Between(0, 1) === 0) {
        //     return; // Do not create a room
        // }
    
        // Create a room and ensure at least one opening connects to the previous room
        let openings = [0, 0, 0, 0];
        openings = openings.map((_, index) => (index === this.getOppositeDirectionIndex(lastDirection) ? 1 : Phaser.Math.Between(0, 1)));
    
        // Update the room map with the new room
        roomMaps[row][col] = openings;
        remainingRooms--;
        console.log(openings);
        console.log(roomMaps);
        // Recursively generate rooms for each opening
        for (let i = 0; i < 4; i++) {
            if (openings[i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(row, col, i);
                this.generateRoomsDFS(nextRow, nextCol, roomMaps, remainingRooms, openings);
            }
        }
    }
    
    private canReachEnd(row: number, col: number, roomMaps: number[][][], visited: Set<string>): boolean {
        // Check if the end is reached
        if (row === 2 && col === 2) return true; // Reached end
        // Check for out of bounds or already visited
        if (row < 0 || row >= 3 || col < 0 || col >= 3) return false; 
        if (visited.has(`${row},${col}`)) return false; 
    
        // Mark the current room as visited
        visited.add(`${row},${col}`);
        let openings = roomMaps[row][col];
    
        // Recursively check each opening
        for (let i = 0; i < 4; i++) {
            if (openings[i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(row, col, i);
                if (this.canReachEnd(nextRow, nextCol, roomMaps, visited)) return true;
            }
        }
    
        return false;
    }
    
    private getNextPosition(row: number, col: number, direction: number): [number, number] {
        // Determine the next position based on the current direction
        switch (direction) {
            case 0: return [row, col - 1];
            case 1: return [row - 1, col];
            case 2: return [row, col + 1];
            case 3: return [row + 1, col];
        }
        return [row, col];
    }
    
    private getOppositeDirectionIndex(direction: number[]): number {
        // Find the opposite direction to ensure connectivity
        if (direction[2] === 1) return 0; // Right to Left
        if (direction[3] === 1) return 1; // Down to Up
        if (direction[0] === 1) return 2; // Left to Right
        if (direction[1] === 1) return 3; // Up to Down
        return -1;
    }
    
}
