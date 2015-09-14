<?php
/**
 * Created by PhpStorm.
 * User: Reymundo.Ramos
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('content-type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set("display_errors", 1);

$json_data = json_decode(file_get_contents('https://dev-eligibility-phoenix.labcorp.com/reyramos/builds/build.json'));

echo json_encode($json_data);



