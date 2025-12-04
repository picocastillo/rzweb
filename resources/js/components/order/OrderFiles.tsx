// resources/js/components/order/OrderFiles.tsx
import { Button } from '@/components/ui/button';
import { useState } from 'react';
//import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
//import { Label } from '@/components/ui/label';
import type { File } from '@/types/order';
import { useForm } from '@inertiajs/react';

export default function OrderFiles({
    orderId,
    files,
    //canManagePrivate = false,
}: {
    orderId: number;
    files: File[];
    canManagePrivate?: boolean;
}) {
    const [uploading, setUploading] = useState(false);
    const uploadForm = useForm({
        file: null as File | null,
        is_private: 0,
        order_id: orderId,
    });
    const deleteForm = useForm({});

    const handleUpload = () => {
        if (!uploadForm.data.file) return;

        setUploading(true);

        uploadForm.post(`/orders/${orderId}/file`, {
            onFinish: () => {
                uploadForm.reset('file', 'is_private');
                setUploading(false);
            },
            onError: () => {
                setUploading(false);
            },
        });
    };

    const handleDelete = (fileId: number) => {
        if (!confirm('¿Desea eliminar este archivo?')) return;

        deleteForm.delete(`/orders/${orderId}/file/${fileId}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Archivos adjuntos
            </h2>

            {/* Upload form */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                {/* Input + nombre */}
                <div className="flex-1">
                    <Input
                        type="file"
                        onChange={(e) =>
                            uploadForm.setData(
                                'file',
                                e.target.files?.[0] || null,
                            )
                        }
                    />
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={!uploadForm.data.file || uploading}
                >
                    {uploading ? 'Subiendo…' : 'Subir archivo'}
                </Button>
                {/* {canManagePrivate && (
                    <div className="flex items-center gap-2">
                        <Input
                            id="private-file"
                            type="checkbox"
                            checked={!!uploadForm.data.is_private}
                            onChange={(e) =>
                                uploadForm.setData('is_private', e.target.checked ? 1 : 0)
                            }
                        />
                        <Label htmlFor="private-file" className="text-sm text-gray-700">
                            Privado
                        </Label>
                    </div>
                )} */}
            </div>

            {files.length === 0 && (
                <p className="text-sm text-gray-500">
                    Sin archivos adjuntos para este pedido.
                </p>
            )}

            <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                    <li
                        key={file.id}
                        className="flex items-center justify-between py-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-blue-600">📎</span>
                            <a
                                href={`/storage/orders_attach/${file.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                {file.name}
                            </a>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(file.id)}
                        >
                            Eliminar
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
