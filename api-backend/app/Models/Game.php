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
        'banner_image',
        'rawg_id',
        'rating',
        'released',
        'developers',
        'raw_genres',
        'raw_platforms',
        'users',
    ];

    protected $casts = [
        'developers' => 'array',
        'raw_genres' => 'array',
        'raw_platforms' => 'array',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }
}
