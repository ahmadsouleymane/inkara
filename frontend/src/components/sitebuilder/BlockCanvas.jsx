import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, Trash2, Copy, Plus, Layers } from 'lucide-react';
import { useState } from 'react';
import { BLOCK_TYPES } from './BlockPalette.jsx';
import BlockRenderer from './BlockRenderer.jsx';

function AddBlockButton({ onAdd }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative flex items-center justify-center py-1 group/add">
      {/* Line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-transparent group-hover/add:bg-[var(--color-primary)]/20 transition-colors" />

      {/* Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="relative z-10 w-7 h-7 rounded-full bg-white border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white text-gray-400 flex items-center justify-center transition-all opacity-0 group-hover/add:opacity-100 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
          <div className="absolute z-30 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-56 max-h-72 overflow-y-auto">
            {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${color}14` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SortableBlock({ block, theme, isSelected, onSelect, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const blockMeta = BLOCK_TYPES.find((b) => b.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-2xl transition-all ${
        isDragging
          ? 'opacity-50 scale-[0.98]'
          : isSelected
            ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 shadow-lg'
            : 'ring-1 ring-transparent hover:ring-gray-200'
      }`}
      onClick={() => onSelect(block.id)}
    >
      {/* Floating toolbar */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-md border border-gray-200 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
          title="Déplacer"
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Block type badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: `${blockMeta?.color || '#666'}14`, color: blockMeta?.color || '#666' }}>
          {blockMeta && <blockMeta.icon className="w-3 h-3" />}
          {blockMeta?.label || block.type}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Duplicate */}
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}
          className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          title="Dupliquer"
        >
          <Copy className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
          className="p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>

      {/* Block preview */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <BlockRenderer block={block} theme={theme} isEditor />
      </div>
    </div>
  );
}

export default function BlockCanvas({ blocks, theme, selectedBlockId, onSelect, onReorder, onDelete, onDuplicate, onAdd }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(active.id, over.id);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 flex items-center justify-center">
            <Layers className="w-9 h-9 text-[var(--color-primary)] opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cette page est vide</h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Commencez à construire votre page en ajoutant des blocs depuis le panneau de gauche, ou cliquez ci-dessous pour démarrer.
          </p>
          {onAdd && (
            <button
              onClick={() => onAdd('hero')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" /> Ajouter une bannière
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {blocks.map((block, index) => (
              <div key={block.id}>
                {/* Add block between */}
                {index === 0 && onAdd && <AddBlockButton onAdd={onAdd} />}
                <SortableBlock
                  block={block}
                  theme={theme}
                  isSelected={selectedBlockId === block.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
                {onAdd && <AddBlockButton onAdd={onAdd} />}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
