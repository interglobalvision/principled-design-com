<?php
// SITE OPTIONS
$prefix = '_igv_';
$suffix = '_options';

$page_key = $prefix . 'image' . $suffix;
$page_title = 'Image Options';

$fields = array(
  array(
    'name' => __( 'Image', 'IGV' ),
    'desc' => __( '', 'cmb2' ),
    'id'   => 'image',
    'type' => 'file',
  ),
  array(
    'name'    => __( 'MP4 Video', 'IGV' ),
    'desc'    => __( 'if displaying as a video (optional)', 'IGV' ),
    'id'      => 'mp4',
    'type'    => 'file',
  ),
  array(
    'name'    => __( 'WEBM Video', 'IGV' ),
    'desc'    => __( 'if displaying as a video (optional)', 'IGV' ),
    'id'      => 'webm',
    'type'    => 'file',
  ),
);

$metabox = array(
  'id'         => $page_key, //id used as tab page slug, must be unique
  'title'      => $page_title,
  'show_on'    => array( 'key' => 'options-page', 'value' => array( $page_key ), ), //value must be same as id
  'show_names' => true,
  'fields'     => array(
    array(
      'name' => __( 'Map Grid Group', 'cmb2' ),
      'desc' => __( '', 'cmb2' ),
      'id'   => $prefix . 'map_grid_group',
      'type' => 'group',
      'repeatable'  => true,
      'options'     => array(
        'group_title'   => __( 'Item {#}', 'cmb2' ),
        'add_button'    => __( 'Add Another Item', 'cmb2' ),
        'remove_button' => __( 'Remove Item', 'cmb2' ),
        'sortable'      => true,
      ),
      'fields' => $fields,
    ),
  ),
);

IGV_init_options_page($page_key, $page_key, $page_title, $metabox);
