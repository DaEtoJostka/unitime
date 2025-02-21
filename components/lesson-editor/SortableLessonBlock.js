import {PointerSensor, useSensor, useSensors} from '@dnd-kit/core';

export const SortableLessonBlock = ({block}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <DndContext 
      sensors={sensors}
    >
      <SortableContext items={items}>
        {blocks.map((block) => (
          <SortableItem key={block.id} id={block.id}>
            {/* Existing block content */}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}; 