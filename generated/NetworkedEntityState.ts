// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.42
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';


export class NetworkedEntityState extends Schema {
    @type("string") public id!: string;
    @type("number") public xPos!: number;
    @type("number") public yPos!: number;
    @type("number") public zPos!: number;
    @type("number") public xRot!: number;
    @type("number") public yRot!: number;
    @type("number") public zRot!: number;
    @type("number") public wRot!: number;
    @type("number") public scale!: number;
    @type("number") public timestamp!: number;
    @type("string") public username!: string;
}
