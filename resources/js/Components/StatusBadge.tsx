import { ProcurementStatus } from '@/types/procurement';

interface Props {
    status: ProcurementStatus | string;
    label: string;
    color: string;
    className?: string;
}

export default function StatusBadge({ status, label, color, className = '' }: Props) {
    const baseClasses = 'px-3 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wider rounded-full shadow-sm';
    const colorMap: Record<string, string> = {
        'gray': 'bg-gray-100/80 text-gray-800 border border-gray-200',
        'yellow': 'bg-yellow-100/80 text-yellow-800 border border-yellow-200',
        'green': 'bg-green-100/80 text-green-800 border border-green-200',
        'red': 'bg-red-100/80 text-red-800 border border-red-200',
        'blue': 'bg-blue-100/80 text-blue-800 border border-blue-200',
    };

    const finalClass = `${baseClasses} ${colorMap[color] || colorMap['gray']} ${className}`;

    return (
        <span className={finalClass}>
            {label}
        </span>
    );
}
