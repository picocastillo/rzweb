<?php

namespace App\Http\Controllers;
use App\Models\Order;


use Illuminate\Http\Request;

class OrderController extends Controller
{
    function index(){
        Order::createWithInitialState(
            [
                "items" => [
                    [
                        "product_id" => 2,
                        "qty" => 3
                    ],
                    [
                        "product_id" => 1,
                        "qty" => 1
                    ],
                    [
                        "product_id" => 3,
                        "qty" => 4
                    ],

                ],
                "code" =>"asdasd123123",
                "date_from" =>now(),
                "date_to" =>now(),
                "address" => "Lisandro 3045",
                "user_id" => \Auth::user()->id,
                "client_id" => 1,

            ]
            );
            return "SUCESS";

    }
}
