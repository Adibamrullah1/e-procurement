<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ProcurementStatus;
use App\Models\Procurement;
use App\Models\ProcurementItem;
use Illuminate\Support\Facades\DB;

class ProcurementService
{
    /**
     * Create a new procurement request with items.
     *
     * @param  array{
     *     title: string,
     *     category_id: int,
     *     vendor_id: int|null,
     *     user_id: int,
     *     items: array<int, array{item_name: string, quantity: int, unit_price: float}>
     * }  $data
     */
    public function createRequest(array $data): Procurement
    {
        return DB::transaction(function () use ($data): Procurement {
            $procurement = Procurement::create([
                'code' => Procurement::generateCode(),
                'user_id' => $data['user_id'],
                'category_id' => $data['category_id'],
                'vendor_id' => $data['vendor_id'] ?? null,
                'title' => $data['title'],
                'status' => ProcurementStatus::DRAFT,
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $subTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $subTotal;

                $procurement->items()->create([
                    'item_name' => $item['item_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'sub_total' => $subTotal,
                ]);
            }

            $procurement->update(['total_amount' => $totalAmount]);

            return $procurement->load('items');
        });
    }

    /**
     * Send procurement for approval (DRAFT -> SENDING).
     */
    public function sendForApproval(Procurement $procurement): Procurement
    {
        $this->assertTransition($procurement, ProcurementStatus::SENDING);

        $procurement->update(['status' => ProcurementStatus::SENDING]);

        return $procurement->fresh();
    }

    /**
     * Process approval/rejection by Finance (SENDING -> APPROVED/REJECTED).
     *
     * @param  'approve'|'reject'  $action
     */
    public function processApproval(Procurement $procurement, string $action, ?string $notes = null): Procurement
    {
        $targetStatus = $action === 'approve'
            ? ProcurementStatus::APPROVED
            : ProcurementStatus::REJECTED;

        $this->assertTransition($procurement, $targetStatus);

        if ($action === 'reject' && empty($notes)) {
            throw new \InvalidArgumentException('Catatan wajib diisi jika menolak pengadaan.');
        }

        $procurement->update([
            'status' => $targetStatus,
            'finance_notes' => $notes,
        ]);

        return $procurement->fresh();
    }

    /**
     * Finalize procurement (APPROVED -> COMPLETED).
     */
    public function finalizeRequest(Procurement $procurement): Procurement
    {
        $this->assertTransition($procurement, ProcurementStatus::COMPLETED);

        $procurement->update(['status' => ProcurementStatus::COMPLETED]);

        return $procurement->fresh();
    }

    /**
     * Revert rejected procurement back to draft (REJECTED -> DRAFT).
     */
    public function revertToDraft(Procurement $procurement): Procurement
    {
        $this->assertTransition($procurement, ProcurementStatus::DRAFT);

        $procurement->update([
            'status' => ProcurementStatus::DRAFT,
            'finance_notes' => null,
        ]);

        return $procurement->fresh();
    }

    /**
     * Assert that a status transition is valid.
     */
    private function assertTransition(Procurement $procurement, ProcurementStatus $targetStatus): void
    {
        if (!$procurement->status->canTransitionTo($targetStatus)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Tidak dapat mengubah status dari "%s" ke "%s".',
                    $procurement->status->label(),
                    $targetStatus->label()
                )
            );
        }
    }
}
