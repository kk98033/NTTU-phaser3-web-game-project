import { Player } from "./player";
import { gameObjectsToObjectPoints } from '../helpers/gameobject-to-object-point';
import { EVENTS_NAME } from '../consts';

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

    private roomAssets!: Phaser.Tilemaps.TilemapLayer;

    public roomMaps!: number[][][];

    public roomStructures!: number[][];
    public currentRooms: number;

    public points: any[];

    constructor(private scene: Phaser.Scene, private physics: Phaser.Physics.Arcade.ArcadePhysics) {
        this.points = [];
        this.currentRooms = 0;
    }

    private mapWidth = 100;
    private mapHeight = 100;
    private tileSize = 16;

    private endRoomX = 2;
    private endRoomY = 2;

    public initMap(): void {
        this.drawBackground();

        this.map = this.scene.make.tilemap({ key: 'dungeonAssets', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('dungeon', 'tiles')!;

        // start room
        // this.startRoom = this.map.createLayer('ground', this.tileset, this.tileSize * 0, this.tileSize * 8)!;
        // this.startRoomWalls = this.map.createLayer('walls-down', this.tileset, this.tileSize * 0, this.tileSize * 8)!;

        // test
        // this.aisleGroundVertical = this.map.createLayer('aisle-ground-vertical', this.tileset, this.tileSize * 0, this.tileSize * 14)!;
        // this.aisleWallsVertical = this.map.createLayer('aisle-walls-vertical', this.tileset, this.tileSize * 0, this.tileSize * 14)!;

        this.groundLayers = this.map.createBlankLayer('groundLayers', this.tileset, 0, 0, 150, 150)!;
        this.wallLayers = this.map.createBlankLayer('wallLayers', this.tileset, 0, 0, 150, 150)!;
        this.aisleGroundLayers = this.map.createBlankLayer('aisleGroundLayers', this.tileset, 0, 0, 150, 150)!;
        this.aisleWallLayers = this.map.createBlankLayer('aisleWallLayers', this.tileset, 0, 0, 150, 150)!;
        this.roomAssets = this.map.createBlankLayer('roomAssets', this.tileset, 0, 0, 150, 150)!;

        // ground: 1 or 2
        // wall: 2
        // room assets: 3
        // player, camera: 10
        // point: 2
        this.groundLayers.setDepth(2);
        this.wallLayers.setDepth(2);
        this.aisleGroundLayers.setDepth(2);
        this.aisleWallLayers.setDepth(2);

        this.roomAssets.setDepth(3);

        // test
        // this.groundLayer = this.map.createLayer('battle-ground', this.tileset, 0, this.tileSize * 36)!;
        // this.wallLayer = this.map.createLayer('battle-walls-up', this.tileset, 0, this.tileSize * 36)!;
        
        // draw map outline
        // let graphics = this.scene.add.graphics();
        // graphics.lineStyle(2, 0xff0000); // red
        // graphics.strokeRect(0, 0, (this.mapWidth + 30) * 16, (this.mapHeight + 30) * 16);
    }

    public generateRandomRooms(): void {
        // main function to generate dungeon rooms

        this.roomMaps = this.createRandomDungeon();

        // create start room
        // 靠爲什麼我要把他的大小社的跟期他房間不一樣 我要瘋了 ==
        this.createStartRoom(this.roomMaps[0][0]);
        
        this.createRoom(this.roomMaps)

        // decide end room
        this.decideEndRoom();
        this.generateFinalRoomAssets();
        // console.log(this.endRoomX, this.endRoomY);

        // decide how many battle rooms in this map
        this.decideRoomStructures();

        // initialize all points
        this.initPoints();
    }

    private generateFinalRoomAssets(): void {
        // TODO: decorate final assets
        let offset = (30 + 15) * 16;
        console.log(this.endRoomX, this.endRoomY);
        this.drawTiles(this.roomAssets, 'end-room-layer1', true, (30 + 15) * this.endRoomY, (30 + 15 - 1) * this.endRoomX);
        this.drawTiles(this.roomAssets, 'end-room-layer2', false, (30 + 15) * this.endRoomY, (30 + 15 - 1) * this.endRoomX);
    }
    
    // TODO: generate more room assets 3, 4, 5
    private generateRoomAssets(): void {

    }
    
    private initPoints(): void {
        this.initFinalRoomPoints();
    }

    private initFinalRoomPoints(): void {
        // draw final room physics object points
        const objects = this.map.filterObjects('NextLevelPoint', obj => obj.name === 'nextLevel') || [];
        const NextLevelPoints = gameObjectsToObjectPoints(objects);
        NextLevelPoints.forEach(point => {
            let data = { 
                x: Math.floor(point.x) + (this.endRoomY) * (30 + 15) * 16, 
                y: Math.floor(point.y) + (this.endRoomX) * (30 + 15 - 1) * 16, 
                id: this.getTileIDByName(point.name) 
            }
            this.points.push(data);
        });

        const chestObjects = this.map.filterObjects('ChestsPoint', obj => obj.name === 'endChest') || [];
        const chestPoints = gameObjectsToObjectPoints(chestObjects);
        chestPoints.forEach(point => {
            let data = { 
                x: Math.floor(point.x) + (this.endRoomY) * (30 + 15) * 16, 
                y: Math.floor(point.y) + (this.endRoomX) * (30 + 15 - 1) * 16, 
                id: this.getTileIDByName(point.name) 
            }
            this.points.push(data);
        });
        // console.log(this.points);
    }

    public getTileIDByName(name: string): number {
        if (name === 'nextLevel') return 357
        if (name === 'chests') return 595
        if (name === 'endChest') return 595
        return -1
    }

    public getPoints() {
        return this.points;
    }

    private decideRoomStructures(): void {
        this.getRoomStructures();
        
        const length = 3;
        const numBattleRooms = this.getRandomInt(2, this.currentRooms - 1);

        let availableRooms = [];
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                // skip start, end rooms
                if ((i === 0 && j === 0) || (i === this.endRoomX && j === this.endRoomY)) {
                    continue;
                }

                if (this.roomStructures[i][j] === 1) {
                    availableRooms.push([i, j]);
                }
            }
        }

        for (let i = 0; i < numBattleRooms && availableRooms.length; i++) {
            let roomIndex = this.getRandomInt(0, availableRooms.length - 1);
            let [x, y] = availableRooms[roomIndex];
            this.roomStructures[x][y] = 2;
            availableRooms.splice(roomIndex, 1);
        }

        availableRooms.forEach(([x, y]) => {
            this.roomStructures[x][y] = this.getRandomInt(3, 5); 
        });

        this.roomStructures[0][0] = -1; // start room
        this.roomStructures[this.endRoomX][this.endRoomY] = -2; // end room

        console.log('sdfasdfas', numBattleRooms,this.roomStructures);
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getRoomStructures() {
        this.roomStructures = Array(3).fill(null).map(() => Array(3).fill(0));
        this.currentRooms = 0;

        // get available room positions
        for (let i = 0; i < this.roomMaps.length; i++) {
            for (let j = 0; j < this.roomMaps[i].length; j++) {
                if (!this.roomMaps[i][j].every(val => val === 0)) {
                    this.currentRooms += 1;
                    this.roomStructures[i][j] = 1;
                }
            }
        }
        this.currentRooms -= 2; // exclude start, end rooms

        console.log(this.roomStructures)
    }

    private decideEndRoom(): void{
        let possilblePositions = [
            [2,0], [2,1], [2,2], [0,2], [1,2],
        ];
        let canBeEndRoom: number[][] = [];
        possilblePositions.forEach(position => {
            let row = position[0];
            let col = position[1];
            let openingsCount = this.roomMaps[row][col].filter(x => x === 1).length;
            if (openingsCount == 1) {
                canBeEndRoom.push([row, col]);
            }
        });
        
        // default end room
        if (canBeEndRoom.length === 0) {
            this.endRoomX = 2;
            this.endRoomY = 2;
            return;
        }

        // pick a room
        let randomIndex = Math.floor(Math.random() * canBeEndRoom.length);
        this.endRoomX = canBeEndRoom[randomIndex][0];
        this.endRoomY = canBeEndRoom[randomIndex][1];
        return;
    }

    public createStartRoom(opening: number[]): void {
        if (opening[2] === 1 && opening[3] === 1) {
            this.startRoom = this.map.createLayer('ground-2-3', this.tileset, this.tileSize * 0, this.tileSize * 8)!;
            this.startRoomWalls = this.map.createLayer('walls-2-3', this.tileset, this.tileSize * 0, this.tileSize * 8)!;

        } else if (opening[2] === 1) {
            this.startRoom = this.map.createLayer('ground-2-3', this.tileset, this.tileSize * 0, this.tileSize * 8)!;
            this.startRoomWalls = this.map.createLayer('walls-2', this.tileset, this.tileSize * 0, this.tileSize * 8)!;
            
        } else if (opening[3] === 1) {
            this.startRoom = this.map.createLayer('ground-3', this.tileset, this.tileSize * 0, this.tileSize * 8)!;
            this.startRoomWalls = this.map.createLayer('walls-3', this.tileset, this.tileSize * 0, this.tileSize * 8)!;
        }
        this.startRoom.setDepth(0);
        this.startRoomWalls.setDepth(0);
    }

    public drawBackground(): void {
        // draw background
        let graphics = this.scene.add.graphics();

        // TODO: make a beautiful backgorund
        // red outline
        graphics.lineStyle(30, 0xff0000); 
        graphics.strokeRect(1, 1, (this.mapWidth + 30) * 16, (this.mapWidth + 30) * 16);

        // draw background
        graphics.fillStyle(0x666666, 0.5);
        graphics.fillRect(0, 0, (this.mapWidth + 30) * 16, (this.mapWidth + 30) * 16);
        
        // finx on camera
        graphics.setScrollFactor(0);

        // ignore minimap on main camer
        this.scene.cameras.main.ignore(graphics);
    }

    public setColisions(player: Player) {
        this.scene.physics.world.setBounds(0, 0, (this.mapWidth + 30) * 16, (this.mapHeight + 30) * 16); // set game bounds

        // start room layer
        this.startRoomWalls.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.startRoomWalls);

        // wall layer
        this.wallLayers.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.wallLayers);
        
        // aisle layer
        this.aisleWallLayers.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.aisleWallLayers);
        
        // room assets layer
        this.roomAssets.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.roomAssets);

        // this.showDebugWalls();
    }

    private showDebugWalls(): void {
        const debugGraphics = this.scene.add.graphics().setAlpha(0.7);
        this.startRoomWalls.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        });
    }

    public getRoomMaps(): number[][][] {
        return this.roomMaps;
    }

    private createRoom(roomMaps: number[][][]): void {
        const roomSize = 30; // Size of each room
    
        // Iterate through each room
        for (let row = 0; row < roomMaps.length; row++) {
            for (let col = 0; col < roomMaps[row].length; col++) {
                if (row === 0 && col === 0 && roomMaps[row][col][2] == 1) {
                    // draw horizontal aisles for start room
                    let openings = roomMaps[row][col];
                    if (openings[2] === 1) {
                        this.drawTiles(this.aisleGroundLayers, 'aisle-ground-horizontal', false, 0 + 15 * col + 23, 0 + 14 * row );
                        this.drawTiles(this.aisleWallLayers, 'aisle-walls-horizontal', true, 0 + 15 * col + 23, 0 + 14 * row);
                    }
                    continue;
                } // skip start room
                if (row === 0 && col === 0) continue;

                // Calculate the position of the room on the map
                let xOffset = col * roomSize;
                let yOffset = row * roomSize;

                // Check if the room has any openings
                let openings = roomMaps[row][col];
                if (openings.some(o => o === 1)) {
                    // Select the appropriate wall layer based on room openings configuration
                    let wallLayerNames = this.getWallLayerNames(openings);
                
                    wallLayerNames.forEach(wallLayerName => {
                        // Draw rooms
                        this.drawTiles(this.wallLayers, wallLayerName, true, xOffset + 15 * col, yOffset + 14 * row);  
                    });

                    // draw grounds
                    this.drawTiles(this.groundLayers, 'battle-ground', false, xOffset + 15 * col, yOffset + 14 * row);

                    // draw vertical aisles
                    if (openings[1] === 1) {
                        this.drawTiles(this.aisleGroundLayers, 'aisle-ground-vertical', false, xOffset + 15 * col, yOffset + 14 * row - 22);
                        this.drawTiles(this.aisleWallLayers, 'aisle-walls-vertical', true, xOffset + 15 * col, yOffset + 14 * row - 22);
                    }
                    
                    // draw horizontal aisles
                    if (openings[2] === 1) {
                        this.drawTiles(this.aisleGroundLayers, 'aisle-ground-horizontal', false, xOffset + 15 * col + 23, yOffset + 14 * row );
                        this.drawTiles(this.aisleWallLayers, 'aisle-walls-horizontal', true, xOffset + 15 * col + 23, yOffset + 14 * row);
                    }
                }
            }
        }
    }

    private drawTiles(layerType: Phaser.Tilemaps.TilemapLayer, layerName: string, collides: boolean, xOffset = 0, yOffset = 0): void {
        this.map.layers.forEach(layer => {
            if (layer.name === layerName || layer.name === 'battle-ground') {
                let data = layer.data;
                let width = layer.width;
                let height = layer.height;

                // Iterate over each tile and draw it
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let tile = data[y][x];
                        if (tile.index !== -1) {
                            // Draw walls or floor based on layer name
                            if (layer.name === layerName) {
                                let newTile = layerType.putTileAt(tile.index, x + xOffset, y + yOffset);
                                if (collides) newTile.properties.collides = true; // Set collision property
                            } else {
                                
                            }
                        }
                    }
                }
            }
        });
        this.map.setCollisionByProperty({ collides: true });
    }

    private getWallLayerNames(openings: number[]): string[] {
        // Array to store the names of wall layers for each direction
        let wallLayerNames: string[] = [];
    
        // Define the layer names for each direction based on whether there is an opening
        wallLayerNames.push(openings[0] === 1 ? 'battle-walls-opened-left' : 'battle-walls-closed-left');
        wallLayerNames.push(openings[1] === 1 ? 'battle-walls-opened-up' : 'battle-walls-closed-up');
        wallLayerNames.push(openings[2] === 1 ? 'battle-walls-opened-right' : 'battle-walls-closed-right');
        wallLayerNames.push(openings[3] === 1 ? 'battle-walls-opened-down' : 'battle-walls-closed-down');
    
        return wallLayerNames;
    }

    private createRoomOld(xOffset: number, yOffset: number, width: number, height: number): void {
        this.map.layers.forEach(layer => {
            if (layer.name === 'battle-walls-up' || layer.name === 'battle-ground') {
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

        // Start generating rooms using DFS from the starting point
        // from start room
        for (let i = 0; i < 4; i++) {
            if (roomMaps[0][0][i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(0, 0, i);
                // console.log(nextRow, nextCol);
                this.generateRoomsDFS(nextRow, nextCol, roomMaps, i);
            }
        }
        // from end room
        for (let i = 0; i < 4; i++) {
            if (roomMaps[2][2][i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(2, 2, i);
                // console.log(nextRow, nextCol);
                this.generateRoomsDFS(nextRow, nextCol, roomMaps, i);
            }
        }

        // Check if there is a path from the start to the end
        if (!this.canReachEnd(0, 0, roomMaps, new Set())) {
            // If not, regenerate the map
            return this.createRandomDungeon();
        }

        return roomMaps;
    }
    
    private initializeRoomMap(): number[][][] {
        // Create a 3x3 grid of rooms, each with 4 possible openings (left, up, right, down)
        let roomMaps: number[][][] = Array(3).fill(null).map(() => Array(3).fill(null).map(() => [0, 0, 0, 0]));

        // Define openings for the start and end rooms
        roomMaps[0][0] = [0, 0, Phaser.Math.Between(0, 1), 1]; // Start
        roomMaps[2][2] = [0, 0, 0, 0]; // End
        roomMaps[2][2][Phaser.Math.Between(0, 1)] = 1 // chooose one opening for the end

        return roomMaps;
    }
    
    private generateRoomsDFS(row: number, col: number, roomMaps: number[][][], lastDirection: number): void {
        // Exit condition for recursion
        if (row < 0 || row >= 3 || col < 0 || col >= 3 || roomMaps[row][col].some(o => o === 1)) {
            return; // No remaining rooms or out of bounds or room already exists
        }
    
        // Create a room and ensure at least one opening connects to the previous room
        let openings = [0, 0, 0, 0];
        openings = openings.map((_, index) => (index === this.getOppositeDirectionIndex(lastDirection) ? 1 : Phaser.Math.Between(0, 1)));
    
        // Open for surrounding rooms if they have openings
        for (let i = 0; i < 4; i++) {
            if (openings[i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(row, col, i);
                if (nextRow >= 0 && nextRow < 3 && nextCol >= 0 && nextCol < 3) {
                    let oppositeDirection = this.getOppositeDirectionIndex(i);
                    roomMaps[nextRow][nextCol][oppositeDirection] = 1;
                }
            }
        }

        // cloe opening if on edge
        if (row === 0) openings[1] = 0;
        if (row === 2) openings[3] = 0;
        if (col === 0) openings[0] = 0;
        if (col === 2) openings[2] = 0;

        // Update the room map with the new room
        roomMaps[row][col] = openings;

        // Recursively generate rooms for each opening
        for (let i = 0; i < 4; i++) {
            if (openings[i] === 1) {
                let [nextRow, nextCol] = this.getNextPosition(row, col, i);
                this.generateRoomsDFS(nextRow, nextCol, roomMaps, i);
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
    
    private getOppositeDirectionIndex(direction: number): number {
        // Find the opposite direction to ensure connectivity
        if (direction === 0) return 2; // Right to Left
        if (direction === 1) return 3; // Down to Up
        if (direction === 2) return 0; // Left to Right
        if (direction === 3) return 1; // Up to Down
        return -1;
    }
}
