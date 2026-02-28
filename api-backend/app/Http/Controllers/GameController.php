use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::query();

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->has('genre') && $request->genre !== 'all') {
            $query->where('genre', $request->genre);
        }

        if ($request->has('platform') && $request->platform !== 'all') {
            $query->where('platform', $request->platform);
        }

        $order = $request->get('order', 'latest');
        switch ($order) {
            case 'oldest': $query->oldest(); break;
            case 'price_high': $query->orderBy('cost', 'desc'); break;
            case 'price_low': $query->orderBy('cost', 'asc'); break;
            case 'title_az': $query->orderBy('title', 'asc'); break;
            case 'title_za': $query->orderBy('title', 'desc'); break;
            default: $query->latest(); break;
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "title" => "required|string",
            "description" => "required|string",
            "genre" => "nullable|string",
            "platform" => "nullable|string",
            "cost" => "nullable|integer",
            "banner_image" => "nullable|image|max:2048"
        ]);

        if ($request->hasFile("banner_image")) {
            $data["banner_image"] = $request->file("banner_image")->store("games", "public");
        }

        $game = Game::create($data);
        return response()->json(['message' => 'Game created', 'game' => $game], 201);
    }

    public function show(Game $game)
    {
        return response()->json($game);
    }

    public function update(Request $request, Game $game)
    {
        $data = $request->validate([
            "title" => "required|string",
            "description" => "required|string",
            "genre" => "nullable|string",
            "platform" => "nullable|string",
            "cost" => "nullable|integer",
        ]);

        if ($request->hasFile("banner_image")) {
            if ($game->banner_image) Storage::disk("public")->delete($game->banner_image);
            $data["banner_image"] = $request->file("banner_image")->store("games", "public");
        }

        $game->update($data);
        return response()->json(['message' => 'Game updated']);
    }

    public function destroy(Game $game)
    {
        if ($game->banner_image) Storage::disk("public")->delete($game->banner_image);
        $game->delete();
        return response()->json(['message' => 'Game deleted']);
    }
}
