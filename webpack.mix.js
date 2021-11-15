const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

// mix.js('resources/js/app.js', 'public/js').postCss('resources/css/app.css', 'public/css', [
//     require('postcss-import'),
//     require('tailwindcss'),
//     require('autoprefixer'),
// ]).vue({ version: 2 });


mix.scripts('node_modules/socket.io/client-dist/socket.io.js', 'public/js/socket.io/socket.io.js');
mix.js('resources/js/video/main.js', 'public/js/main.js');
mix.js('resources/js/dashboard/setSocketInstance.js', 'public/js/dashboard.js');