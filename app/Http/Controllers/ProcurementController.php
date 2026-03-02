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
     * @OA\Get(
     *      path="/procurements",
     *      operationId="getProcurementsList",
     *      tags={"Procurements"},
     *      summary="Get list of procurements",
     *      description="Returns list of procurements based on roles and filters.",
     *      @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="Filter by procurement status",
     *          required=false,
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search by code or title",
     *          required=false,
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation"
     *       )
     * )
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
     * @OA\Post(
     *      path="/procurements",
     *      operationId="storeProcurement",
     *      tags={"Procurements"},
     *      summary="Store new procurement",
     *      description="Creates a new procurement request with items",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *             required={"title","category_id","items"},
     *             @OA\Property(property="title", type="string", example="New Laptop X1"),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="vendor_id", type="integer", example=1),
     *             @OA\Property(property="items", type="array", @OA\Items(
     *                  @OA\Property(property="item_name", type="string"),
     *                  @OA\Property(property="quantity", type="integer"),
     *                  @OA\Property(property="unit_price", type="number")
     *             ))
     *          )
     *      ),
     *      @OA\Response(response=201, description="Successful created"),
     *      @OA\Response(response=422, description="Validation errors")
     * )
     */
    public function store(StoreProcurementRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $userId = $request->user()->id;

        $procurement = $this->service->createRequest($data, $userId);

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
     * @OA\Post(
     *      path="/procurements/{id}/approve",
     *      operationId="approveProcurement",
     *      tags={"Procurements"},
     *      summary="Approve procurement",
     *      description="Finance approval",
     *      @OA\Parameter(
     *          name="id",
     *          description="Procurement ID",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          required=false,
     *          @OA\JsonContent(
     *             @OA\Property(property="notes", type="string", example="Disetujui. Sesuai budget.")
     *          )
     *      ),
     *      @OA\Response(response=302, description="Redirect back")
     * )
     */
    public function approve(Request $request, Procurement $procurement): RedirectResponse
    {
        $this->service->handleApproval(
            $procurement->id,
            'approve',
            $request->input('notes')
        );

        return back()->with('success', 'Pengadaan berhasil disetujui.');
    }

    /**
     * @OA\Post(
     *      path="/procurements/{id}/reject",
     *      operationId="rejectProcurement",
     *      tags={"Procurements"},
     *      summary="Reject procurement",
     *      description="Finance rejection (requires notes)",
     *      @OA\Parameter(
     *          name="id",
     *          description="Procurement ID",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *             required={"notes"},
     *             @OA\Property(property="notes", type="string", example="Budget tidak cukup.")
     *          )
     *      ),
     *      @OA\Response(response=302, description="Redirect back")
     * )
     */
    public function reject(Request $request, Procurement $procurement): RedirectResponse
    {
        $request->validate([
            'notes' => ['required', 'string', 'max:1000'],
        ], [
            'notes.required' => 'Catatan wajib diisi saat menolak pengadaan.',
        ]);

        $this->service->handleApproval(
            $procurement->id,
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
        $this->service->completeRequest($procurement->id);

        return back()->with('success', 'Pengadaan berhasil diselesaikan.');
    }
}
