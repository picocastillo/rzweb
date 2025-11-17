// resources/js/components/order/OrderNotes.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import type { Note } from '@/types/order';

export default function OrderNotes({
    orderId,
    notes,
    canManagePrivate = false,
}: {
    orderId: number;
    notes: Note[];
    canManagePrivate?: boolean;
}) {
    const [showNewModal, setShowNewModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    const newForm = useForm({
        message: '',
        is_private: 0,
        order_id: orderId,
    });

    const editForm = useForm({
        message: '',
    });

    const handleSaveNew = () => {
        newForm.post(`/orders/${orderId}/note`, {
            onSuccess: () => {
                newForm.reset();
                setShowNewModal(false);
            },
        });
    };

    const handleStartEdit = (note: Note) => {
        setEditingId(note.id);
        editForm.setData('message', note.message);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleUpdate = (noteId: number) => {
        if (!editForm.data.message.trim()) return;

        editForm.put(`/orders/${orderId}/notes/${noteId}`, {
            onSuccess: () => {
                setEditingId(null);
            },
        });
    };

    return (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Notas</h2>
                <Button size="sm" onClick={() => setShowNewModal(true)}>
                    Agregar nota
                </Button>
            </div>

            {notes.length === 0 && (
                <p className="text-sm text-gray-500">Aún no hay notas.</p>
            )}

            <ul className="space-y-4">
                {notes.map((note) => (
                    <li
                        key={note.id}
                        className="rounded-lg border border-gray-200 p-4"
                    >
                        <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant={note.is_private ? 'destructive' : 'default'}>
                                    {note.is_private ? 'Privada' : 'Pública'}
                                </Badge>
                                <span className="text-lg text-gray-500">
                                    {new Date(note.created_at).toLocaleString('es-ES')}
                                </span>
                            </div>
                            <Button
                                size="lg"
                                variant="ghost"
                                onClick={() => handleStartEdit(note)}
                            >
                                Editar
                            </Button>
                        </div>

                        {editingId === note.id ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={editForm.data.message}
                                    onChange={(e) => editForm.setData('message', e.target.value)}
                                    rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={() => handleUpdate(note.id)}
                                    >
                                        Guardar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {note.message}
                            </p>
                        )}
                    </li>
                ))}
            </ul>

            {/* Modal nueva nota */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold">
                            Nueva nota
                        </h3>
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Escriba una nota..."
                                value={newForm.data.message}
                                onChange={(e) =>
                                    newForm.setData('message', e.target.value)
                                }
                                rows={4}
                            />
                            {canManagePrivate && (
                                <div className="flex items-center gap-2">
                                    <input
                                        id="private"
                                        type="checkbox"
                                        checked={!!newForm.data.is_private}
                                        onChange={(e) =>
                                            newForm.setData(
                                                'is_private',
                                                e.target.checked ? 1 : 0,
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="private"
                                        className="text-sm text-gray-700"
                                    >
                                        Nota privada
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowNewModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveNew}>Guardar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}