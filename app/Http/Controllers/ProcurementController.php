<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ProcurementStatus;
use App\Http\Requests\StoreProcurementRequest;
use App\Http\Resources\ProcurementResource;
use App\Models\Category;
use App\Models\Procurement;
use App\Models\Vendor;
use App\Services\ProcurementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProcurementController extends Controller
{
    public function __construct(
        private readonly ProcurementService $service,
    ) {
    }

    /**
     * Display procurement list.
     */
    public function index(Request $request): Response
    {
        $query = Procurement::with(['user', 'category', 'vendor'])
            ->latest();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by search query
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Role-based filtering: requester only sees their own
        if ($request->user()->hasRole('requester') && !$request->user()->hasRole('admin_procurement')) {
            $query->where('user_id', $request->user()->id);
        }

        $procurements = $query->paginate(10)->withQueryString();

        return Inertia::render('Procurement/Index', [
            'procurements' => ProcurementResource::collection($procurements),
            'filters' => $request->only(['status', 'search']),
            'statuses' => collect(ProcurementStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ]),
        ]);
    }

    /**
     * Show create form.
     */
    public function create(): Response
    {
        return Inertia::render('Procurement/Create', [
            'categories' => Category::all(['id', 'name']),
            'vendors' => Vendor::all(['id', 'name']),
        ]);
    }

    /**
     * Store a new procurement.
     */
    public function store(StoreProcurementRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $procurement = $this->service->createRequest($data);

        return redirect()
            ->route('procurements.show', $procurement)
            ->with('success', 'Pengadaan berhasil dibuat.');
    }

    /**
     * Show procurement detail.
     */
    public function show(Procurement $procurement): Response
    {
        $procurement->load(['user', 'category', 'vendor', 'items']);

        return Inertia::render('Procurement/Show', [
            'procurement' => new ProcurementResource($procurement),
        ]);
    }

    /**
     * Send procurement for approval.
     */
    public function send(Procurement $procurement): RedirectResponse
    {
        $this->service->sendForApproval($procurement);

        return back()->with('success', 'Pengadaan berhasil dikirim untuk persetujuan.');
    }

    /**
     * Approve procurement.
     */
    public function approve(Request $request, Procurement $procurement): RedirectResponse
    {
        $this->service->processApproval(
            $procurement,
            'approve',
            $request->input('notes')
        );

        return back()->with('success', 'Pengadaan berhasil disetujui.');
    }

    /**
     * Reject procurement.
     */
    public function reject(Request $request, Procurement $procurement): RedirectResponse
    {
        $request->validate([
            'notes' => ['required', 'string', 'max:1000'],
        ], [
            'notes.required' => 'Catatan wajib diisi saat menolak pengadaan.',
        ]);

        $this->service->processApproval(
            $procurement,
            'reject',
            $request->input('notes')
        );

        return back()->with('success', 'Pengadaan berhasil ditolak.');
    }

    /**
     * Finalize procurement.
     */
    public function finalize(Procurement $procurement): RedirectResponse
    {
        $this->service->finalizeRequest($procurement);

        return back()->with('success', 'Pengadaan berhasil diselesaikan.');
    }
}
