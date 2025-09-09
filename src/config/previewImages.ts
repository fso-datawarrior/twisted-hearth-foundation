// Multi-Category Preview Images Configuration
// Organize images by categories for different preview modes

export interface PreviewCategory {
  id: string;
  title: string;
  description: string;
  images: Array<{
    filename: string;
    path: string;
    alt: string;
    title?: string;
  }>;
}

export const PREVIEW_CATEGORIES: PreviewCategory[] = [
  {
    id: 'vignettes',
    title: 'Past Vignettes',
    description: 'Twisted tales from previous gatherings',
    images: [
      {
        filename: 'goldilocks-teaser.jpg',
        path: '/img/goldilocks-teaser.jpg',
        alt: 'Goldilocks vignette - The Butcher\'s Den',
        title: 'Goldilocks — The Butcher\'s Den'
      },
      {
        filename: 'jack-teaser.jpg', 
        path: '/img/jack-teaser.jpg',
        alt: 'Jack and the Beanstalk vignette - A Thief\'s Reward',
        title: 'Jack & the Beanstalk — A Thief\'s Reward'
      },
      {
        filename: 'snowwhite-teaser.jpg',
        path: '/img/snowwhite-teaser.jpg', 
        alt: 'Snow White vignette - The Glass Coffin Feast',
        title: 'Snow White & the Goblin-Dwarves'
      }
    ]
  },
  {
    id: 'activities',
    title: 'Event Activities',
    description: 'Games, competitions, and twisted fun',
    images: [
      {
        filename: 'beerPongWicked.jpg',
        path: '/img/beerPongWicked.jpg',
        alt: 'Cursed beer pong tournament setup',
        title: 'Cursed Pong Tournament'
      }
    ]
  },
  {
    id: 'costumes',
    title: 'Costume Inspiration', 
    description: 'Twisted fairytale character ideas',
    images: [
      {
        filename: 'Cinderella.jpg',
        path: '/img/costumes/Cinderella.jpg',
        alt: 'Corporate Cinderella costume inspiration',
        title: 'Corporate Cinderella'
      },
      {
        filename: 'LittleRedRidingHood.png',
        path: '/img/costumes/LittleRedRidingHood.png', 
        alt: 'Surveillance Red Riding Hood costume',
        title: 'Surveillance Red Riding Hood'
      },
      {
        filename: 'Pinocchio.png',
        path: '/img/costumes/Pinocchio.png',
        alt: 'Dark Pinocchio costume inspiration', 
        title: 'Truth-Seeking Pinocchio'
      },
      {
        filename: 'snow-white.png',
        path: '/img/costumes/snow-white.png',
        alt: 'Modern Snow White costume',
        title: 'Corporate Snow White'
      },
      {
        filename: 'hanselGetel.png', 
        path: '/img/costumes/hanselGetel.png',
        alt: 'Hansel and Gretel costume duo',
        title: 'Digital Hansel & Gretel'
      }
    ]
  },
  {
    id: 'thumbnails',
    title: 'Event Memories',
    description: 'Quick glimpses of past celebrations',
    images: [
      {
        filename: 'goldilocks-thumb.jpg',
        path: '/img/goldilocks-thumb.jpg',
        alt: 'Goldilocks event thumbnail',
        title: 'Goldilocks Night'
      },
      {
        filename: 'jack-thumb.jpg',
        path: '/img/jack-thumb.jpg', 
        alt: 'Jack and the Beanstalk event thumbnail',
        title: 'Beanstalk Evening'
      },
      {
        filename: 'snowwhite-thumb.jpg',
        path: '/img/snowwhite-thumb.jpg',
        alt: 'Snow White event thumbnail', 
        title: 'Glass Coffin Gathering'
      }
    ]
  }
];

// Helper functions for different preview modes
export const getPreviewImagesByCategory = (categoryId: string): string[] => {
  const category = PREVIEW_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.images.map(img => img.path) : [];
};

export const getAllPreviewImages = (): string[] => {
  return PREVIEW_CATEGORIES.flatMap(category => 
    category.images.map(img => img.path)
  );
};

export const getPreviewCategory = (categoryId: string): PreviewCategory | undefined => {
  return PREVIEW_CATEGORIES.find(cat => cat.id === categoryId);
};

// Legacy compatibility - returns all vignette images
export const getPreviewImagePaths = (): string[] => {
  return getPreviewImagesByCategory('vignettes');
};
