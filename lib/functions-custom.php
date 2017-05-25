<?php
require "dbip-client.class.php";

// Custom functions (like special queries, etc)

function get_client_geolocation() {
  $api_key = IGV_get_option('_igv_site_options', '_igv_dbip_api_key');

  if ($api_key) {
    $dbip = new DBIP_Client($api_key);
    $client_ip = get_client_ip();

    return $dbip->Get_Address_Info($client_ip);
  } else {
    return false;
  }

}

// Return a string of the client ip
function get_client_ip() {
  if (!empty( $_SERVER['HTTP_CLIENT_IP'])) { //check ip from share internet

    $ip = $_SERVER['HTTP_CLIENT_IP'];

  } elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) { //to check ip is pass from proxy

    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];

  } else {

    $ip = $_SERVER['REMOTE_ADDR'];

  }

  return apply_filters( 'wpb_get_ip', $ip );
}
