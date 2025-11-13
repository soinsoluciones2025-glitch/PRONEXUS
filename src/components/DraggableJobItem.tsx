import React from 'react';
import type { Job, DraggableItem } from '../types.ts';

interface DraggableJobItemProps {
  job: Job;
  children: React.ReactNode;
  onDragStart: (item: DraggableItem) => (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

const DraggableJobItem: React.FC<DraggableJobItemProps> = ({ job, children, onDragStart, onDragEnd }) => {
  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.currentTarget.classList.add('opacity-40');
    onDragStart({ id: job.id, type: 'job', data: job })(e);
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
      aria-label={`Arrastrar empleo ${job.jobTitle}`}
    >
      {children}
    </div>
  );
};

export default DraggableJobItem;