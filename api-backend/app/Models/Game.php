<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'title',
        'description',
        'genre',
        'platform',
        'cost',
        'banner_image',
    ];
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }   
}
