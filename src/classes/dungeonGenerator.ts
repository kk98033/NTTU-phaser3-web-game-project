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
    private aisleFrontLayers!: Phaser.Tilemaps.TilemapLayer;
    
    private startRoom!: Phaser.Tilemaps.TilemapLayer;
    public startRoomWalls!: Phaser.Tilemaps.TilemapLayer;
    
    public aisleWallsVertical!: Phaser.Tilemaps.TilemapLayer;
    public aisleGroundVertical!: Phaser.Tilemaps.TilemapLayer;

    private roomAssets!: Phaser.Tilemaps.TilemapLayer;
    private roomAssetsLayer1!: Phaser.Tilemaps.TilemapLayer;
    private roomAssetsLayer2!: Phaser.Tilemaps.TilemapLayer;
    private roomAssetsLayer3!: Phaser.Tilemaps.TilemapLayer;
    private roomAssetsLayer4!: Phaser.Tilemaps.TilemapLayer;
    private roomAssetsLayer5!: Phaser.Tilemaps.TilemapLayer;

    // obstacles
    private obstacles!: Phaser.Tilemaps.TilemapLayer;
    private physicsObstacles!: Phaser.Tilemaps.TilemapLayer;

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
        this.aisleFrontLayers = this.map.createBlankLayer('aisleFrontLayers', this.tileset, 0, 0, 150, 150)!;

        this.roomAssets = this.map.createBlankLayer('roomAssets', this.tileset, 0, 0, 150, 150)!;
        this.roomAssetsLayer1 = this.map.createBlankLayer('roomAssetsLayer1', this.tileset, 0, 0, 150, 150)!;
        this.roomAssetsLayer2 = this.map.createBlankLayer('roomAssetsLayer2', this.tileset, 0, 0, 150, 150)!;
        this.roomAssetsLayer3 = this.map.createBlankLayer('roomAssetsLayer3', this.tileset, 0, 0, 150, 150)!;
        this.roomAssetsLayer4 = this.map.createBlankLayer('roomAssetsLayer4', this.tileset, 0, 0, 150, 150)!;
        this.roomAssetsLayer5 = this.map.createBlankLayer('roomAssetsLayer5', this.tileset, 0, 0, 150, 150)!;

        // obstacles
        this.obstacles = this.map.createBlankLayer('obstacles', this.tileset, 0, 0, 150, 150)!;
        this.physicsObstacles = this.map.createBlankLayer('physicsObstacles', this.tileset, 0, 0, 150, 150)!;

        // ground: 1 or 2
        // wall: 2
        // room assets: 3
        // player, camera: 10
        // point: 2
        this.groundLayers.setDepth(1);
        this.wallLayers.setDepth(2);
        this.aisleGroundLayers.setDepth(2);
        this.aisleWallLayers.setDepth(2);
        this.aisleFrontLayers.setDepth(3);

        // asset layers
        this.roomAssets.setDepth(9);
        this.roomAssetsLayer1.setDepth(3);
        this.roomAssetsLayer2.setDepth(11);
        this.roomAssetsLayer3.setDepth(12);
        this.roomAssetsLayer4.setDepth(13);
        this.roomAssetsLayer5.setDepth(14);

        this.obstacles.setDepth(2);
        this.physicsObstacles.setDepth(3);

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
        this.generateRoomAssets();

        // initialize all points
        this.initPoints();
    }

    private generateFinalRoomAssets(): void {
        let offset = (30 + 15) * 16;
        this.drawTiles(this.roomAssets, 'end-room-layer1', true, (30 + 15) * this.endRoomY, (30 + 15 - 1) * this.endRoomX);
        this.drawTiles(this.roomAssets, 'end-room-layer2', false, (30 + 15) * this.endRoomY, (30 + 15 - 1) * this.endRoomX);
    }
    
    private generateRoomAssets(): void {
        for (let i = 0; i < this.roomStructures.length; i++) {
            for (let j = 0; j < this.roomStructures[0].length; j++) {
                let roomID = this.roomStructures[i][j];
                switch (roomID) {
                    case 2:
                        this.generateBattleRoomSturcture(i, j);
                        break;

                    case 3:
                        this.generateRoom3(i, j);
                        break;
                    case 4:
                        this.generateRoom4(i, j);
                        break;
                    case 5:
                        this.generateRoom5(i, j);
                        break;
                
                    default:
                        break;
                }
            }
            
        }
        const randomRoomId = this.getRandomInt(3, 5);
        // console.log('room: ', randomRoomId)

    }

    private generateBattleRoomSturcture(row: number, col: number) {
        let randomObstacles = this.pickRandomStructures();
        randomObstacles.forEach(obstacle => {
            if (
                obstacle === 'obstacles-1' ||
                obstacle === 'obstacles-2' ||
                obstacle === 'obstacles-3'
            ) {
                this.drawTiles(this.obstacles, obstacle, true, (30 + 15) * col, (30 + 15 - 1) * row);

            } else {
                this.drawTiles(this.physicsObstacles, obstacle, true, (30 + 15) * col, (30 + 15 - 1) * row);
                this.drawTiles(this.obstacles, `${ obstacle }-bg`, true, (30 + 15) * col, (30 + 15 - 1) * row);
            }
        });
    }

    private pickRandomStructures(): string[] {
        const structures = [
            'obstacles-1', 'obstacles-2', 'obstacles-3', 
            'physics-obstacles-1',
            'physics-obstacles-2',
            'physics-obstacles-3',
            'physics-obstacles-4',
            'physics-obstacles-5',
            'physics-obstacles-6',
            'physics-obstacles-7',
        ];

        let obstacleStructuresCount = this.getRandomInt(3, 8);

        let shuffledStructures = this.shuffle(structures);

        let randomObstacles = shuffledStructures.slice(0, obstacleStructuresCount);
        return randomObstacles;
    }

    private shuffle(array: any[]) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex > 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }

    private generateRoom3(row: number, col: number) {
        this.drawTiles(this.roomAssetsLayer1, 'room-3-layer-1', true, (30 + 15) * col, (30 + 15 - 1) * row);
        this.drawTiles(this.roomAssetsLayer2, 'room-3-layer-2', false, (30 + 15) * col, (30 + 15 - 1) * row);
        this.initRoom3Points(row, col);
    }

    private generateRoom4(row: number, col: number) {
        this.drawTiles(this.roomAssetsLayer1, 'room-4-layer-1', true, (30 + 15) * col, (30 + 15 - 1) * row);
        this.drawTiles(this.roomAssetsLayer2, 'room-4-layer-2', false, (30 + 15) * col, (30 + 15 - 1) * row);

        this.initRoom4Points(row, col);
        
    }

    private generateRoom5(row: number, col: number) {
        this.drawTiles(this.roomAssetsLayer1, 'room-5-layer-1', true, (30 + 15) * col, (30 + 15 - 1) * row);
        this.drawTiles(this.roomAssetsLayer2, 'room-5-layer-2', false, (30 + 15) * col, (30 + 15 - 1) * row);
        this.drawTiles(this.roomAssetsLayer3, 'room-5-layer-3', false, (30 + 15) * col, (30 + 15 - 1) * row);
        this.drawTiles(this.roomAssetsLayer4, 'room-5-layer-4', false, (30 + 15) * col, (30 + 15 - 1) * row);
        this.initRoom5Points(row, col);
    }
    
    private initPoints(): void {
        this.initFinalRoomPoints();
    }

    private initRoom3Points(row: number, col: number): void {
        let randomChest = this.getRandomInt(0, 1);
        let chestTypes = ['lootChest', 'fakeChest']
        const objects = this.map.filterObjects('ChestsPoint', obj => obj.name === chestTypes[randomChest]) || [];
        const NextLevelPoints = gameObjectsToObjectPoints(objects);
        NextLevelPoints.forEach(point => {
            let data = { 
                x: Math.floor(point.x) + (col) * (30 + 15) * 16, 
                y: Math.floor(point.y) + (row) * (30 + 15 - 1) * 16, 
                id: this.getTileIDByName(point.name) 
            }
            this.points.push(data);
        });
    }

    private initRoom4Points(row: number, col: number): void {
        const objects = this.map.filterObjects('LootChestPoints', obj => obj.name ==='lootChestPoint') || [];
        this.shuffle(objects);
        const NextLevelPoints = gameObjectsToObjectPoints(objects.slice(1, this.getRandomInt(2, 7)));
        NextLevelPoints.forEach(point => {
            let data = { 
                x: Math.floor(point.x) + (col) * (30 + 15) * 16, 
                y: Math.floor(point.y) + (row) * (30 + 15 - 1) * 16, 
                id: this.getTileIDByName(point.name) 
            }
            this.points.push(data);
        });
    }

    private initRoom5Points(row: number, col: number): void {
        const objects = this.map.filterObjects('NPCPoints', obj => obj.name ==='NPCPoint') || [];
        const NextLevelPoints = gameObjectsToObjectPoints(objects);
        NextLevelPoints.forEach(point => {
            let data = { 
                x: Math.floor(point.x) + (col) * (30 + 15) * 16, 
                y: Math.floor(point.y) + (row) * (30 + 15 - 1) * 16, 
                id: this.getRandomNPC() 
            }
            this.points.push(data);
        });
    }

    private getRandomNPC() {
        let npcs = ['629', '904', '466'];
        return npcs[this.getRandomInt(1,npcs.length)];
    }

    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
                y: Math.floor(point.y) + (this.endRoomX) * (30 + 15 - 3) * 16, 
                id: this.getTileIDByName(point.name) 
            }
            this.points.push(data);
        });
        // console.log(this.points);
    }

    public getTileIDByName(name: string): number {
        if (name === 'nextLevel') return 357
        if (name === 'chests') return 595
        if (name === 'endChest') return 629
        if (name === 'lootChest' || name === 'lootChestPoint') return 628
        if (name === 'fakeChest') return 661
        return -1
    }

    public getPoints() {
        return this.points;
    }

    private decideRoomStructures(): void {
        this.getRoomStructures();
        
        const length = 3;
        // console.log(this.currentRooms, Math.floor(this.currentRooms / 3))
        const numBattleRooms = this.getRandomInt(Math.floor(this.currentRooms / 3) + 1, this.currentRooms - 1);

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

        // console.log('room structure: ', numBattleRooms,this.roomStructures);
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

        // console.log(this.roomStructures)
    }
    
    public getRoomStructuresArray()  {
        return this.roomStructures;
    }

    public getRoomsID(row: number, col: number)  {
        return this.roomStructures[row][col];
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

        // obstacle layer
        this.physicsObstacles.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.physicsObstacles);

        // room assets layers
        this.roomAssetsLayer1.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.roomAssetsLayer1);
        this.roomAssetsLayer2.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.roomAssetsLayer2);
        this.roomAssetsLayer3.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.roomAssetsLayer3);
        this.roomAssetsLayer4.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.roomAssetsLayer4);
        this.roomAssetsLayer5.setCollisionByProperty({ collides: true });
        this.physics.add.collider(player, this.roomAssetsLayer5);

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
                        this.drawTiles(this.aisleFrontLayers, 'aisle-walls-vertical-front', true, xOffset + 15 * col, yOffset + 14 * row - 22);
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
