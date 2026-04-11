<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Support\Facades\Mail;
use App\Mail\WeeklyRecommendationsMail;
use Illuminate\Support\Facades\Log;

class SendWeeklyRecommendations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recommendations:weekly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send weekly game recommendations to opted-in users';

    /**
     * Execute the console command.
     */
    public function handle(RecommendationService $recommendationService)
    {
        $users = User::where('receives_recommendation_emails', true)->get();

        $count = 0;
        foreach ($users as $user) {
            $recommendations = $recommendationService->getRecommendations($user);

            if ($recommendations->isNotEmpty()) {
                Mail::to($user->email)->send(new WeeklyRecommendationsMail($user, $recommendations));
                $count++;
            }
        }

        $this->info("Weekly recommendations sent successfully to {$count} distinct profiles.");
        Log::info("Sent weekly recommendations to {$count} users.");
    }
}
