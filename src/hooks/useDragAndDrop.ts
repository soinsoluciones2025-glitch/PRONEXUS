import { useState, useCallback } from 'react'; // Removed useEffect as it's not used
import type React from 'react'; 
import type { DraggableItem, Lead, Job } from '../types';
import { useTTS } from './useTTS';

/**
 * Custom hook for managing HTML Drag and Drop API state.
 * Provides functions to initiate drag, track the dragged item, and determine if a drag is active.
 */
export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const { speak } = useTTS();

  // This handler will be attached to the draggable element's onDragStart
  const handleDragStart = useCallback((item: DraggableItem) => (e: React.DragEvent<HTMLElement>) => {
    setDraggedItem(item);
    setIsDragging(true);
    // Set data for the drag operation
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move'; // Ensure a drag effect is allowed

    // Ensure item.data is correctly typed before accessing properties
    const itemName = item.type === 'lead' 
                     ? (item.data as Lead).name 
                     : (item.data as Job).jobTitle;
    speak(`Iniciando arrastre de ${item.type === 'lead' ? 'cliente potencial' : 'empleo'} ${itemName}.`);
  }, [speak]);

  // This handler will be attached to the draggable element's onDragEnd
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    speak("Arrastre finalizado."); // Announce end of drag, regardless of drop success
  }, [speak]);

  return {
    isDragging,
    draggedItem,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };
};