<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProcurementStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Procurement extends Model implements AuditableContract
{
    use Auditable, HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'user_id',
        'category_id',
        'vendor_id',
        'title',
        'total_amount',
        'status',
        'finance_notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProcurementStatus::class,
            'total_amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<\App\Models\User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Vendor, $this>
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * @return HasMany<ProcurementItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ProcurementItem::class);
    }

    protected static function booted(): void
    {
        static::creating(function (Procurement $procurement) {
            if (empty($procurement->code)) {
                $prefix = 'PR';
                $date = now()->format('Ymd');
                $lastProcurement = static::withTrashed()
                    ->where('code', 'like', "{$prefix}-{$date}-%")
                    ->orderByDesc('code')
                    ->first();

                $sequence = 1;
                if ($lastProcurement) {
                    $lastSequence = (int) substr($lastProcurement->code, -4);
                    $sequence = $lastSequence + 1;
                }

                $procurement->code = sprintf('%s-%s-%04d', $prefix, $date, $sequence);
            }
        });
    }
}
