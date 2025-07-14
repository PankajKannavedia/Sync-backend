import { Router } from "express";
import { Routes } from "../interfaces/routes.interface";

class BaseRoute implements Routes {
  public path;
  public controller;
  public router = Router();

  constructor(controller?: any, path?: string) {
    if (controller) {
      this.controller = controller;
    }
    if (path) {
      this.path = path;
    }
  }

  protected setController(controller: any) {
    this.controller = controller;
    return this;
  }

  protected getController() {
    return this.controller;
  }

  initializeRoutes() {
    this.router.get(`${this.path}`, this.controller.getAll);
    this.router.get(`${this.path}/:id`, this.controller.getById);
    this.router.post(`${this.path}`, this.controller.create);
    this.router.put(`${this.path}/:id`, this.controller.update);
    this.router.delete(`${this.path}/:id`, this.controller.delete);
  }
}

export default BaseRoute;
