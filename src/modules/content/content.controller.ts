import { Request, Response, NextFunction } from 'express';
import ContentService from './content.service';

class ContentController {
  private contentService: ContentService;

  constructor({ contentService }: { contentService: ContentService }) {
    this.contentService = contentService;
  }

  getBanners = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const banners = await this.contentService.getBanners();
      res.status(200).json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  };

  getLifestyle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lifestyle = await this.contentService.getLifestyleArticles();
      res.status(200).json({ success: true, data: lifestyle });
    } catch (error) {
      next(error);
    }
  };
}

export default ContentController;
