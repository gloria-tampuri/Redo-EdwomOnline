'use client';

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Unit } from '@/types/categories-units';
import { useUnits } from '@/hooks/useUnits';

type DrawerMode = 'create' | 'view' | 'edit';

interface UnitDetailsDrawerProps {
  unit?: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  onSuccess?: () => void;
}

const UnitDetailsDrawer = ({ unit, isOpen, onClose, mode: initialMode = 'view', onSuccess }: UnitDetailsDrawerProps) => {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const [formData, setFormData] = useState<Unit>({
    name: '',
    abbreviation: '',
    description: '',
  });

  const { createUnit, updateUnit } = useUnits();

  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditing = useMemo(() => mode === 'edit' || mode === 'create', [mode]);

  // Update form data and mode when drawer opens or unit changes
  useEffect(() => {
    if (isOpen) {
      if (unit) {
        setFormData(unit);
        setMode(initialMode);
      } else {
        setMode('create');
        setFormData({
          name: '',
          abbreviation: '',
          description: '',
        });
      }
    }
  }, [unit, initialMode, isOpen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await createUnit.mutateAsync(formData);
        onSuccess?.();
        onClose();
      } else if (mode === 'edit') {
        await updateUnit.mutateAsync({ id: unit?._id!, data: formData });
        onSuccess?.();
        setMode('view');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader className=" py-4">
          <DrawerTitle>
            {mode === 'create' ? 'Add Unit' : mode === 'edit' ? 'Edit Unit' : 'Unit Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* Unit Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Unit Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Unit Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Unit name"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Short Code</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleInputChange}
                    placeholder="e.g. kg, L, pcs"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.abbreviation}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-20 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{formData.description || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DrawerFooter className="flex justify-end gap-2 pt-6 mt-8">
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => (mode === 'create' ? onClose() : setMode('view'))}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUnit.isPending || updateUnit.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 transition text-sm flex items-center gap-2"
                >
                  {createUnit.isPending || updateUnit.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition text-sm"
              >
                Edit Unit
              </button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default memo(UnitDetailsDrawer);
