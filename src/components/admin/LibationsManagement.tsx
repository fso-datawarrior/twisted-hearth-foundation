import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Save, RotateCcw, Trash2, ArrowUp, ArrowDown, Wine } from "lucide-react";
import { toast } from "sonner";
import { 
  getAllLibations, 
  createLibation, 
  updateLibation, 
  deleteLibation, 
  reorderLibation,
  type SignatureLibation,
  type LibationType 
} from "@/lib/libations-api";

interface LibationFormData {
  name: string;
  description: string;
  ingredients: string;
  libation_type: LibationType;
  image_url: string;
  serving_size: string;
  prep_notes: string;
  prep_time: string;
  is_active: boolean;
  sort_order: number;
}

export function LibationsManagement() {
  const queryClient = useQueryClient();
  const [libationData, setLibationData] = useState<Record<string, LibationFormData>>({});
  const [originalData, setOriginalData] = useState<Record<string, LibationFormData>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [libationToDelete, setLibationToDelete] = useState<string | null>(null);

  const { data: libations = [], isLoading } = useQuery({
    queryKey: ['all-libations'],
    queryFn: getAllLibations,
  });

  const createMutation = useMutation({
    mutationFn: createLibation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-libations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLibation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-libations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLibation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-libations'] });
      toast.success("Libation deleted successfully");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) => 
      reorderLibation(id, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-libations'] });
      toast.success("Order updated");
    },
  });

  useEffect(() => {
    const initialData: Record<string, LibationFormData> = {};
    libations.forEach((lib) => {
      initialData[lib.id] = {
        name: lib.name,
        description: lib.description,
        ingredients: lib.ingredients.join('\n'),
        libation_type: lib.libation_type,
        image_url: lib.image_url || '',
        serving_size: lib.serving_size || '',
        prep_notes: lib.prep_notes || '',
        prep_time: lib.prep_time || '',
        is_active: lib.is_active,
        sort_order: lib.sort_order,
      };
    });
    setLibationData(initialData);
    setOriginalData(initialData);
  }, [libations]);

  const handleChange = (id: string, field: keyof LibationFormData, value: any) => {
    setLibationData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
    setHasChanges(prev => ({ ...prev, [id]: true }));
  };

  const saveLibation = async (id: string) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    
    try {
      const data = libationData[id];
      
      if (!data.name || !data.description) {
        toast.error("Name and description are required");
        return;
      }

      const ingredients = data.ingredients
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      if (ingredients.length === 0) {
        toast.error("At least one ingredient is required");
        return;
      }

      await updateMutation.mutateAsync({
        id,
        data: {
          name: data.name,
          description: data.description,
          ingredients,
          libation_type: data.libation_type,
          image_url: data.image_url || null,
          serving_size: data.serving_size || null,
          prep_notes: data.prep_notes || null,
          prep_time: data.prep_time || null,
          is_active: data.is_active,
          sort_order: data.sort_order,
        },
      });

      setOriginalData(prev => ({ ...prev, [id]: data }));
      setHasChanges(prev => ({ ...prev, [id]: false }));
      toast.success("Libation saved successfully");
    } catch (error) {
      console.error("Error saving libation:", error);
      toast.error("Failed to save libation");
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const resetLibation = (id: string) => {
    setLibationData(prev => ({
      ...prev,
      [id]: originalData[id],
    }));
    setHasChanges(prev => ({ ...prev, [id]: false }));
    toast.info("Changes discarded");
  };

  const handleDelete = async () => {
    if (!libationToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(libationToDelete);
      setDeleteDialogOpen(false);
      setLibationToDelete(null);
    } catch (error) {
      toast.error("Failed to delete libation");
    }
  };

  const moveLibation = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = libations.findIndex(l => l.id === id);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= libations.length) return;

    const currentLibation = libations[currentIndex];
    const targetLibation = libations[targetIndex];

    await reorderMutation.mutateAsync({ 
      id: currentLibation.id, 
      sortOrder: targetLibation.sort_order 
    });
    await reorderMutation.mutateAsync({ 
      id: targetLibation.id, 
      sortOrder: currentLibation.sort_order 
    });
  };

  const addNewLibation = async () => {
    try {
      const maxOrder = Math.max(...libations.map(l => l.sort_order), -1);
      await createMutation.mutateAsync({
        name: "New Libation",
        description: "Description here",
        ingredients: ["Ingredient 1"],
        libation_type: 'cocktail',
        is_active: false,
        sort_order: maxOrder + 1,
      });
      toast.success("New libation created");
    } catch (error) {
      toast.error("Failed to create libation");
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading libations...</div>;
  }

  const activeCount = libations.filter(l => l.is_active).length;
  const totalCount = libations.length;

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-primary mb-2">
            Signature Libations Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage drinks displayed on the Feast page
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Wine className="h-3 w-3 mr-1" />
            {totalCount} Total
          </Badge>
          <Badge variant="default" className="text-sm bg-accent-gold text-background">
            {activeCount} Active
          </Badge>
          <Button onClick={addNewLibation} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Libation
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {libations.map((libation, index) => {
          const data = libationData[libation.id];
          if (!data) return null;
          
          return (
            <Card key={libation.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{data.image_url || '🍷'}</span>
                    <div>
                      <CardTitle className="text-lg">{data.name || 'Untitled'}</CardTitle>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {data.libation_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveLibation(libation.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveLibation(libation.id, 'down')}
                      disabled={index === libations.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLibationToDelete(libation.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${libation.id}`}>Name *</Label>
                    <Input
                      id={`name-${libation.id}`}
                      value={data.name || ''}
                      onChange={(e) => handleChange(libation.id, 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`type-${libation.id}`}>Type *</Label>
                    <Select
                      value={data.libation_type}
                      onValueChange={(value) => handleChange(libation.id, 'libation_type', value)}
                    >
                      <SelectTrigger id={`type-${libation.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cocktail">Cocktail</SelectItem>
                        <SelectItem value="mocktail">Mocktail</SelectItem>
                        <SelectItem value="punch">Punch</SelectItem>
                        <SelectItem value="specialty">Specialty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`desc-${libation.id}`}>Description *</Label>
                    <Textarea
                      id={`desc-${libation.id}`}
                      value={data.description || ''}
                      onChange={(e) => handleChange(libation.id, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`ingredients-${libation.id}`}>Ingredients * (one per line)</Label>
                    <Textarea
                      id={`ingredients-${libation.id}`}
                      value={data.ingredients || ''}
                      onChange={(e) => handleChange(libation.id, 'ingredients', e.target.value)}
                      rows={4}
                      placeholder="Ingredient 1&#10;Ingredient 2&#10;Ingredient 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`icon-${libation.id}`}>Icon/Image (emoji or URL)</Label>
                    <Input
                      id={`icon-${libation.id}`}
                      value={data.image_url || ''}
                      onChange={(e) => handleChange(libation.id, 'image_url', e.target.value)}
                      placeholder="🍹 or https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`serving-${libation.id}`}>Serving Size</Label>
                    <Input
                      id={`serving-${libation.id}`}
                      value={data.serving_size || ''}
                      onChange={(e) => handleChange(libation.id, 'serving_size', e.target.value)}
                      placeholder="Serves 8-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`prep-time-${libation.id}`}>Prep Time</Label>
                    <Input
                      id={`prep-time-${libation.id}`}
                      value={data.prep_time || ''}
                      onChange={(e) => handleChange(libation.id, 'prep_time', e.target.value)}
                      placeholder="5 minutes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`prep-notes-${libation.id}`}>Prep Notes</Label>
                    <Input
                      id={`prep-notes-${libation.id}`}
                      value={data.prep_notes || ''}
                      onChange={(e) => handleChange(libation.id, 'prep_notes', e.target.value)}
                      placeholder="Best served chilled"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${libation.id}`}
                      checked={data.is_active}
                      onCheckedChange={(checked) => handleChange(libation.id, 'is_active', checked)}
                    />
                    <Label htmlFor={`active-${libation.id}`}>Active</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t mt-4">
                  <Button
                    size="sm"
                    onClick={() => saveLibation(libation.id)}
                    disabled={!hasChanges[libation.id] || saving[libation.id]}
                    className="flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {saving[libation.id] ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetLibation(libation.id)}
                    disabled={!hasChanges[libation.id]}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Libation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the libation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
