<?php

declare(strict_types=1);

namespace App\Enums;

enum ProcurementStatus: string
{
    case DRAFT = 'draft';
    case SENDING = 'sending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SENDING => 'Menunggu Persetujuan',
            self::APPROVED => 'Disetujui',
            self::REJECTED => 'Ditolak',
            self::COMPLETED => 'Selesai',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::SENDING => 'yellow',
            self::APPROVED => 'green',
            self::REJECTED => 'red',
            self::COMPLETED => 'blue',
        };
    }

    /**
     * @return array<string>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::DRAFT => [self::SENDING->value],
            self::SENDING => [self::APPROVED->value, self::REJECTED->value],
            self::APPROVED => [self::COMPLETED->value],
            self::REJECTED => [self::DRAFT->value],
            self::COMPLETED => [],
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status->value, $this->allowedTransitions(), true);
    }
}
