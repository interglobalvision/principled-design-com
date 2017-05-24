<?php
// SITE OPTIONS
$prefix = '_igv_';
$suffix = '_options';

$page_key = $prefix . 'image' . $suffix;
$page_title = 'Image Options';

$fields = array();

for ($i = 1; $i < 10; $i++) {
  $fields[] = array(
    'name' => __( 'Map Grid ' . $i, 'cmb2' ),
    'desc' => __( '', 'cmb2' ),
    'id'   => $prefix . $i . '_title',
    'type' => 'title',
  );

  $fields[] = array(
    'name' => __( 'Image', 'IGV' ),
    'desc' => __( '', 'cmb2' ),
    'id'   => $prefix . $i . '_image',
    'type' => 'file',
  );

  $fields[] = array(
    'name'    => __( 'MP4 Video', 'IGV' ),
    'desc'    => __( 'if displaying as a video (optional)', 'IGV' ),
    'id'      => $prefix . $i . '_mp4',
    'type'    => 'file',
  );

  $fields[] = array(
    'name'    => __( 'WEBM Video', 'IGV' ),
    'desc'    => __( 'if displaying as a video (optional)', 'IGV' ),
    'id'      => $prefix . $i . '_webm',
    'type'    => 'file',
  );

  $fields[] = array(
    'name'    => __( 'OGV Video', 'IGV' ),
    'desc'    => __( 'if displaying as a video (optional)', 'IGV' ),
    'id'      => $prefix . $i . '_ogv',
    'type'    => 'file',
  );
}

$metabox = array(
  'id'         => $page_key, //id used as tab page slug, must be unique
  'title'      => $page_title,
  'show_on'    => array( 'key' => 'options-page', 'value' => array( $page_key ), ), //value must be same as id
  'show_names' => true,
  'fields'     => $fields
);

IGV_init_options_page($page_key, $page_key, $page_title, $metabox);
