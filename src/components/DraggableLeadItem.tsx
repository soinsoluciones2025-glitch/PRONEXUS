import React from 'react';
import type { Lead, DraggableItem } from '../types.ts';

interface DraggableLeadItemProps {
  lead: Lead;
  children: React.ReactNode;
  onDragStart: (item: DraggableItem) => (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

const DraggableLeadItem: React.FC<DraggableLeadItemProps> = ({ lead, children, onDragStart, onDragEnd }) => {
  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.currentTarget.classList.add('opacity-40');
    onDragStart({ id: lead.id, type: 'lead', data: lead })(e);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLElement>) => {
    e.currentTarget.classList.remove('opacity-40');
    onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing transition-opacity"
      aria-grabbed="false"
      aria-label={`Arrastrar cliente potencial ${lead.name}`}
    >
      {children}
    </div>
  );
};

export default DraggableLeadItem;