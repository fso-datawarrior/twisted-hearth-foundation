import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tags } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  onSave: () => void;
}

const CATEGORIES = [
  { id: 'past-vignettes', label: 'Past Vignettes' },
  { id: 'creepy-decor', label: 'Creepy Decor' },
  { id: 'costume-heroes', label: 'Costume Heroes' },
  { id: 'event-memories', label: 'Event Memories' }
];

export default function CategorySelector({ selectedCategories, onChange, onSave }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const handleSave = () => {
    onSave();
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Tags className="h-3 w-3 mr-2" />
            Categories ({selectedCategories.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Select Categories</h4>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
            <Button onClick={handleSave} size="sm" className="w-full">
              Save Categories
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Display selected categories as badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.map((categoryId) => {
            const category = CATEGORIES.find(c => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="secondary" className="text-xs">
                {category?.label}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
