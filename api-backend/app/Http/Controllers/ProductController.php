<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user_id = auth()->user()->id;

        $products = Product::where("user_id", $user_id)->get();

        return response()->json([
            'products' => $products
        ], 200);    
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            "tile" => "required|string",
        ]);

        $data["user_id"] = auth()->user()->id;
        if ($request->hasFile("banner_image")) {
            $data["banner_image"] = $request->file("banner_image")->store("products", "public");
        }

        Product::create($data);

        return response()->json([
            'message' => 'Product created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json([
            'product' => $product,
            'message' => 'Product retrieved successfully'
        ], 200);   
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            "tile" => "required|string",
        ]);

        if ($request->hasFile("banner_image")) { 
            if($product->banner_image){
                Storage::disk("public")->delete($product->banner_image);
            }
            $data["banner_image"] = $request->file("banner_image")->store("products", "public");
        } 

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ], 200);
    }
}
