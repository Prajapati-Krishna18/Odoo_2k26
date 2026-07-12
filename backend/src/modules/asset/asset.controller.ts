import { Request, Response, NextFunction } from 'express';
import { AssetService } from './asset.service';

export class AssetController {
  private readonly assetService: AssetService;

  constructor(assetService: AssetService) {
    this.assetService = assetService;
  }

  async createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async getAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async getAssetById(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async updateAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async updateAssetStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async searchAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }

  async filterAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error('Not Implemented');
  }
}
