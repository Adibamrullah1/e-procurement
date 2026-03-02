<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = \Illuminate\Support\Facades\Cache::remember('categories.all', 60 * 24, function () {
            return Category::withCount('procurements')->latest()->get();
        });

        // Paginate manually or just return all since it's Master Data
        // To preserve compatibility with frontend that expects pagination:
        $page = request()->get('page', 1);
        $perPage = 10;
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $categories->forPage($page, $perPage)->values(),
            $categories->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        return Inertia::render('Category/Index', [
            'categories' => $paginator
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Category::create($validated);

        \Illuminate\Support\Facades\Cache::forget('categories.all');

        return back()->with('success', 'Kategori master berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $category->id],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        \Illuminate\Support\Facades\Cache::forget('categories.all');

        return back()->with('success', 'Kategori master berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->procurements()->exists()) {
            return back()->withErrors(['error' => 'Kategori ini tidak dapat dihapus karena paut bertaut dengan data pengadaan.']);
        }

        $category->delete();

        \Illuminate\Support\Facades\Cache::forget('categories.all');

        return back()->with('success', 'Kategori master berhasil dihapus.');
    }
}
