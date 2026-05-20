class ContentService {
  async getBanners() {
    return [
      { id: 1, imageUrl: 'https://example.com/banner1.jpg', title: 'Cashback 50%' },
      { id: 2, imageUrl: 'https://example.com/banner2.jpg', title: 'Cashback blu 100%' }
    ];
  }

  async getLifestyleArticles() {
    return [
      { id: 1, title: 'Event Jakarta Fair', category: 'Event' },
      { id: 2, title: 'New Culinary Spots near MRT', category: 'Lifestyle' }
    ];
  }
}

export default ContentService;
