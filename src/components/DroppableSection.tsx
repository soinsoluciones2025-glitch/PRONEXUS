
import React, { useState, useCallback, useContext } from 'react';
import type { DraggableItem, Lead, Job } from '../types.ts'; // Import Lead and Job for type assertion
import { TTSContext } from '../contexts/TTSContext.tsx';

interface DroppableSectionProps {
  id: string;
  label: string;
  onDrop: (item: DraggableItem, targetId: string) => void;
  children: React.ReactNode;
  isDragging: boolean;
  draggedItemType: DraggableItem['type'] | null;
  accepts: DraggableItem['type'];
  totalItems: number; // New prop to display count of items in the column
}

const DroppableSection: React.FC<DroppableSectionProps> = ({ id, label, onDrop, children, isDragging, draggedItemType, accepts, totalItems }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { speak } = useContext(TTSContext);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation(); // Prevent event from bubbling up to parent droppables
    if (draggedItemType === accepts) {
        e.dataTransfer.dropEffect = 'move'; // Indicate that a move is possible
        setIsHovering(true);
    } else {
        e.dataTransfer.dropEffect = 'none'; // Indicate that no drop is possible
    }
  }, [accepts, draggedItemType]);

  const handleDragLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up to parent droppables
    setIsHovering(false);
    
    // Check if the dropEffect matches the allowed effect (set in onDragOver)
    // and if the dragged item type is accepted by this droppable section.
    if (e.dataTransfer.dropEffect === 'none' || draggedItemType !== accepts) {
        const draggedItemName = draggedItemType === 'lead' ? 'cliente potencial' : 'empleo';
        const acceptsItemName = accepts === 'lead' ? 'clientes potenciales' : 'empleos';
        speak(`No se puede soltar un ${draggedItemName} aquí. Solo se aceptan ${acceptsItemName}.`);
        return;
    }

    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const item: DraggableItem = JSON.parse(data);
        onDrop(item, id); // Pass the item and the target section's ID
        // FIX: Access name/jobTitle based on item type and add nullish coalescing for safety
        const itemName = (item.type === 'lead' ? (item.data as Lead).name : (item.data as Job).jobTitle) ?? 'elemento';
        speak(`Elemento ${itemName} soltado en ${label}.`);
      } catch (error) {
        console.error("Failed to parse dropped data:", error);
        speak("Hubo un error al procesar el elemento soltado.");
      }
    }
  }, [accepts, draggedItemType, onDrop, speak, id, label]);

  const baseClasses = "flex flex-col gap-3 p-4 rounded-xl min-h-[150px] transition-all duration-200 ease-in-out flex-shrink-0 w-80";
  const defaultClasses = "bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm"; // Subtle shadow
  const hoverClasses = "bg-indigo-100 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-600 shadow-lg scale-[1.01]"; // More distinct hover
  const draggingOverValidTypeClasses = "opacity-100"; // Full opacity when dragging over valid target
  const notDraggingOverValidTypeClasses = "opacity-70"; // Slightly faded when dragging but not over a valid target

  return (
    <div
      id={`droppable-${id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${baseClasses} ${isHovering && draggedItemType === accepts ? hoverClasses : defaultClasses} ${isDragging && draggedItemType === accepts ? draggingOverValidTypeClasses : (isDragging ? notDraggingOverValidTypeClasses : '')}`}
      aria-label={`Zona para ${accepts === 'lead' ? 'clientes potenciales' : 'empleos'} en estado ${label}. Actualmente hay ${totalItems} elementos.`}
    >
      <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-xs bg-slate-200 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold">{totalItems}</span>
      </h4>
      <div className="flex-grow space-y-3">
        {children}
        {isHovering && draggedItemType === accepts && (
          <div className="bg-slate-200/50 dark:bg-gray-700/50 border-2 border-dashed border-slate-400 dark:border-gray-500 rounded-lg h-24 animate-pulse"></div>
        )}
      </div>
      {React.Children.count(children) === 0 && !isDragging && (
        <p className="text-center text-sm text-slate-500 dark:text-gray-400 italic">Arrastra un {accepts === 'lead' ? 'cliente potencial' : 'empleo'} aquí</p>
      )}
    </div>
  );
};

export default DroppableSection;
