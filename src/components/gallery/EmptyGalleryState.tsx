import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface EmptyGalleryStateProps {
  categoryName: string;
  message?: string;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
}

const EmptyGalleryState = ({ 
  categoryName, 
  message,
  showUploadButton = false,
  onUploadClick
}: EmptyGalleryStateProps) => {
  const defaultMessage = `No memories captured in ${categoryName} yet`;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Themed Placeholder Image */}
      <div className="relative w-full max-w-2xl mx-auto mb-6">
        <img 
          src="/img/no-photos-placeholder.jpg" 
          alt="No photos available"
          className="w-full h-auto rounded-lg shadow-2xl border-2 border-accent-gold/30"
        />
        
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 p-6 bg-ink/60 rounded-lg backdrop-blur-sm">
            <p className="font-subhead text-accent-gold text-2xl md:text-3xl" 
               style={{ textShadow: '0 0 12px hsla(var(--accent-gold), 0.6), 2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
              {message || defaultMessage}
            </p>
            
            {showUploadButton && onUploadClick && (
              <Button
                onClick={onUploadClick}
                variant="default"
                className="bg-accent-gold hover:bg-accent-gold/80 text-ink font-subhead mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your Memories
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle decorative text */}
      <p className="text-sm text-muted-foreground/60 italic font-serif">
        "Every haunted memory begins with a first photograph..."
      </p>
    </div>
  );
};

export default EmptyGalleryState;
