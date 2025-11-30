<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        return Notification::with('order')
            ->orderBy('id', 'desc')
            ->get();
    }
}
