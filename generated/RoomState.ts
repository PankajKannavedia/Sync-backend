// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.42
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { NetworkedEntityState } from './NetworkedEntityState'

export class RoomState extends Schema {
    @type({ map: NetworkedEntityState }) public networkedUsers: MapSchema<NetworkedEntityState> = new MapSchema<NetworkedEntityState>();
    @type({ map: NetworkedEntityState }) public loadedModels: MapSchema<NetworkedEntityState> = new MapSchema<NetworkedEntityState>();
    @type({ map: NetworkedEntityState }) public networkedUserGazes: MapSchema<NetworkedEntityState> = new MapSchema<NetworkedEntityState>();
    @type("string") public modelURL!: string;
    @type("string") public modelName!: string;
    @type("number") public serverTime!: number;
    @type("boolean") public mrMode!: boolean;
    @type("int32") public selectedIndex!: number;
    @type("string") public currrentManipulatorID!: string;
}
