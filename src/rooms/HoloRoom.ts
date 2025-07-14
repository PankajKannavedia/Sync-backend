import { Room, Client } from "colyseus";
import { NetworkedEntityState, RoomState } from "./schema/RoomState";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

export class HoloRoom extends Room<RoomState> {
  onCreate(options: any) {
    if (options["roomId"] != null) {
      this.roomId = options["roomId"];
    }

    this.maxClients = 10;
    this.setState(new RoomState());
    logger.info(`---------------Room Created-${this.roomId}---------------`);

    this.registerForMessage();

    this.setPatchRate(50);
  }

  async onAuth(client: Client) {
    return {
      username: `User${this.clients.length}`,
      activeSessionId: client.sessionId,
    };
  }

  async onJoin(client: Client, options: any, auth: any) {
    // Create a new instance of NetworkedEntityState for this client and assign initial state values
    const newNetworkedUser = new NetworkedEntityState().assign({
      id: client.id,
      timestamp: this.state.serverTime,
      username: auth.username,
    });

    if (auth.position != null) {
      newNetworkedUser.assign({
        xPos: auth.position.x,
        yPos: auth.position.y,
        zPos: auth.position.z,
      });
    }

    if (auth.rotation != null) {
      newNetworkedUser.assign({
        xRot: auth.rotation.x,
        yRot: auth.rotation.y,
        zRot: auth.rotation.z,
      });
    }

    this.state.networkedUsers.set(client.id, newNetworkedUser);
  }

  async onLeave(client: Client, consented: boolean) {
    if (consented) {
      this.state.networkedUsers.delete(client.id);
      // this.state.networkedUserGazes.delete(client.id);
    }
  }

  //#region Custom Logic
  /**
   * This will register the message communication for every client as soon as the room is created
   * These handlers will work for every client that joins the room
   */
  registerForMessage() {
    this.onMessage("modelSelected", (client, selectedModelData) => {
      if (this.state.modelName == selectedModelData.subjectName) return;
      if (["Snecma M53", "Mirage 2000 (AR)"].includes(this.state.modelName)) {
        this.broadcast("modelInteraction", {
          type: "material",
          xrayState: false,
        });
        if (this.state.modelName == "Snecma M53")
          this.broadcast("modelInteraction", {
            type: "gameobject",
            naem: "",
          });
      }
      this.state.modelURL = selectedModelData.subject3DUrl;
      this.state.selectedIndex = selectedModelData.index;
      this.state.modelName = selectedModelData.subjectName;
      let loadedModel;
      if (!this.state.loadedModels.get(this.state.selectedIndex.toString())) {
        loadedModel = new NetworkedEntityState();
        loadedModel.id = randomUUID();
        this.state.loadedModels.set(
          selectedModelData.index.toString(),
          loadedModel
        );
      } else {
        loadedModel = this.state.loadedModels.get(
          this.state.selectedIndex.toString()
        );
      }
      this.broadcast(
        "streamModel",
        {
          url: this.state.modelURL,
          id: loadedModel.id,
          index: selectedModelData.index,
          modelName: selectedModelData.subjectName,
        },
        { except: client }
      );
    });

    /**
     * modelInteractionObject = {
     *      type: 'material'/'gameobject'/'scale',
     *      name: string,  (for engine if type == gameobject)
     *      xrayState: boolean (for engine or body if type == material)
     *      scale: value to set scale (if type == scale)
     *      index: number
     * }
     */
    this.onMessage("modelInteraction", (client, modelInteractionObject) => {
      this.broadcast("modelInteraction", modelInteractionObject);
    });

    this.onMessage("entityUpdate", (client, entityUpdateArray) => {
      if (this.state.networkedUsers.has(`${entityUpdateArray[0]}`) === false)
        return;
      this.onEntityUpdate(client.id, entityUpdateArray);
    });

    this.onMessage("entityModelUpdate", (client, entityModelUpdataArray) => {
      if (
        this.state.loadedModels.get(entityModelUpdataArray[1].toString()).id !=
        entityModelUpdataArray[0]
      )
        return;
      this.onEntityModelUpdate(client.id, entityModelUpdataArray);
    });

    this.onMessage("entityGazeUpdate", (client, entityGazeData) => {
      if (this.state.networkedUserGazes.has(client.id) == false) return;
      this.onEntityGazeUpdate(client.id, entityGazeData);
    });
    this.onMessage(
      "currrentManipulator",
      (client, currrentManipulatorID: string) => {
        this.state.currrentManipulatorID = currrentManipulatorID;
      }
    );

    this.onMessage("shareGaze", (client, gazeData) => {
      if (this.state.networkedUserGazes.has(gazeData.userId) === true) return;
      const newNetworkedGaze = new NetworkedEntityState().assign({
        id: gazeData.userId,
        timestamp: this.state.serverTime,
      });

      this.state.networkedUserGazes.set(gazeData.userId, newNetworkedGaze);
    });
  }

