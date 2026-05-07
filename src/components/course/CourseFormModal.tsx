import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Course } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Pick<Course, 'name' | 'location'>) => void;
  initial?: Course | null;
}

export const CourseFormModal: React.FC<Props> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setLocation(initial?.location ?? '');
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), location: location.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'コースを編集' : 'コースを追加'}
    >
      <div className="space-y-4">
        <Input
          label="コース名 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 〇〇カントリークラブ"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Input
          label="所在地"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例: 神奈川県"
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            キャンセル
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim()}>
            {initial ? '更新' : '作成'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
