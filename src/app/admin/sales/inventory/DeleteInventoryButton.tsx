'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteInventoryButton({ itemId, itemName }: { itemId: string, itemName: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${itemName}" from inventory? This cannot be undone.`)) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/inventory/${itemId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete item');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
        >
            Delete
        </button>
    );
}