  /**
   * Callback for the "entityUpdate" message from the client to update an entity
   * @param {*} clientID The sessionId of the client we want to update
   * @param {*} data The data containing the data we want to update the newtworkedUser with
   */
  onEntityUpdate(clientID: string, data: any) {
    // Assumes that index 0 is going to be the sessionId of the user
    if (this.state.networkedUsers.has(`${data[0]}`) === false) {
      logger.info(
        `Attempted to update client with id ${data[0]} but room state has no record of it`
      );
      return;
    }

    const stateToUpdate = this.state.networkedUsers.get(data[0]);

    const startIndex = 1;

    for (let i = startIndex; i < data.length; i += 2) {
      const property = data[i];
      let updateValue = data[i + 1];
      if (updateValue === "inc") {
        updateValue = data[i + 2];
        i++; // inc i once more since we had a inc;
      }

      (stateToUpdate as any)[property] = updateValue;
    }

    stateToUpdate.timestamp = parseFloat(this.state.serverTime.toString());
  }

  /**
   * Callback for the "entityModelUpdate" message from the client to update model
   * @param {*} clientID The sessionId of the client we want to update
   * @param {*} data The data containing the data we want to update the loadedModels with
   */
  onEntityModelUpdate(clientID: string, data: any) {
    // Assumes that index 0 is going to be the sessionId of the user
    if (this.state.loadedModels.get(data[1].toString()).id != data[0]) {
      logger.info(
        `Attempted to update model with id ${data[0]} but room state has no record of it`
      );
      return;
    }

    const stateToUpdate = this.state.loadedModels.get(data[1].toString());

    const startIndex = 2;

    for (let i = startIndex; i < data.length; i += 2) {
      const property = data[i];
      let updateValue = data[i + 1];
      if (updateValue === "inc") {
        updateValue = data[i + 2];
        i++; // inc i once more since we had a inc;
      }

      (stateToUpdate as any)[property] = updateValue;
    }

    stateToUpdate.timestamp = parseFloat(this.state.serverTime.toString());
  }

  /**
   * Callback for the "entityGazeUpdate" message from the client to update shared gaze
   * @param {*} clientID The sessionId of the client we want to update
   * @param {*} data The data containing the data we want to update the newtworkedUserGaze with
   */
  onEntityGazeUpdate(clientID: string, data: any) {
    // Assumes that index 0 is going to be the sessionId of the user
    if (this.state.networkedUserGazes.get(clientID).id != data[0]) {
      logger.info(
        `Attempted to update gaze with id ${data[0]} but room state has no record of it`
      );
      return;
    }

    const stateToUpdate = this.state.networkedUserGazes.get(clientID);

    const startIndex = 2;

    for (let i = startIndex; i < data.length; i += 2) {
      const property = data[i];
      let updateValue = data[i + 1];
      if (updateValue === "inc") {
        updateValue = data[i + 2];
        i++; // inc i once more since we had a inc;
      }

      (stateToUpdate as any)[property] = updateValue;
    }

    stateToUpdate.timestamp = parseFloat(this.state.serverTime.toString());
  }
  //#endregion
}
