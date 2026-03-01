'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function RemoveStaffButton({ staffId, staffName }: { staffId: string, staffName: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove ${staffName} from the staff directory?`)) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/staff/${staffId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to remove staff');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRemove}
            disabled={isLoading}
            className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
            <Trash2 className="w-4 h-4" /> Remove
        </button>
    );
}
