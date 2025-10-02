/**
 * Test component to verify rune image loading
 * This can be removed after testing
 */
import { useState } from 'react';
import { getRunePath, getRuneInfo, getAllRuneIds } from './rune-mapping';

export default function RuneTest() {
  const [selectedRune, setSelectedRune] = useState<string>('1');
  const [imageError, setImageError] = useState(false);
  
  const runeIds = getAllRuneIds();
  const runeInfo = getRuneInfo(selectedRune);
  const runePath = getRunePath(selectedRune);

  return (
    <div className="p-8 bg-background border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Rune Test Component</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Rune ID:
        </label>
        <select 
          value={selectedRune} 
          onChange={(e) => {
            setSelectedRune(e.target.value);
            setImageError(false);
          }}
          className="px-3 py-2 border rounded-md bg-background"
        >
          {runeIds.map(id => (
            <option key={id} value={id}>
              {id} - {getRuneInfo(id)?.name || 'Unknown'}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Rune Information:</h3>
        <div className="bg-muted p-3 rounded">
          <p><strong>ID:</strong> {selectedRune}</p>
          <p><strong>Name:</strong> {runeInfo?.name || 'Unknown'}</p>
          <p><strong>Description:</strong> {runeInfo?.description || 'No description'}</p>
          <p><strong>Filename:</strong> {runeInfo?.filename || 'Unknown'}</p>
          <p><strong>Path:</strong> {runePath}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Rune Image:</h3>
        <div className="w-32 h-32 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
          {!imageError ? (
            <img 
              src={runePath}
              alt={runeInfo?.name || `Rune ${selectedRune}`}
              width="128"
              height="128"
              className="max-w-full max-h-full object-contain"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Image failed to load</p>
              <p className="text-xs">{runePath}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Total runes available: {runeIds.length}</p>
        <p>Current rune path: {runePath}</p>
      </div>
    </div>
  );
}
