// Preview Images Configuration
// Add or remove image filenames here to control which images appear in the carousel
// Images should be placed in the /public/img/preview/ folder

export const PREVIEW_IMAGE_FILES = [
  'goldilocks-teaser.jpg',
  'jack-teaser.jpg', 
  'snowwhite-teaser.jpg',
  'beerPongWicked.jpg',
  'goldilocks-thumb.jpg',
  'jack-thumb.jpg',
  'snowwhite-thumb.jpg',
  'Cinderella.jpg'
];

// Helper function to generate full paths
export const getPreviewImagePaths = (): string[] => {
  return PREVIEW_IMAGE_FILES.map(filename => `/img/preview/${filename}`);
};
