<!DOCTYPE html>
<html>
<head>
    <title>Your Weekly Game Recommendations</title>
</head>
<body style="font-family: 'Courier New', Courier, monospace; background-color: #000; color: #fff; padding: 20px; line-height: 1.6;">
    <h1 style="color: #2563eb; letter-spacing: 2px;">WEEKLY GAME RECOMMENDATIONS</h1>
    <h2 style="font-weight: normal; margin-top: 0;">Hello {{ $user->name }},</h2>
    <p style="opacity: 0.8;">Here are your personalized game recommendations for the week.</p>
    
    @foreach ($recommendations as $game)
        <div style="border: 1px dashed #333; margin-bottom: 20px; padding: 20px; background-color: #111;">
            <div style="background-color: #2563eb; color: #fff; display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: bold; letter-spacing: 1px;">
                RECOMMENDED
            </div>
            <h3 style="color: #fff; text-transform: uppercase; margin-bottom: 5px;">{{ $game->title }}</h3>
            
            <p style="margin-top: 5px; font-size: 12px; color: #60a5fa;">> REASON: {{ $game->recommendation_reason }}</p>
            
            <table style="width: 100%; max-width: 600px; margin-top: 15px;">
                <tr>
                    <td style="width: 200px; vertical-align: top;">
                        @if ($game->banner_image)
                        <img src="{{ $game->banner_image }}" alt="{{ $game->title }}" style="width: 100%; max-width: 200px; height: auto; border: 1px solid #333; filter: grayscale(50%);" />
                        @else
                        <div style="width: 200px; height: 112px; background-color: #222; border: 1px solid #333; text-align: center; line-height: 112px; font-size: 10px; color: #666;">NO_IMAGE_DATA</div>
                        @endif
                    </td>
                    <td style="padding-left: 20px; vertical-align: top; font-size: 14px;">
                        <strong>Platform:</strong> {{ $game->platform }}<br/><br/>
                        <strong>Genre:</strong> {{ $game->genre }}<br/><br/>
                        <strong>Rating:</strong> {{ $game->rating ?? 'N/A' }} / 5.00
                    </td>
                </tr>
            </table>

            <div style="margin-top: 20px;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/games/{{ $game->id }}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 1px; display: inline-block;">VIEW DETAILS</a>
            </div>
        </div>
    @endforeach

    <hr style="border-top: 1px dashed #333; border-bottom: none; border-left: none; border-right: none; margin: 40px 0;" />
    
    <p style="font-size: 10px; color: #666; letter-spacing: 1px;">
        You are receiving this automated email because you opted into weekly recommendations.<br/>
        To unsubscribe, visit your <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/profile" style="color: #60a5fa; text-decoration: underline;">Profile Settings</a>.
    </p>
</body>
</html>
