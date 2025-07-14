import { Vector3 } from "@/utils/Vectors";
import {  MapSchema, Schema, type } from "@colyseus/schema";

export class NetworkedEntityState extends Schema {
  @type("string") id: string = "ID";
  //Position
  @type("number") xPos: number = 0.0;
  @type("number") yPos: number = 0.0;
  @type("number") zPos: number = 0.0;
  //Rotation
  @type("number") xRot: number = 0.0;
  @type("number") yRot: number = 0.0;
  @type("number") zRot: number = 0.0;
  @type("number") wRot: number = 0.0;
  //Scale
  @type("number") scale: number = 1;

  //Interpolation values
  @type("number") timestamp: number = 0.0;

  @type("string") username: string = "";
}

export class RoomState extends Schema {
  @type({ map: NetworkedEntityState }) networkedUsers =
    new MapSchema<NetworkedEntityState>();
  @type({ map: NetworkedEntityState }) loadedModels =
    new MapSchema<NetworkedEntityState>();
  @type({ map: NetworkedEntityState }) networkedUserGazes =
    new MapSchema<NetworkedEntityState>();
  @type("string") modelURL = "";
  @type("string") modelName = "";
  @type("number") serverTime: number = 0.0;
  
  @type("boolean") mrMode = false;
  
  @type("int32") selectedIndex = -1;
  @type("string") currrentManipulatorID = "";

  getUserPosition(sessionId: string): Vector3 {
    if (this.networkedUsers.has(sessionId)) {
      const user: NetworkedEntityState = this.networkedUsers.get(sessionId);

      return {
        x: user.xPos,
        y: user.yPos,
        z: user.zPos,
      };
    }

    return null;
  }

  setUserPosition(sessionId: string, position: Vector3) {
    if (this.networkedUsers.has(sessionId)) {
      const user: NetworkedEntityState = this.networkedUsers.get(sessionId);

      user.xPos = position.x;
      user.yPos = position.y;
      user.zPos = position.z;
    }
  }

  getUserRotation(sessionId: string): Vector3 {
    if (this.networkedUsers.has(sessionId)) {
      const user: NetworkedEntityState = this.networkedUsers.get(sessionId);

      return {
        x: user.xRot,
        y: user.yRot,
        z: user.zRot,
      };
    }

    return null;
  }
}
