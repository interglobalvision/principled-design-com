<?php
$args = array(
  'post_type'      => array( 'page' ),
  'posts_per_page' => '-1',
  'orderby'        => 'menu_order',
  'order'          => 'ASC',
);

$query = new WP_Query( $args );

if ( $query->have_posts() ) {
?>
    <ul id="mobile-menu" class="page-content font-calibre-bold">
<?php
  while ( $query->have_posts() ) {
    $query->the_post();
?>
      <li class="mobile-menu-item u-pointer" data-slug="<?php echo $post->post_name; ?>"><?php the_title(); ?></li>
<?php
  }
?>
    </ul>
<?php
}

wp_reset_postdata();
?>