<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title><?php wp_title('|',true,'right'); bloginfo('name'); ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">

  <?php
    get_template_part('partials/globie');
    get_template_part('partials/seo');
  ?>

  <link rel="alternate" type="application/rss+xml" title="<?php bloginfo('name'); ?> RSS Feed" href="<?php bloginfo('rss2_url'); ?>" />

  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/manifest.json">
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000">
  <meta name="theme-color" content="#ffffff">

  <?php if (is_singular() && pings_open(get_queried_object())) { ?>
  <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
  <?php } ?>
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<!--[if lt IE 9]><p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p><![endif]-->

<section id="main-container">
  <nav id="header" class="font-calibre-bold">
    <h1 id="header-name" class="u-pointer"><?php bloginfo('name'); ?></h1>

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
    <ul id="header-menu">
<?php
  while ( $query->have_posts() ) {
    $query->the_post();
?>

      <li class="header-menu-item" data-slug="<?php echo $post->post_name; ?>"><a href="#!/<?php echo $post->post_name; ?>"><?php the_title(); ?></a></li>

<?php
  }
?>
    </ul>
<?php
}

wp_reset_postdata();
?>

    <?php get_template_part('partials/minimap'); ?>

  </nav>
