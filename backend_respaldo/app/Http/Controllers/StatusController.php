<?php

namespace App\Http\Controllers;

use App\Models\OrderStatus;

class StatusController extends Controller
{
    public function index()
    {
        return OrderStatus::orderBy('id')->get();
    }
}
