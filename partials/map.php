<div id="map">
  <div id="background-pattern-holder">
    <?php
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-1.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-2.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-3.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-4.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-5.svg');
    ?>
  </div>

<?php
  for ($i = 1; $i < 10; $i++) {
    $image_id = IGV_get_option('_igv_image_options', '_igv_' . $i . '_image_id');
    $mp4 = IGV_get_option('_igv_image_options', '_igv_' . $i . '_mp4');
    $webm = IGV_get_option('_igv_image_options', '_igv_' . $i . '_webm');
    $ogv = IGV_get_option('_igv_image_options', '_igv_' . $i . '_ovg');
?>
  <div class="map-block">
    <div class="map-block-content">
      <?php
        if (empty($mp4)) {
          echo wp_get_attachment_image($image_id, 'map');
        } else if ($mp4 && $webm) {
          $poster = wp_get_attachment_image_src($image_id, 'map');
      ?>
      <video autoplay muted poster="<?php echo $poster[0]; ?>">
        <source src="<?php echo $mp4; ?>" type="video/mp4" />
        <source src="<?php echo $webm; ?>" type="video/webm" />
      <?php
        if ($ogv) {
      ?>
        <source src="<?php echo $ogv; ?>" type="video/ogv" />
      <?php
        }
      ?>
      </video>
      <?php
        }
      ?>
    </div>
  </div>
<?php
  }
?>
</div>

<div id="lat-long">
  37° 47' 12.484", -122° 24' 0.9223"
</div>
